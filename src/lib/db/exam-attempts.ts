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

/**
 * Atomically lock an attempt for submission. Returns true if the lock was acquired
 * (submitted_at was NULL and is now set to a placeholder). Returns false if already submitted.
 */
export async function lockAttemptForSubmit(attemptId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE exam_attempts
    SET submitted_at = NOW()
    WHERE id = ${attemptId} AND submitted_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

/**
 * Clears the optimistic submit lock if grading failed before a final score was written.
 * Once score/passed are populated, the attempt is considered finalized and the lock stays in place.
 */
export async function releaseAttemptSubmitLock(attemptId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE exam_attempts
    SET submitted_at = NULL
    WHERE id = ${attemptId} AND score IS NULL AND passed IS NULL
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

/** Batch insert/upsert answers for an attempt in one query. */
export async function saveAnswersBatch(
  attemptId: string,
  answers: { questionId: number; chosenIndex: number }[]
): Promise<void> {
  if (answers.length === 0) return;
  const sql = getSql();
  const attemptIds = answers.map(() => attemptId);
  const questionIds = answers.map((a) => a.questionId);
  const chosenIndexes = answers.map((a) => a.chosenIndex);
  await sql`
    INSERT INTO exam_answers (attempt_id, question_id, chosen_index)
    SELECT * FROM UNNEST(${attemptIds}::uuid[], ${questionIds}::bigint[], ${chosenIndexes}::int[])
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

/** Aggregate per-language public stats: usage + success rate. */
export interface ExamLangPublicStats {
  lang: string;
  usersTaken: number;
  attemptsSubmitted: number;
  passedAttempts: number;
  passRatePercent: number;
  usersPassed: number;
}

/**
 * Aggregate exam popularity/success by language.
 * Counts are based on submitted attempts (completed exams) only.
 */
export async function getExamPublicStatsByLang(): Promise<ExamLangPublicStats[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      lang,
      COUNT(*)::int AS attempts_submitted,
      COUNT(DISTINCT user_id)::int AS users_taken,
      COUNT(*) FILTER (WHERE passed = true)::int AS passed_attempts,
      COUNT(DISTINCT user_id) FILTER (WHERE passed = true)::int AS users_passed
    FROM exam_attempts
    WHERE submitted_at IS NOT NULL
    GROUP BY lang
  `;

  return (rows as {
    lang: string;
    attempts_submitted: number;
    users_taken: number;
    passed_attempts: number;
    users_passed: number;
  }[]).map((r) => ({
    lang: r.lang,
    usersTaken: r.users_taken ?? 0,
    attemptsSubmitted: r.attempts_submitted ?? 0,
    passedAttempts: r.passed_attempts ?? 0,
    passRatePercent:
      (r.attempts_submitted ?? 0) > 0
        ? Math.round(((r.passed_attempts ?? 0) / (r.attempts_submitted ?? 1)) * 100)
        : 0,
    usersPassed: r.users_passed ?? 0,
  }));
}

/** Per-language stats for a user: attempt count, last attempt result, and whether they have a certificate. */
export interface UserExamLangStats {
  lang: string;
  attemptCount: number;
  lastPassed: boolean | null;
  lastScore: number | null;
  hasCertificate: boolean;
}

/** Get exam attempt and certificate stats per language for the certifications page (e.g. "Try again", "Passed"). */
export async function getUserExamStats(userId: number): Promise<UserExamLangStats[]> {
  const sql = getSql();
  const [attemptRows, certRows] = await Promise.all([
    sql`
      SELECT lang, COUNT(*)::int AS attempt_count,
             (array_agg(score ORDER BY submitted_at DESC NULLS LAST))[1] AS last_score,
             (array_agg(passed ORDER BY submitted_at DESC NULLS LAST))[1] AS last_passed
      FROM exam_attempts
      WHERE user_id = ${userId} AND submitted_at IS NOT NULL
      GROUP BY lang
    `,
    sql`SELECT lang FROM exam_certificates WHERE user_id = ${userId}`,
  ]);
  const certLangs = new Set((certRows as { lang: string }[]).map((r) => r.lang));
  const byLang = new Map<string, UserExamLangStats>();
  for (const r of attemptRows as { lang: string; attempt_count: number; last_score: number | null; last_passed: boolean | null }[]) {
    byLang.set(r.lang, {
      lang: r.lang,
      attemptCount: r.attempt_count,
      lastPassed: r.last_passed,
      lastScore: r.last_score,
      hasCertificate: certLangs.has(r.lang),
    });
  }
  for (const c of certRows as { lang: string }[]) {
    if (!byLang.has(c.lang)) {
      byLang.set(c.lang, { lang: c.lang, attemptCount: 0, lastPassed: null, lastScore: null, hasCertificate: true });
    } else {
      (byLang.get(c.lang)!).hasCertificate = true;
    }
  }
  return Array.from(byLang.values());
}
