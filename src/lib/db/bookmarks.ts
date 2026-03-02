import { getSql } from "./client";
import type { Bookmark } from "./types";

const DEFAULT_LANG = "go";

export async function getBookmarks(
  userId: number,
  limit: number = 50,
  offset: number = 0,
  language: string = DEFAULT_LANG
): Promise<Bookmark[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM bookmarks
    WHERE user_id = ${userId} AND (language = ${language} OR language IS NULL)
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as Bookmark[];
}

export async function getBookmarkTotal(userId: number, language: string = DEFAULT_LANG): Promise<number> {
  const sql = getSql();
  const [row] = await sql`
    SELECT COUNT(*)::int AS c FROM bookmarks
    WHERE user_id = ${userId} AND (language = ${language} OR language IS NULL)
  `;
  return (row?.c as number) ?? 0;
}

export async function addBookmark(
  userId: number,
  tutorialSlug: string,
  snippet: string,
  note: string,
  language: string = DEFAULT_LANG
): Promise<Bookmark> {
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
