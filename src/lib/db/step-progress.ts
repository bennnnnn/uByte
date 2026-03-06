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
      skipped       BOOLEAN NOT NULL DEFAULT FALSE,
      PRIMARY KEY (user_id, tutorial_slug, step_index)
    )
  `;
  // Idempotent migration for existing tables created before the skipped column existed
  await sql`ALTER TABLE step_progress ADD COLUMN IF NOT EXISTS skipped BOOLEAN NOT NULL DEFAULT FALSE`;
  _ready = true;
}

/** Get step indices for a user in a tutorial, split into completed and skipped. */
export async function getCompletedStepIndices(
  userId: number,
  tutorialSlug: string,
  language: string = DEFAULT_LANG
): Promise<{ completed: number[]; skipped: number[] }> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT step_index, skipped FROM step_progress
    WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug} AND language = ${language}
    ORDER BY step_index
  `;
  const completed: number[] = [];
  const skipped: number[] = [];
  for (const r of rows) {
    if (r.skipped) skipped.push(r.step_index as number);
    else completed.push(r.step_index as number);
  }
  return { completed, skipped };
}

/** Mark a step as completed or skipped for a user. */
export async function markStepComplete(
  userId: number,
  tutorialSlug: string,
  stepIndex: number,
  language: string = DEFAULT_LANG,
  skipped = false
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO step_progress (user_id, tutorial_slug, step_index, language, completed_at, skipped)
    VALUES (${userId}, ${tutorialSlug}, ${stepIndex}, ${language}, NOW(), ${skipped})
    ON CONFLICT (user_id, tutorial_slug, step_index)
    DO UPDATE SET completed_at = NOW(), skipped = ${skipped}
  `;
}

/** Clear all step progress for a user (e.g. on profile reset). */
export async function clearStepProgress(userId: number): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM step_progress WHERE user_id = ${userId}`;
}
