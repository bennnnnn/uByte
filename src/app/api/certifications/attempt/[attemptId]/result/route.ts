import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAttempt } from "@/lib/db/exam-attempts";
import { getCertificateByAttemptId } from "@/lib/db/exam-certificates";
import { withErrorHandling } from "@/lib/api-utils";

/** GET /api/certifications/attempt/[attemptId]/result — return score, passed, certificateId for a submitted attempt (owner only). */
export const GET = withErrorHandling(
  "GET /api/certifications/attempt/[attemptId]/result",
  async (_req: Request, context?: unknown) => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { attemptId } = (context as { params?: Promise<{ attemptId: string }> }).params
      ? await (context as { params: Promise<{ attemptId: string }> }).params
      : { attemptId: "" };
    const attempt = await getAttempt(attemptId);
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!attempt.submitted_at || attempt.score == null || attempt.passed == null) {
      return NextResponse.json({ error: "Attempt not yet submitted" }, { status: 400 });
    }

    const cert = await getCertificateByAttemptId(attemptId);
    const totalQuestions = Array.isArray(attempt.question_ids_json) ? attempt.question_ids_json.length : 0;

    return NextResponse.json({
      score: attempt.score,
      passed: attempt.passed,
      certificateId: cert?.id ?? null,
      totalQuestions,
    });
  }
);
