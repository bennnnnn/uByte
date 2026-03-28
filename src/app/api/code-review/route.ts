import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { canMakeAiCall, getLifetimeAiHintCount, incrementTodayAiUsage, isInCooldown, setLastAiCallAt, AI_COOLDOWN_SECONDS, FREE_HINT_LIMIT } from "@/lib/db/ai-usage";
import { getCachedAiResponse, setCachedAiResponse } from "@/lib/db/ai-feedback-responses";
import { callCodeReview, callInterviewDebrief } from "@/lib/ai/code-review-client";
import type { InterviewContext } from "@/lib/ai/code-review-client";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";

const SUPPORTED_LANGS: SupportedLanguage[] = ALL_LANGUAGE_KEYS;

/** POST /api/code-review — full AI code review or interview debrief. */
export const POST = withErrorHandling("POST /api/code-review", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to use AI code review" }, { status: 401 });

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`review:${ip}`, 10, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const {
    code,
    lang,
    problem_title,
    verdict,
    // Interview-specific fields
    is_interview,
    problem_slug,
    time_taken_seconds,
    time_allowed_seconds,
    passed_cases,
    total_cases,
  } = body ?? {};

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  if (!lang || !SUPPORTED_LANGS.includes(lang)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  // Pro-only feature
  const dbUser = await getUserById(user.userId);
  if (!hasPaidAccess(dbUser?.plan)) {
    const lifetimeUsed = await getLifetimeAiHintCount(user.userId);
    return NextResponse.json(
      { error: "upgrade_required", hintsUsed: lifetimeUsed, limit: FREE_HINT_LIMIT },
      { status: 402 }
    );
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

  const firstName = user.name?.split(" ")[0] ?? undefined;

  // ── Interview debrief path ────────────────────────────────────────────────
  if (is_interview) {
    const timeTaken = typeof time_taken_seconds === "number" ? Math.max(0, Math.round(time_taken_seconds)) : 0;
    const timeAllowed = typeof time_allowed_seconds === "number" ? Math.max(60, Math.round(time_allowed_seconds)) : 2700; // default 45 min
    const passedCasesN = typeof passed_cases === "number" ? passed_cases : 0;
    const totalCasesN = typeof total_cases === "number" ? total_cases : 0;
    const verdictStr = typeof verdict === "string" ? verdict : "unknown";

    // Look up problem difficulty server-side (don't trust client)
    const problem = problem_slug ? getPracticeProblemBySlug(problem_slug) : null;
    const difficulty = problem?.difficulty ?? "medium";
    const title = problem?.title ?? (typeof problem_title === "string" ? problem_title : "Coding Problem");

    const interviewCtx: InterviewContext = {
      timeTakenSeconds: timeTaken,
      timeAllowedSeconds: timeAllowed,
      verdict: verdictStr,
      passedCases: passedCasesN,
      totalCases: totalCasesN,
    };

    // Cache key includes timing bucket (rounded to 5 min) so similar attempts can share a response
    const codeHash = createHash("sha256").update(code.trim()).digest("hex");
    const timeBucket = Math.round(timeTaken / 300) * 300;
    const cacheKey = {
      problemId: `interview:${lang}:${problem_slug ?? title}`,
      language: lang,
      codeHash,
      verdict: verdictStr,
      failureSignature: `${passedCasesN}/${totalCasesN}:t=${timeBucket}`,
      hintLevel: 0,
      modelName: "gemini-2.5-flash",
    };

    const cached = await getCachedAiResponse(cacheKey);
    if (cached) return NextResponse.json(cached);

    const debrief = await callInterviewDebrief(code, lang, title, difficulty, interviewCtx, firstName);

    if (debrief.score > 0) {
      await setCachedAiResponse(cacheKey, debrief as unknown as Record<string, unknown>);
      await incrementTodayAiUsage(user.userId);
      await setLastAiCallAt(user.userId);
    }

    return NextResponse.json(debrief);
  }

  // ── Normal code review path ───────────────────────────────────────────────
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

  const review = await callCodeReview(code, lang, problem_title, verdict, firstName);

  if (review.score > 0) {
    await setCachedAiResponse(cacheKey, review as unknown as Record<string, unknown>);
    await incrementTodayAiUsage(user.userId);
    await setLastAiCallAt(user.userId);
  }

  return NextResponse.json(review);
});
