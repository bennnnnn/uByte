import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAttempt } from "@/lib/db/exam-attempts";
import { getQuestionsByIds } from "@/lib/db/exam-questions";
import { getExamConfigForLang } from "@/lib/db/exam-settings";
import { hasAttemptExpired } from "@/lib/exams/attempt-utils";
import { withErrorHandling } from "@/lib/api-utils";

/** GET /api/practice-exams/attempt/[attemptId] — return attempt metadata + questions (no correct answers). */
export const GET = withErrorHandling(
  "GET /api/practice-exams/attempt/[attemptId]",
  async (_req: Request, context?: unknown) => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { attemptId } = (context as { params?: Promise<{ attemptId: string }> }).params
      ? await (context as { params: Promise<{ attemptId: string }> }).params
      : { attemptId: "" };
    const attempt = await getAttempt(attemptId);
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.submitted_at) return NextResponse.json({ error: "Attempt already submitted" }, { status: 400 });

    const { examDurationMinutes } = await getExamConfigForLang(attempt.lang);
    if (hasAttemptExpired(attempt.started_at, examDurationMinutes)) {
      return NextResponse.json({ error: "Exam time limit exceeded" }, { status: 410 });
    }

    const questions = await getQuestionsByIds(attempt.question_ids_json, attempt.choices_order_json);

    return NextResponse.json({
      attemptId: attempt.id,
      lang: attempt.lang,
      startedAt: attempt.started_at,
      durationMinutes: examDurationMinutes,
      questions: questions.map((q) => ({ id: q.id, prompt: q.prompt, choices: q.choices })),
    });
  }
);
