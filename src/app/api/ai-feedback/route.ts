import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSubmissionById } from "@/lib/db/submissions";
import { getCachedAiResponse, setCachedAiResponse } from "@/lib/db/ai-feedback-responses";
import { canMakeAiCall, incrementTodayAiUsage, isInCooldown, setLastAiCallAt, AI_COOLDOWN_SECONDS } from "@/lib/db/ai-usage";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { buildEvidenceBundle, buildFailureSignature } from "@/lib/ai/evidence-bundle";
import { runHeuristics } from "@/lib/ai/heuristics";
import { callAiFeedback } from "@/lib/ai/feedback-client";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";

const MODEL_NAME = "grok-4";

/** POST /api/ai-feedback — submission_id, hint_level (1-4). Returns cached or heuristic or AI JSON. */
export const POST = withErrorHandling("POST /api/ai-feedback", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to use AI feedback" }, { status: 401 });
  }

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

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
  const response = await callAiFeedback(evidenceBundle, hintLevel, submission.verdict);

  await setCachedAiResponse(cacheKey, response as unknown as Record<string, unknown>);
  await incrementTodayAiUsage(user.userId);
  await setLastAiCallAt(user.userId);

  return NextResponse.json(response);
});
