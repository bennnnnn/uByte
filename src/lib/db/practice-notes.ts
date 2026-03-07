import { getSql } from "./client";

let _ready = false;
async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS practice_notes (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_slug TEXT NOT NULL,
      note         TEXT NOT NULL DEFAULT '',
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, problem_slug)
    )
  `;
  _ready = true;
}

export async function getPracticeNote(userId: number, slug: string): Promise<string> {
  await ensureTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT note FROM practice_notes
    WHERE user_id = ${userId} AND problem_slug = ${slug}
  `;
  return (row?.note as string) ?? "";
}

export async function upsertPracticeNote(userId: number, slug: string, note: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO practice_notes (user_id, problem_slug, note, updated_at)
    VALUES (${userId}, ${slug}, ${note}, NOW())
    ON CONFLICT (user_id, problem_slug)
    DO UPDATE SET note = EXCLUDED.note, updated_at = NOW()
  `;
}
