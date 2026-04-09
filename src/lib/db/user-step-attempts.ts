/**
 * Per-user step check outcomes (pass/fail) for personalization.
 * Anonymous aggregate step_checks remain in admin.ts for heatmaps.
 */
import { getSql } from "./client";

export interface UserStruggleHint {
  language: string;
  tutorial_slug: string;
  step_index: number;
  fail_count: number;
  pass_count: number;
}

let _ready = false;

async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS user_step_attempts (
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      language        TEXT NOT NULL,
      tutorial_slug   TEXT NOT NULL,
      step_index      INTEGER NOT NULL,
      passed          BOOLEAN NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_step_attempts_user_time ON user_step_attempts(user_id, created_at DESC)`;
  _ready = true;
}

export async function recordUserStepAttempt(
  userId: number,
  language: string,
  tutorialSlug: string,
  stepIndex: number,
  passed: boolean
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO user_step_attempts (user_id, language, tutorial_slug, step_index, passed)
    VALUES (${userId}, ${language}, ${tutorialSlug}, ${stepIndex}, ${passed})
  `;
}

/**
 * Steps where the user failed more than they passed recently (e.g. stuck on "variables").
 */
export async function clearUserStepAttempts(userId: number): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM user_step_attempts WHERE user_id = ${userId}`;
}

export async function getUserStruggleHints(
  userId: number,
  limit = 3
): Promise<UserStruggleHint[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    WITH agg AS (
      SELECT
        language,
        tutorial_slug,
        step_index,
        COUNT(*) FILTER (WHERE passed = TRUE)::int  AS pass_count,
        COUNT(*) FILTER (WHERE passed = FALSE)::int AS fail_count,
        MAX(created_at) AS last_try
      FROM user_step_attempts
      WHERE user_id = ${userId}
        AND created_at > NOW() - INTERVAL '14 days'
      GROUP BY language, tutorial_slug, step_index
    )
    SELECT language, tutorial_slug, step_index, fail_count, pass_count
    FROM agg
    WHERE fail_count >= 2 AND fail_count > pass_count
    ORDER BY last_try DESC
    LIMIT ${limit}
  `;
  return rows as UserStruggleHint[];
}
