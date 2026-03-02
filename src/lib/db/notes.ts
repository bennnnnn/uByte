import { getSql } from "./client";

let _notesReady = false;
async function ensureNotesTable(): Promise<void> {
  if (_notesReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS step_notes (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tutorial_slug TEXT NOT NULL,
      step_index    INTEGER NOT NULL,
      note          TEXT NOT NULL DEFAULT '',
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, tutorial_slug, step_index)
    )
  `;
  _notesReady = true;
}

export async function getStepNote(
  userId: number,
  slug: string,
  stepIndex: number
): Promise<string> {
  await ensureNotesTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT note FROM step_notes
    WHERE user_id = ${userId} AND tutorial_slug = ${slug} AND step_index = ${stepIndex}
  `;
  return (row?.note as string) ?? "";
}

export async function upsertStepNote(
  userId: number,
  slug: string,
  stepIndex: number,
  note: string
): Promise<void> {
  await ensureNotesTable();
  const sql = getSql();
  await sql`
    INSERT INTO step_notes (user_id, tutorial_slug, step_index, note, updated_at)
    VALUES (${userId}, ${slug}, ${stepIndex}, ${note}, NOW())
    ON CONFLICT (user_id, tutorial_slug, step_index)
    DO UPDATE SET note = EXCLUDED.note, updated_at = NOW()
  `;
}
