import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { insertSubmission, getConsecutiveFailures } from "@/lib/db/submissions";
import { savePracticeAttempt, addXp, getUserById } from "@/lib/db";
import { hasPaidAccess, isPracticeProblemFree } from "@/lib/plans";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { runJudge } from "@/lib/practice/judge-runner";
import type { SubmissionVerdict } from "@/lib/db/submissions";
import { PRACTICE_PROBLEMS } from "@/lib/practice/problems";

const XP_BY_DIFFICULTY: Record<string, number> = { easy: 10, medium: 20, hard: 40 };

function normalizeCodeForHash(code: string): string {
  return code.replace(/\r\n/g, "\n").trim().replace(/\n{3,}/g, "\n\n");
}

function codeHash(code: string): string {
  return createHash("sha256").update(normalizeCodeForHash(code)).digest("hex");
}

/** POST /api/submit — submit code, run Judge0, store submission, return verdict + one failing test. */
export const POST = withErrorHandling("POST /api/submit", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`judge:${ip}`, 10, 60_000);
  if (limited) {
    return NextResponse.json(
      { verdict: "error" as const, message: "Too many submissions. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await request.json();
  const { problem_id: problemId, language, code } = body ?? {};

  if (!problemId || !code || !language) {
    return NextResponse.json(
      { verdict: "error" as const, message: "problem_id, code, and language required" },
      { status: 400 }
    );
  }

  const result = await runJudge(String(problemId), String(code), String(language));

  const user = await getCurrentUser();
  const userId = user?.userId ?? null;
  const hash = codeHash(String(code));

  const submissionPromise = insertSubmission({
    userId,
    problemId: String(problemId),
    language: String(language),
    code: String(code),
    codeHash: hash,
    verdict: result.verdict as SubmissionVerdict,
    compileOutput: result.compileOutput ?? null,
    runtimeOutput: result.output ?? null,
    runtimeError: result.runtimeError ?? null,
    failedTestIndex: result.failedTestIndex ?? null,
    failedInput: result.failedInput ?? null,
    failedExpected: result.failedExpected ?? null,
    failedActual: result.failedActual ?? null,
  });

  // Run DB queries in parallel where possible
  const [submissionId, userExtras] = await Promise.all([
    submissionPromise,
    user
      ? Promise.all([
          getConsecutiveFailures(user.userId, String(problemId)),
          getUserById(user.userId),
        ])
      : null,
  ]);

  const response: Record<string, unknown> = {
    submission_id: submissionId,
    verdict: result.verdict,
    message: result.message,
    output: result.output,
    passedCases: result.passedCases,
    totalCases: result.totalCases,
  };
  if (result.failedInput != null) response.failedInput = result.failedInput;
  if (result.failedExpected != null) response.failedExpected = result.failedExpected;
  if (result.failedActual != null) response.failedActual = result.failedActual;

  if (user && userExtras) {
    const [consecutiveFailures, profile] = userExtras;
    (response as Record<string, number>).consecutive_failures = consecutiveFailures;

    const canSaveProgress = hasPaidAccess(profile?.plan) || isPracticeProblemFree(String(problemId));
    if (canSaveProgress) {
      if (result.verdict === "accepted") {
        const { wasFirstSolve } = await savePracticeAttempt(user.userId, String(problemId), "solved");
        if (wasFirstSolve) {
          const problem = PRACTICE_PROBLEMS.find((p) => p.slug === problemId);
          const xp = problem ? (XP_BY_DIFFICULTY[problem.difficulty] ?? 10) : 10;
          await addXp(user.userId, xp);
          (response as Record<string, number>).xpAwarded = xp;
        }
      } else if (["wrong_answer", "compile_error", "runtime_error", "tle"].includes(result.verdict)) {
        await savePracticeAttempt(user.userId, String(problemId), "failed");
      }
    }
  }

  return NextResponse.json(response);
});
