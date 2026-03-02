import { getSql } from "./client";

let _challengesReady = false;
async function ensureChallengesTable(): Promise<void> {
  if (_challengesReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS challenge_runs (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tutorial_slug TEXT NOT NULL,
      total_ms     INTEGER NOT NULL,
      steps_count  INTEGER NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_challenge_runs_slug ON challenge_runs(tutorial_slug, total_ms ASC)`;
  _challengesReady = true;
}

export interface ChallengeRun {
  id: number;
  user_id: number;
  user_name: string;
  total_ms: number;
  steps_count: number;
  completed_at: string;
}

export async function saveChallengeRun(
  userId: number,
  slug: string,
  totalMs: number,
  stepsCount: number
): Promise<void> {
  await ensureChallengesTable();
  const sql = getSql();
  await sql`
    INSERT INTO challenge_runs (user_id, tutorial_slug, total_ms, steps_count)
    VALUES (${userId}, ${slug}, ${totalMs}, ${stepsCount})
  `;
}

export async function getTopChallengeRuns(slug: string, limit = 10): Promise<ChallengeRun[]> {
  await ensureChallengesTable();
  const sql = getSql();
  const rows = await sql`
    SELECT cr.id, cr.user_id, u.name AS user_name, cr.total_ms, cr.steps_count, cr.completed_at
    FROM challenge_runs cr
    JOIN users u ON u.id = cr.user_id
    WHERE cr.tutorial_slug = ${slug}
    ORDER BY cr.total_ms ASC
    LIMIT ${limit}
  `;
  return rows as ChallengeRun[];
}

export async function getUserBestTime(userId: number, slug: string): Promise<number | null> {
  await ensureChallengesTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT MIN(total_ms)::int AS best FROM challenge_runs
    WHERE user_id = ${userId} AND tutorial_slug = ${slug}
  `;
  return (row?.best as number) ?? null;
}
