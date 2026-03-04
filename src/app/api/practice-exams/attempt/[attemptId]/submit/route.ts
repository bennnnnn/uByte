import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAttempt, getAnswers, submitAttempt, saveAnswer } from "@/lib/db/exam-attempts";
import { getCorrectAndExplanation } from "@/lib/db/exam-questions";
import { createCertificate } from "@/lib/db/exam-certificates";
import { withErrorHandling } from "@/lib/api-utils";

/** POST /api/practice-exams/attempt/[attemptId]/submit — body: { answers: { questionId: chosenIndex }[] }. Validate, score, pass/fail, create certificate if pass. */
export const POST = withErrorHandling(
  "POST /api/practice-exams/attempt/[attemptId]/submit",
  async (request: NextRequest, context?: unknown) => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { attemptId } = (context as { params?: Promise<{ attemptId: string }> }).params
      ? await (context as { params: Promise<{ attemptId: string }> }).params
      : { attemptId: "" };
    const attempt = await getAttempt(attemptId);
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.submitted_at) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    const body = await request.json();
    const answers = body?.answers as Record<string, number> | undefined;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers object required" }, { status: 400 });
    }

    for (const [qId, chosenIndex] of Object.entries(answers)) {
      if (typeof chosenIndex !== "number") continue;
      await saveAnswer(attemptId, parseInt(qId, 10), chosenIndex);
    }

    const savedAnswers = await getAnswers(attemptId);
    let correct = 0;
    const results: { questionId: number; correct: boolean; explanation: string | null }[] = [];

    for (const a of savedAnswers) {
      const meta = await getCorrectAndExplanation(a.question_id);
      const right = meta && meta.correct_index === a.chosen_index;
      if (right) correct++;
      results.push({
        questionId: a.question_id,
        correct: !!right,
        explanation: meta?.explanation ?? null,
      });
    }

    const total = attempt.question_ids_json.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= 70; // 70% to pass
    await submitAttempt(attemptId, score, passed);

    let certificateId: string | null = null;
    if (passed) {
      certificateId = await createCertificate(user.userId, attempt.lang, attemptId);
    }

    return NextResponse.json({
      score,
      passed,
      correct,
      total,
      certificateId,
      results,
    });
  }
);
