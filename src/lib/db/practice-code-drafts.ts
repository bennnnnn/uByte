import { getSql } from "./client";

let _ready = false;
async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS practice_code_drafts (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_slug TEXT NOT NULL,
      language     TEXT NOT NULL,
      code         TEXT NOT NULL DEFAULT '',
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, problem_slug, language)
    )
  `;
  _ready = true;
}

export async function getPracticeCodeDraft(
  userId: number,
  slug: string,
  language: string
): Promise<string | null> {
  await ensureTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT code FROM practice_code_drafts
    WHERE user_id = ${userId} AND problem_slug = ${slug} AND language = ${language}
  `;
  return (row?.code as string) ?? null;
}

export async function upsertPracticeCodeDraft(
  userId: number,
  slug: string,
  language: string,
  code: string
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO practice_code_drafts (user_id, problem_slug, language, code, updated_at)
    VALUES (${userId}, ${slug}, ${language}, ${code}, NOW())
    ON CONFLICT (user_id, problem_slug, language)
    DO UPDATE SET code = EXCLUDED.code, updated_at = NOW()
  `;
}

export async function deletePracticeCodeDraft(
  userId: number,
  slug: string,
  language: string
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    DELETE FROM practice_code_drafts
    WHERE user_id = ${userId} AND problem_slug = ${slug} AND language = ${language}
  `;
}
