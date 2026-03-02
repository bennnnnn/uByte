import { getSql } from "./client";

const DEFAULT_LANG = "go";

let _ready = false;
async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS step_progress (
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tutorial_slug TEXT NOT NULL,
      step_index    INTEGER NOT NULL,
      language      TEXT NOT NULL DEFAULT 'go',
      completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, tutorial_slug, step_index)
    )
  `;
  _ready = true;
}

/** Get completed step indices for a user in a tutorial (0-based). */
export async function getCompletedStepIndices(
  userId: number,
  tutorialSlug: string,
  language: string = DEFAULT_LANG
): Promise<number[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT step_index FROM step_progress
    WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug} AND language = ${language}
    ORDER BY step_index
  `;
  return rows.map((r) => r.step_index as number);
}

/** Mark a step as completed for a user. */
export async function markStepComplete(
  userId: number,
  tutorialSlug: string,
  stepIndex: number,
  language: string = DEFAULT_LANG
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO step_progress (user_id, tutorial_slug, step_index, language, completed_at)
    VALUES (${userId}, ${tutorialSlug}, ${stepIndex}, ${language}, NOW())
    ON CONFLICT (user_id, tutorial_slug, step_index)
    DO UPDATE SET completed_at = NOW()
  `;
}

/** Clear all step progress for a user (e.g. on profile reset). */
export async function clearStepProgress(userId: number): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM step_progress WHERE user_id = ${userId}`;
}
