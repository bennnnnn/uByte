import { getSql } from "./client";
import type { Bookmark } from "./types";

let _languageColumnReady = false;
async function ensureLanguageColumn(): Promise<void> {
  if (_languageColumnReady) return;
  const sql = getSql();
  try {
    await sql`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'go'`;
  } catch { /* ignore if table missing or column exists */ }
  _languageColumnReady = true;
}

/**
 * Fetch bookmarks for a user.
 * Pass language to filter by a specific language (used by the IDE to check
 * if the current problem is bookmarked). Omit language to return all bookmarks
 * (used by the profile bookmarks tab).
 */
export async function getBookmarks(
  userId: number,
  limit: number = 50,
  offset: number = 0,
  language?: string
): Promise<Bookmark[]> {
  await ensureLanguageColumn();
  const sql = getSql();
  const rows = language
    ? await sql`
        SELECT * FROM bookmarks
        WHERE user_id = ${userId} AND (language = ${language} OR language IS NULL)
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT * FROM bookmarks
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
  return rows as Bookmark[];
}

/** Pass language to count only that language's bookmarks; omit for total across all languages. */
export async function getBookmarkTotal(userId: number, language?: string): Promise<number> {
  await ensureLanguageColumn();
  const sql = getSql();
  const [row] = language
    ? await sql`
        SELECT COUNT(*)::int AS c FROM bookmarks
        WHERE user_id = ${userId} AND (language = ${language} OR language IS NULL)
      `
    : await sql`
        SELECT COUNT(*)::int AS c FROM bookmarks
        WHERE user_id = ${userId}
      `;
  return (row?.c as number) ?? 0;
}

export async function addBookmark(
  userId: number,
  tutorialSlug: string,
  snippet: string,
  note: string,
  language: string = "go"
): Promise<Bookmark> {
  await ensureLanguageColumn();
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO bookmarks (user_id, tutorial_slug, snippet, note, language)
    VALUES (${userId}, ${tutorialSlug}, ${snippet}, ${note}, ${language})
    RETURNING *
  `;
  return row as Bookmark;
}

export async function deleteBookmark(userId: number, bookmarkId: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM bookmarks WHERE id = ${bookmarkId} AND user_id = ${userId}`;
}

/** @deprecated Use getBookmarkTotal instead */
export async function getBookmarkCount(userId: number): Promise<number> {
  return getBookmarkTotal(userId);
}
