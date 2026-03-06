import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAttempt, lockAttemptForSubmit, saveAnswersBatch, submitAttempt } from "@/lib/db/exam-attempts";
import { getCorrectAndExplanationBatch } from "@/lib/db/exam-questions";
import { createCertificate } from "@/lib/db/exam-certificates";
import { withErrorHandling } from "@/lib/api-utils";
import { getExamConfigForLang } from "@/lib/db/exam-settings";

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

    // Validate answer keys against the attempt's question IDs
    const validQuestionIds = new Set(attempt.question_ids_json);
    const validatedAnswers: { questionId: number; chosenIndex: number }[] = [];
    for (const [qId, chosenIndex] of Object.entries(answers)) {
      const questionId = parseInt(qId, 10);
      if (isNaN(questionId)) continue;
      if (!validQuestionIds.has(questionId)) continue;
      if (typeof chosenIndex !== "number" || chosenIndex < 0 || chosenIndex > 3) continue;
      validatedAnswers.push({ questionId, chosenIndex });
    }

    // Atomic lock: prevents double-submit race condition
    const locked = await lockAttemptForSubmit(attemptId);
    if (!locked) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    // Batch save all answers in one query
    await saveAnswersBatch(attemptId, validatedAnswers);

    // Batch fetch correct answers for all questions in one query
    const answerMap = new Map(validatedAnswers.map((a) => [a.questionId, a.chosenIndex]));
    const metaBatch = await getCorrectAndExplanationBatch(attempt.question_ids_json);

    let correct = 0;
    const results: { questionId: number; correct: boolean; explanation: string | null }[] = [];

    for (const qId of attempt.question_ids_json) {
      const meta = metaBatch.get(qId);
      const chosen = answerMap.get(qId);
      const right = meta != null && chosen != null && meta.correct_index === chosen;
      if (right) correct++;
      results.push({
        questionId: qId,
        correct: right,
        explanation: meta?.explanation ?? null,
      });
    }

    const total = attempt.question_ids_json.length;
    const score = Math.round((correct / total) * 100);
    const examConfig = await getExamConfigForLang(attempt.lang);
    const passed = score >= examConfig.passPercent;

    // Update with final score (submitted_at was already set by lockAttemptForSubmit)
    await submitAttempt(attemptId, score, passed);

    let certificateId: string | null = null;
    if (passed) {
      certificateId = await createCertificate(user.userId, attempt.lang, attemptId);
    }

    return NextResponse.json({ score, passed, correct, total, certificateId, results });
  }
);
