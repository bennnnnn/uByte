import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSubmissionById } from "@/lib/db/submissions";
import { getCachedAiResponse, setCachedAiResponse } from "@/lib/db/ai-feedback-responses";
import { canMakeAiCall, getLifetimeAiHintCount, incrementTodayAiUsage, isInCooldown, setLastAiCallAt, AI_COOLDOWN_SECONDS, FREE_HINT_LIMIT } from "@/lib/db/ai-usage";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { buildEvidenceBundle, buildFailureSignature } from "@/lib/ai/evidence-bundle";
import { runHeuristics } from "@/lib/ai/heuristics";
import { callAiFeedback } from "@/lib/ai/feedback-client";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { HINTS_MODEL } from "@/lib/ai/gateway-client";

const MODEL_NAME = HINTS_MODEL;

/** POST /api/ai-feedback — submission_id, hint_level (1-4). Returns cached or heuristic or AI JSON. */
export const POST = withErrorHandling("POST /api/ai-feedback", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to use AI feedback" }, { status: 401 });
  }

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  // Hard burst limit — prevents hammering before the per-user AI quota check
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`ai-feedback:${ip}:${user.userId}`, 20, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  const body = await request.json();
  const submissionId = body?.submission_id != null ? Number(body.submission_id) : NaN;
  const hintLevel = body?.hint_level != null ? Number(body.hint_level) : 1;

  if (!Number.isInteger(submissionId) || submissionId < 1) {
    return NextResponse.json({ error: "submission_id required" }, { status: 400 });
  }
  if (![1, 2, 3, 4].includes(hintLevel)) {
    return NextResponse.json({ error: "hint_level must be 1, 2, 3, or 4" }, { status: 400 });
  }

  const submission = await getSubmissionById(submissionId);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (submission.user_id !== user.userId) {
    return NextResponse.json({ error: "Not your submission" }, { status: 403 });
  }

  const problem = getPracticeProblemBySlug(submission.problem_id);
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const failureSignature = buildFailureSignature(submission);

  // Heuristics first (no AI)
  const heuristic = runHeuristics(submission);
  if (heuristic && hintLevel === 1) {
    return NextResponse.json(heuristic);
  }

  // Cache lookup
  const cacheKey = {
    problemId: submission.problem_id,
    language: submission.language,
    codeHash: submission.code_hash,
    verdict: submission.verdict,
    failureSignature,
    hintLevel,
    modelName: MODEL_NAME,
  };
  const cached = await getCachedAiResponse(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

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

  // Quota
  const { allowed, used, limit } = await canMakeAiCall(user.userId);
  if (!allowed) {
    return NextResponse.json(
      {
        error: "Daily AI limit reached",
        message: `You've used ${used} of ${limit} AI hints today. Try again tomorrow.`,
      },
      { status: 429 }
    );
  }

  // Cooldown
  if (await isInCooldown(user.userId)) {
    return NextResponse.json(
      {
        error: "Please wait",
        message: `Wait ${AI_COOLDOWN_SECONDS} seconds between AI requests.`,
      },
      { status: 429 }
    );
  }

  const evidenceBundle = buildEvidenceBundle(submission, problem);
  // Use only the first name so the AI greeting feels natural ("Hey Alex!" not "Hey Alex Smith!")
  const firstName = user.name?.split(" ")[0] ?? undefined;
  const response = await callAiFeedback(evidenceBundle, hintLevel, submission.verdict, firstName);

  await setCachedAiResponse(cacheKey, response as unknown as Record<string, unknown>);
  await incrementTodayAiUsage(user.userId);
  await setLastAiCallAt(user.userId);

  return NextResponse.json(response);
});
