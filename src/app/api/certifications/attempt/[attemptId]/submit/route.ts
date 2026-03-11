import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getAttempt,
  lockAttemptForSubmit,
  releaseAttemptSubmitLock,
  saveAnswersBatch,
  submitAttempt,
} from "@/lib/db/exam-attempts";
import { getCorrectAndExplanationBatch } from "@/lib/db/exam-questions";
import { createCertificate } from "@/lib/db/exam-certificates";
import { withErrorHandling } from "@/lib/api-utils";
import { getExamConfigForLang } from "@/lib/db/exam-settings";
import { verifyCsrf } from "@/lib/csrf";
import {
  EXAM_SUBMIT_GRACE_MS,
  hasAttemptExpired,
  isDisplayedAnswerCorrect,
} from "@/lib/exams/attempt-utils";
import { sendCertificationEmail } from "@/lib/email";
import { BASE_URL } from "@/lib/constants";
import { addXp } from "@/lib/db";

/** XP awarded for passing a language certification exam. */
const CERT_PASS_XP = 100;

export const POST = withErrorHandling(
  "POST /api/certifications/attempt/[attemptId]/submit",
  async (request: NextRequest, context?: unknown) => {
    const csrfError = verifyCsrf(request);
    if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { attemptId } = (context as { params?: Promise<{ attemptId: string }> }).params
      ? await (context as { params: Promise<{ attemptId: string }> }).params
      : { attemptId: "" };

    const attempt = await getAttempt(attemptId);
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (attempt.submitted_at) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    const examConfig = await getExamConfigForLang(attempt.lang);
    if (hasAttemptExpired(attempt.started_at, examConfig.examDurationMinutes, Date.now(), EXAM_SUBMIT_GRACE_MS)) {
      return NextResponse.json({ error: "Exam time limit exceeded" }, { status: 410 });
    }

    const body = await request.json();
    const answers = body?.answers as Record<string, number> | undefined;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers object required" }, { status: 400 });
    }

    // Validate answer keys against the attempt's question IDs
    const validQuestionIds = new Set(attempt.question_ids_json);
    const choiceOrderByQuestionId = new Map(
      attempt.question_ids_json.map((questionId, index) => [
        questionId,
        Array.isArray(attempt.choices_order_json[index]) ? attempt.choices_order_json[index] : undefined,
      ])
    );
    const validatedAnswers: { questionId: number; chosenIndex: number }[] = [];
    for (const [qId, chosenIndex] of Object.entries(answers)) {
      const questionId = parseInt(qId, 10);
      if (isNaN(questionId)) continue;
      if (!validQuestionIds.has(questionId)) continue;
      const choiceOrder = choiceOrderByQuestionId.get(questionId);
      const maxChoiceIndex =
        Array.isArray(choiceOrder) && choiceOrder.length > 0 ? choiceOrder.length - 1 : 3;
      if (!Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex > maxChoiceIndex) continue;
      validatedAnswers.push({ questionId, chosenIndex });
    }

    // Atomic lock: prevents double-submit race condition
    const locked = await lockAttemptForSubmit(attemptId);
    if (!locked) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    let finalized = false;
    try {
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
        const right =
          meta != null &&
          isDisplayedAnswerCorrect(meta.correct_index, chosen, choiceOrderByQuestionId.get(qId));
        if (right) correct++;
        results.push({
          questionId: qId,
          correct: right,
          explanation: meta?.explanation ?? null,
        });
      }

      const total = attempt.question_ids_json.length;
      const score = Math.round((correct / total) * 100);
      const passed = score >= examConfig.passPercent;

      // Update with final score (submitted_at was already set by lockAttemptForSubmit)
      await submitAttempt(attemptId, score, passed);
      finalized = true;

      let certificateId: string | null = null;
      if (passed) {
        certificateId = await createCertificate(user.userId, attempt.lang, attemptId);
        // Award XP for passing (fire-and-forget — never blocks the response)
        addXp(user.userId, CERT_PASS_XP).catch((err) =>
          console.error("[submit] addXp failed:", err)
        );
        // Send congratulations email (fire-and-forget)
        if (user.email && certificateId) {
          const certUrl = `${BASE_URL}/certifications/certificate/${certificateId}`;
          sendCertificationEmail(user.email, user.name, attempt.lang, certUrl).catch((err) =>
            console.error("[submit] sendCertificationEmail failed:", err)
          );
        }
      }

      return NextResponse.json({
        score,
        passed,
        correct,
        total,
        certificateId,
        results,
        xpAwarded: passed ? CERT_PASS_XP : 0,
      });
    } catch (error) {
      if (!finalized) {
        await releaseAttemptSubmitLock(attemptId);
      }
      throw error;
    }
  }
);
