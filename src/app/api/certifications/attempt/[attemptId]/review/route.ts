import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import { getAttempt, getAnswers } from "@/lib/db/exam-attempts";
import { getCorrectAndExplanationBatch } from "@/lib/db/exam-questions";
import { getSql } from "@/lib/db/client";
import { withErrorHandling } from "@/lib/api-utils";
import { callGateway, HINTS_MODEL } from "@/lib/ai/gateway-client";

/** Generate a short 1-2 sentence explanation for a wrong answer via AI. */
async function generateExplanation(
  prompt: string,
  choices: string[],
  correctIdx: number,
  lang: string
): Promise<string | null> {
  const correctChoice = choices[correctIdx] ?? "";
  const lettered = choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`).join("\n");
  try {
    const text = await callGateway({
      model: HINTS_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a concise ${lang} programming tutor. Explain exam answers in 1-2 sentences. Be direct and educational.`,
        },
        {
          role: "user",
          content: `Question: ${prompt}\n\nOptions:\n${lettered}\n\nCorrect answer: ${correctChoice}\n\nExplain in 1-2 sentences why "${correctChoice}" is correct.`,
        },
      ],
      maxTokens: 120,
      temperature: 0.3,
    });
    return text.trim() || null;
  } catch {
    return null;
  }
}

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

    // DB returns bigint columns as strings — normalise both sides to Number so map lookups work
    const answerByQuestionId = new Map(userAnswers.map((a) => [Number(a.question_id), Number(a.chosen_index)]));
    const questionById = new Map(
      (questionRows as { id: number | string; prompt: string; choices_json: string[] }[]).map((r) => [
        Number(r.id),
        { prompt: r.prompt, choices_json: r.choices_json },
      ])
    );

    // First pass: build the questions array
    const questions: QuestionReview[] = attempt.question_ids_json.map((qId, posIdx) => {
      const numQId = Number(qId);
      const row = questionById.get(numQId);
      const meta = metaBatch.get(numQId);
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

      const userDisplayIdx = answerByQuestionId.has(numQId) ? answerByQuestionId.get(numQId)! : null;
      const isCorrect =
        userDisplayIdx !== null &&
        meta != null &&
        (choiceOrder
          ? choiceOrder[userDisplayIdx] === meta.correct_index
          : userDisplayIdx === meta.correct_index);

      return {
        questionId: numQId,
        prompt: row?.prompt ?? "",
        displayedChoices,
        userDisplayIdx,
        correctDisplayIdx,
        isCorrect,
        explanation: meta?.explanation ?? null,
      };
    });

    // Second pass: for wrong-answer questions with no DB explanation, generate AI ones in parallel.
    // Cap at 8 questions to keep response time reasonable.
    const needsAi = questions
      .filter((q) => !q.isCorrect && !q.explanation && q.prompt)
      .slice(0, 8);

    if (needsAi.length > 0) {
      const generated = await Promise.all(
        needsAi.map((q) =>
          generateExplanation(
            q.prompt,
            q.displayedChoices,
            q.correctDisplayIdx,
            attempt.lang
          )
        )
      );
      needsAi.forEach((q, i) => {
        const match = questions.find((r) => r.questionId === q.questionId);
        if (match && generated[i]) match.explanation = generated[i];
      });
    }

    return NextResponse.json({ questions } satisfies ReviewResponse);
  }
);
