import { getSql } from "./client";

export type PracticeAttemptStatus = "solved" | "failed";

export interface PracticeAttempt {
  problem_slug: string;
  status: PracticeAttemptStatus;
  updated_at: string;
}

/** Auto-creates the table on first use so no migration is needed. */
export async function ensurePracticeAttemptsTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS practice_attempts (
      id          SERIAL      PRIMARY KEY,
      user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_slug TEXT       NOT NULL,
      status      TEXT        NOT NULL CHECK (status IN ('solved', 'failed')),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, problem_slug)
    )
  `;
}

/**
 * Upsert a problem attempt.
 * Returns { wasFirstSolve: true } when the user goes from non-solved → solved for
 * the first time, so the caller can award XP exactly once per problem.
 */
export async function savePracticeAttempt(
  userId: number,
  problemSlug: string,
  status: PracticeAttemptStatus
): Promise<{ wasFirstSolve: boolean }> {
  await ensurePracticeAttemptsTable();
  const sql = getSql();

  // Atomic upsert: capture previous status to detect failed→solved transitions
  const [row] = await sql`
    INSERT INTO practice_attempts (user_id, problem_slug, status, updated_at)
    VALUES (${userId}, ${problemSlug}, ${status}, NOW())
    ON CONFLICT (user_id, problem_slug)
    DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
    WHERE practice_attempts.status != 'solved'
    RETURNING (xmax = 0) AS was_insert
  `;
  // Row is returned when: (a) fresh insert, or (b) update that changed a non-solved row.
  // Row is NOT returned when the row already had status='solved' (WHERE clause filters it out).
  const wasFirstSolve = status === "solved" && row != null;

  return { wasFirstSolve };
}

/** Fetch all attempt statuses for a user (returns a slug → status map). */
export async function getPracticeAttempts(
  userId: number
): Promise<Record<string, PracticeAttemptStatus>> {
  await ensurePracticeAttemptsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT problem_slug, status FROM practice_attempts WHERE user_id = ${userId}
  `;
  const map: Record<string, PracticeAttemptStatus> = {};
  for (const row of rows) {
    map[row.problem_slug as string] = row.status as PracticeAttemptStatus;
  }
  return map;
}

export interface PracticeProblemStat {
  problem_slug: string;
  solved_count: number;
  attempt_count: number;
}

/** Admin: per-problem stats (how many users solved, how many attempted). */
export async function getPracticeProblemStats(): Promise<PracticeProblemStat[]> {
  await ensurePracticeAttemptsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT
      problem_slug,
      COUNT(*) FILTER (WHERE status = 'solved')::int AS solved_count,
      COUNT(DISTINCT user_id)::int AS attempt_count
    FROM practice_attempts
    GROUP BY problem_slug
    ORDER BY solved_count DESC
  `;
  return rows as PracticeProblemStat[];
}
