import { getSql } from "./client";

export type PracticeAttemptStatus = "solved" | "failed";

export interface PracticeAttempt {
  problem_slug: string;
  status: PracticeAttemptStatus;
  updated_at: string;
}

/** Auto-creates the table on first use so no migration is needed. */
async function ensureTable(): Promise<void> {
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

/** Upsert a problem attempt — called every time the user runs code. */
export async function savePracticeAttempt(
  userId: number,
  problemSlug: string,
  status: PracticeAttemptStatus
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO practice_attempts (user_id, problem_slug, status, updated_at)
    VALUES (${userId}, ${problemSlug}, ${status}, NOW())
    ON CONFLICT (user_id, problem_slug)
    DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
  `;
}

/** Fetch all attempt statuses for a user (returns a slug → status map). */
export async function getPracticeAttempts(
  userId: number
): Promise<Record<string, PracticeAttemptStatus>> {
  await ensureTable();
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
