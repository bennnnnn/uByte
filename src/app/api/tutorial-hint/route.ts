import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { getCachedAiResponse, setCachedAiResponse } from "@/lib/db/ai-feedback-responses";
import { canMakeAiCall, getLifetimeAiHintCount, incrementTodayAiUsage, isInCooldown, setLastAiCallAt, AI_COOLDOWN_SECONDS, FREE_HINT_LIMIT } from "@/lib/db/ai-usage";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { callAiFeedback } from "@/lib/ai/feedback-client";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSteps } from "@/lib/tutorial-steps";
import type { SupportedLanguage } from "@/lib/languages/types";

const MODEL_NAME = "gpt-oss-120b";

/** POST /api/tutorial-hint — returns structured AI hint for a failing tutorial step. */
export const POST = withErrorHandling("POST /api/tutorial-hint", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to use AI hints" }, { status: 401 });
  }

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  // Hard burst limit — prevents hammering before the per-user AI quota check
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`tutorial-hint:${ip}:${user.userId}`, 20, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  const body = await request.json();
  const { tutorialSlug, stepIndex, lang, code, actualOutput, isError } = body ?? {};

  if (!tutorialSlug || !lang || typeof code !== "string" || typeof stepIndex !== "number") {
    return NextResponse.json({ error: "tutorialSlug, stepIndex, lang, and code required" }, { status: 400 });
  }

  // Look up the step server-side so the client never needs to send step content
  const steps = getSteps(lang as SupportedLanguage, tutorialSlug);
  const step = steps[stepIndex];
  if (!step) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  const verdict = isError ? "compile_error" : "wrong_output";
  const codeHash = createHash("sha256").update(code.trim()).digest("hex");
  const outputSnippet = String(actualOutput ?? "").slice(0, 200);
  const failureSignature = `${verdict}:${outputSnippet}`;

  const cacheKey = {
    problemId: `tutorial:${lang}:${tutorialSlug}:${stepIndex}`,
    language: lang,
    codeHash,
    verdict,
    failureSignature,
    hintLevel: 1,
    modelName: MODEL_NAME,
  };

  // Cache hit — return immediately at no cost
  const cached = await getCachedAiResponse(cacheKey);
  if (cached) return NextResponse.json(cached);

  // Free-plan lifetime limit check
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

  // Daily quota check (Pro users)
  const { allowed, used, limit } = await canMakeAiCall(user.userId);
  if (!allowed) {
    return NextResponse.json(
      { error: "Daily AI limit reached", message: `You've used ${used} of ${limit} AI hints today. Try again tomorrow.` },
      { status: 429 }
    );
  }

  // Cooldown check
  if (await isInCooldown(user.userId)) {
    return NextResponse.json(
      { error: "Please wait", message: `Wait ${AI_COOLDOWN_SECONDS} seconds between AI requests.` },
      { status: 429 }
    );
  }

  // Build evidence bundle from step content + user code + output
  const MAX = 1200;
  const summary = [
    `Lesson: ${step.title}`,
    `Task: ${step.instruction}`,
    step.expectedOutput.length > 0 ? `Expected output: ${step.expectedOutput.join(", ")}` : "",
  ].filter(Boolean).join("\n");

  const evidenceBundle = [
    "## Tutorial lesson\n" + (summary.length > MAX ? summary.slice(0, MAX) + "…" : summary),
    "\n## Language\n" + lang,
    "\n## User code\n```\n" + code.trim().replace(/\n{3,}/g, "\n\n") + "\n```",
    "\n## Verdict\n" + verdict,
    actualOutput ? "\n## Actual output\n" + String(actualOutput).slice(0, 800) : "",
  ].filter(Boolean).join("\n");

  const firstName = user.name?.split(" ")[0] ?? undefined;
  const response = await callAiFeedback(evidenceBundle, 1, verdict, firstName);

  await setCachedAiResponse(cacheKey, response as unknown as Record<string, unknown>);
  await incrementTodayAiUsage(user.userId);
  await setLastAiCallAt(user.userId);

  return NextResponse.json(response);
});
