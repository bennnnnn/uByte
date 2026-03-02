import { getSql } from "./client";

const DEFAULT_LANG = "go";

let _codeDraftsReady = false;
async function ensureCodeDraftsTable(): Promise<void> {
  if (_codeDraftsReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS code_drafts (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      language   TEXT NOT NULL DEFAULT 'go',
      slug       TEXT NOT NULL,
      editor_key TEXT NOT NULL,
      code       TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, language, slug, editor_key)
    )
  `;
  _codeDraftsReady = true;
}

export async function getCodeDraft(
  userId: number,
  slug: string,
  editorKey: string,
  language: string = DEFAULT_LANG
): Promise<string | null> {
  await ensureCodeDraftsTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT code FROM code_drafts
    WHERE user_id = ${userId} AND slug = ${slug} AND editor_key = ${editorKey}
      AND (language = ${language} OR language IS NULL)
  `;
  return (row?.code as string) ?? null;
}

export async function upsertCodeDraft(
  userId: number,
  slug: string,
  editorKey: string,
  code: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  await ensureCodeDraftsTable();
  const sql = getSql();
  await sql`
    INSERT INTO code_drafts (user_id, language, slug, editor_key, code, updated_at)
    VALUES (${userId}, ${language}, ${slug}, ${editorKey}, ${code}, NOW())
    ON CONFLICT (user_id, language, slug, editor_key)
    DO UPDATE SET code = EXCLUDED.code, updated_at = NOW()
  `;
}

export async function deleteCodeDraft(
  userId: number,
  slug: string,
  editorKey: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  await ensureCodeDraftsTable();
  const sql = getSql();
  await sql`
    DELETE FROM code_drafts
    WHERE user_id = ${userId} AND slug = ${slug} AND editor_key = ${editorKey}
      AND (language = ${language} OR language IS NULL)
  `;
}
