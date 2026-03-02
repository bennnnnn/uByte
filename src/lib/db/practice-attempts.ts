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

  const existing = await sql`
    SELECT status FROM practice_attempts
    WHERE user_id = ${userId} AND problem_slug = ${problemSlug}
  `;
  const previousStatus = existing[0]?.status as PracticeAttemptStatus | undefined;
  const wasFirstSolve = status === "solved" && previousStatus !== "solved";

  await sql`
    INSERT INTO practice_attempts (user_id, problem_slug, status, updated_at)
    VALUES (${userId}, ${problemSlug}, ${status}, NOW())
    ON CONFLICT (user_id, problem_slug)
    DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
  `;

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
