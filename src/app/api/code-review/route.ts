import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { canMakeAiCall, getLifetimeAiHintCount, incrementTodayAiUsage, isInCooldown, setLastAiCallAt, AI_COOLDOWN_SECONDS, FREE_HINT_LIMIT } from "@/lib/db/ai-usage";
import { getCachedAiResponse, setCachedAiResponse } from "@/lib/db/ai-feedback-responses";
import { callCodeReview } from "@/lib/ai/code-review-client";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

const SUPPORTED_LANGS: SupportedLanguage[] = ALL_LANGUAGE_KEYS;

/** POST /api/code-review — full AI code review for any submitted code. */
export const POST = withErrorHandling("POST /api/code-review", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to use AI code review" }, { status: 401 });

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`review:${ip}`, 10, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const { code, lang, problem_title, verdict } = body ?? {};

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  if (!lang || !SUPPORTED_LANGS.includes(lang)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  // Free-plan limit — shares the same AI hint quota
  const dbUser = await getUserById(user.userId);
  if (!hasPaidAccess(dbUser?.plan)) {
    const lifetimeUsed = await getLifetimeAiHintCount(user.userId);
    if (lifetimeUsed >= FREE_HINT_LIMIT) {
      return NextResponse.json(
        { error: "upgrade_required", hintsUsed: lifetimeUsed, limit: FREE_HINT_LIMIT },
        { status: 402 }
      );
    }
  }

  const { allowed, used, limit } = await canMakeAiCall(user.userId);
  if (!allowed) {
    return NextResponse.json(
      { error: "Daily AI limit reached", message: `You've used ${used} of ${limit} AI calls today.` },
      { status: 429 }
    );
  }

  if (await isInCooldown(user.userId)) {
    return NextResponse.json(
      { error: "Please wait", message: `Wait ${AI_COOLDOWN_SECONDS} seconds between AI requests.` },
      { status: 429 }
    );
  }

  // Cache key based on code + language + problem context
  const codeHash = createHash("sha256").update(code.trim()).digest("hex");
  const cacheKey = {
    problemId: `review:${lang}:${problem_title ?? "untitled"}`,
    language: lang,
    codeHash,
    verdict: verdict ?? "none",
    failureSignature: "review",
    hintLevel: 0,
    modelName: "gemini-2.5-flash",
  };

  const cached = await getCachedAiResponse(cacheKey);
  if (cached) return NextResponse.json(cached);

  const firstName = user.name?.split(" ")[0] ?? undefined;
  const review = await callCodeReview(code, lang, problem_title, verdict, firstName);

  if (review.score > 0) {
    await setCachedAiResponse(cacheKey, review as unknown as Record<string, unknown>);
    await incrementTodayAiUsage(user.userId);
    await setLastAiCallAt(user.userId);
  }

  return NextResponse.json(review);
});
