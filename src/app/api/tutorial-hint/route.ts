import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCachedAiResponse, setCachedAiResponse } from "@/lib/db/ai-feedback-responses";
import { canMakeAiCall, getLifetimeAiHintCount, incrementTodayAiUsage, isInCooldown, setLastAiCallAt, AI_COOLDOWN_SECONDS, FREE_HINT_LIMIT } from "@/lib/db/ai-usage";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { isFeatureEnabled } from "@/lib/db/site-settings";
import { callAiFeedback } from "@/lib/ai/feedback-client";
import { withErrorHandling, protectedRoute, parseJsonBody } from "@/lib/api-utils";
import { tutorialHintBodySchema } from "@/lib/api-schemas";
import { getSteps } from "@/lib/tutorial-steps";
import { isSupportedLanguage } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

const MODEL_NAME = "gemini-2.5-flash";

/** POST /api/tutorial-hint — returns structured AI hint for a failing tutorial step. */
export const POST = withErrorHandling(
  "POST /api/tutorial-hint",
  protectedRoute({ rateLimitKey: "tutorial-hint", rateLimitMax: 20 }, async (request, user) => {
  if (!await isFeatureEnabled("ai_enabled")) {
    return NextResponse.json({ error: "AI features are currently unavailable" }, { status: 503 });
  }

  const parsed = await parseJsonBody(request, tutorialHintBodySchema);
  if (parsed.error) return parsed.error;

  const {
    tutorialSlug,
    stepIndex,
    lang: rawLang = "go",
    code = "",
    actualOutput,
    isError,
    failureKind,
  } = parsed.data;
  const lang = isSupportedLanguage(rawLang) ? rawLang : "go";

  // Look up the step server-side so the client never needs to send step content
  const steps = getSteps(lang as SupportedLanguage, tutorialSlug);
  const step = steps[stepIndex];
  if (!step) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  const normalizedFailureKind =
    failureKind === "compile" || failureKind === "task" || failureKind === "output"
      ? failureKind
      : null;
  const verdict =
    isError || normalizedFailureKind === "compile"
      ? "compile_error"
      : normalizedFailureKind === "task"
      ? "task_incomplete"
      : "wrong_output";
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

  // Plan check — free users get FREE_HINT_LIMIT lifetime hints before upgrade is required.
  const [dbUser, proFeaturesEnabled] = await Promise.all([getUserById(user.userId), isFeatureEnabled("pro_features_enabled")]);
  if (proFeaturesEnabled && !hasPaidAccess(dbUser?.plan)) {
    const lifetimeUsed = await getLifetimeAiHintCount(user.userId);
    if (lifetimeUsed >= FREE_HINT_LIMIT) {
      return NextResponse.json(
        { error: "upgrade_required", hintsUsed: lifetimeUsed, limit: FREE_HINT_LIMIT },
        { status: 402 }
      );
    }
  }

  // Cache hit — return immediately at no cost (Pro users only reach this point)
  const cached = await getCachedAiResponse(cacheKey);
  if (cached) return NextResponse.json(cached);

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
  const MAX_CODE = 4000;   // ~100 lines — more than enough for a tutorial step
  const MAX_OUTPUT = 800;  // truncate runaway outputs before they inflate tokens
  const safeOutput = String(actualOutput ?? "").slice(0, MAX_OUTPUT);
  const summary = [
    `Lesson: ${step.title}`,
    `Task: ${step.instruction}`,
    verdict === "wrong_output" && step.expectedOutput.length > 0
      ? `Expected output:\n${step.expectedOutput.join("\n")}`
      : "",
    verdict === "task_incomplete" && safeOutput
      ? `Validation feedback: ${safeOutput}`
      : "",
  ].filter(Boolean).join("\n");

  const truncatedCode = code.trim().replace(/\n{3,}/g, "\n\n");
  const safeCode = truncatedCode.length > MAX_CODE
    ? truncatedCode.slice(0, MAX_CODE) + "\n…(truncated)"
    : truncatedCode;

  const evidenceBundle = [
    "## Tutorial lesson\n" + (summary.length > MAX ? summary.slice(0, MAX) + "…" : summary),
    "\n## Language\n" + lang,
    "\n## User code\n```\n" + safeCode + "\n```",
    "\n## Verdict\n" + verdict,
    safeOutput
      ? verdict === "task_incomplete"
        ? "\n## Validation feedback\n" + safeOutput
        : verdict === "compile_error"
        ? "\n## Compiler output\n" + safeOutput
        : "\n## Actual output\n" + safeOutput
      : "",
  ].filter(Boolean).join("\n");

  const firstName = user.name?.split(" ")[0] ?? undefined;
  const response = await callAiFeedback(evidenceBundle, 1, verdict, firstName);

  // Only cache genuine AI responses — never cache error fallbacks.
  const isErrorFallback = response.root_cause === "ai_unavailable" || response.root_cause === "no_ai_config" || response.confidence === 0;
  if (!isErrorFallback) {
    await setCachedAiResponse(cacheKey, response as unknown as Record<string, unknown>);
    await incrementTodayAiUsage(user.userId);
    await setLastAiCallAt(user.userId);
  }

  return NextResponse.json(response);
  }),
);
