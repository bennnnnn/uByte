import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { getAttempt, getAnswers } from "@/lib/db/exam-attempts";
import { getCorrectAndExplanationBatch } from "@/lib/db/exam-questions";
import { getSql } from "@/lib/db/client";
import { withErrorHandling } from "@/lib/api-utils";

export interface QuestionReview {
  questionId: number;
  prompt: string;
  /** Choices in the order the user saw them during the exam */
  displayedChoices: string[];
  /** Index (in displayedChoices) the user picked; null = unanswered */
  userDisplayIdx: number | null;
  /** Index (in displayedChoices) that is the correct answer */
  correctDisplayIdx: number;
  isCorrect: boolean;
  explanation: string | null;
}

export interface ReviewResponse {
  questions: QuestionReview[];
}

/** GET /api/certifications/attempt/[attemptId]/review — Pro-only detailed breakdown. */
export const GET = withErrorHandling(
  "GET /api/certifications/attempt/[attemptId]/review",
  async (_req: Request, context?: unknown) => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to view your review" }, { status: 401 });

    const profile = await getUserById(user.userId);
    if (!hasPaidAccess(profile?.plan)) {
      return NextResponse.json({ error: "Pro required", code: "upgrade_required" }, { status: 403 });
    }

    const { attemptId } = (context as { params?: Promise<{ attemptId: string }> }).params
      ? await (context as { params: Promise<{ attemptId: string }> }).params
      : { attemptId: "" };

    const attempt = await getAttempt(attemptId);
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (attempt.user_id !== user.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!attempt.submitted_at) return NextResponse.json({ error: "Attempt not yet submitted" }, { status: 400 });

    // Fetch all needed data in parallel
    const [userAnswers, metaBatch, questionRows] = await Promise.all([
      getAnswers(attemptId),
      getCorrectAndExplanationBatch(attempt.question_ids_json),
      getSql()`
        SELECT id, prompt, choices_json
        FROM exam_questions
        WHERE id = ANY(${attempt.question_ids_json})
      `,
    ]);

    const answerByQuestionId = new Map(userAnswers.map((a) => [a.question_id, a.chosen_index]));
    const questionById = new Map(
      (questionRows as { id: number; prompt: string; choices_json: string[] }[]).map((r) => [
        r.id,
        { prompt: r.prompt, choices_json: r.choices_json },
      ])
    );

    const questions: QuestionReview[] = attempt.question_ids_json.map((qId, posIdx) => {
      const row = questionById.get(qId);
      const meta = metaBatch.get(qId);
      const choiceOrder: number[] | undefined = attempt.choices_order_json[posIdx];

      // Build the displayed choices (in the order the user saw them)
      let displayedChoices: string[] = row ? [...row.choices_json] : [];
      if (choiceOrder && choiceOrder.length === displayedChoices.length && row) {
        displayedChoices = choiceOrder.map((origIdx) => row.choices_json[origIdx]);
      }

      // Map correct_index (original) → displayed index
      let correctDisplayIdx = meta?.correct_index ?? 0;
      if (choiceOrder && meta != null) {
        const di = choiceOrder.indexOf(meta.correct_index);
        if (di !== -1) correctDisplayIdx = di;
      }

      const userDisplayIdx = answerByQuestionId.get(qId) ?? null;
      const isCorrect =
        userDisplayIdx !== null &&
        meta != null &&
        (choiceOrder
          ? choiceOrder[userDisplayIdx] === meta.correct_index
          : userDisplayIdx === meta.correct_index);

      return {
        questionId: qId,
        prompt: row?.prompt ?? "",
        displayedChoices,
        userDisplayIdx,
        correctDisplayIdx,
        isCorrect,
        explanation: meta?.explanation ?? null,
      };
    });

    return NextResponse.json({ questions } satisfies ReviewResponse);
  }
);
