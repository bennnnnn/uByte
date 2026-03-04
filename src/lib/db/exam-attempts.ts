import { getSql } from "./client";

export interface ExamAttemptRow {
  id: string;
  user_id: number;
  lang: string;
  question_ids_json: number[];
  choices_order_json: number[][];
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  passed: boolean | null;
}

export async function createAttempt(
  attemptId: string,
  userId: number,
  lang: string,
  questionIds: number[],
  choicesOrder: number[][]
): Promise<void> {
  const sql = getSql();
  const qJson = JSON.stringify(questionIds);
  const cJson = JSON.stringify(choicesOrder);
  await sql`
    INSERT INTO exam_attempts (id, user_id, lang, question_ids_json, choices_order_json)
    VALUES (${attemptId}, ${userId}, ${lang}, ${qJson}::jsonb, ${cJson}::jsonb)
  `;
}

export async function getAttempt(attemptId: string): Promise<ExamAttemptRow | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT id, user_id, lang, question_ids_json, choices_order_json, started_at, submitted_at, score, passed
    FROM exam_attempts WHERE id = ${attemptId}
  `;
  if (!row) return null;
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    user_id: r.user_id as number,
    lang: r.lang as string,
    question_ids_json: r.question_ids_json as number[],
    choices_order_json: r.choices_order_json as number[][],
    started_at: r.started_at as string,
    submitted_at: r.submitted_at as string | null,
    score: r.score as number | null,
    passed: r.passed as boolean | null,
  };
}

export async function submitAttempt(
  attemptId: string,
  score: number,
  passed: boolean
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE exam_attempts SET submitted_at = NOW(), score = ${score}, passed = ${passed} WHERE id = ${attemptId}
  `;
}

export async function saveAnswer(attemptId: string, questionId: number, chosenIndex: number): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO exam_answers (attempt_id, question_id, chosen_index)
    VALUES (${attemptId}, ${questionId}, ${chosenIndex})
    ON CONFLICT (attempt_id, question_id) DO UPDATE SET chosen_index = EXCLUDED.chosen_index
  `;
}

export async function getAnswers(attemptId: string): Promise<{ question_id: number; chosen_index: number }[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT question_id, chosen_index FROM exam_answers WHERE attempt_id = ${attemptId}
  `;
  return (rows as { question_id: number; chosen_index: number }[]).map((r) => ({
    question_id: r.question_id,
    chosen_index: r.chosen_index,
  }));
}
