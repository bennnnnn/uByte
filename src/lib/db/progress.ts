import { getSql } from "./client";
import { clearStepProgress } from "./step-progress";

const DEFAULT_LANG = "go";

/** PostgreSQL error code for undefined column (e.g. language not yet migrated) */
const UNDEFINED_COLUMN = "42703";

export async function getProgress(userId: number, language: string = DEFAULT_LANG): Promise<string[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT tutorial_slug FROM progress
      WHERE user_id = ${userId} AND (language = ${language} OR language IS NULL)
      ORDER BY completed_at
    `;
    return rows.map((r) => r.tutorial_slug as string);
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === UNDEFINED_COLUMN) {
      const rows = await sql`
        SELECT tutorial_slug FROM progress WHERE user_id = ${userId} ORDER BY completed_at
      `;
      return rows.map((r) => r.tutorial_slug as string);
    }
    throw err;
  }
}

/**
 * Fetches completed tutorial slugs for ALL languages in a single query.
 * Returns a map of language → slug[].  Use this on the public profile page
 * instead of calling getProgress() once per language.
 */
export async function getAllProgressByUser(
  userId: number
): Promise<Map<string, string[]>> {
  const sql = getSql();
  const rows = await sql`
    SELECT language, tutorial_slug FROM progress
    WHERE user_id = ${userId}
    ORDER BY completed_at
  `;
  const result = new Map<string, string[]>();
  for (const r of rows) {
    const lang = (r.language as string | null) ?? "go";
    if (!result.has(lang)) result.set(lang, []);
    result.get(lang)!.push(r.tutorial_slug as string);
  }
  return result;
}

/** If language is omitted, returns total count across all languages (for stats/leaderboard). */
export async function getProgressCount(
  userId: number,
  language?: string
): Promise<number> {
  const sql = getSql();
  if (language === undefined) {
    const [row] = await sql`
      SELECT COUNT(*)::int AS c FROM progress WHERE user_id = ${userId}
    `;
    return (row?.c as number) ?? 0;
  }
  try {
    const [row] = await sql`
      SELECT COUNT(*)::int AS c FROM progress
      WHERE user_id = ${userId} AND (language = ${language} OR language IS NULL)
    `;
    return (row?.c as number) ?? 0;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === UNDEFINED_COLUMN) {
      const [row] = await sql`
        SELECT COUNT(*)::int AS c FROM progress WHERE user_id = ${userId}
      `;
      return (row?.c as number) ?? 0;
    }
    throw err;
  }
}

export async function markComplete(
  userId: number,
  tutorialSlug: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      INSERT INTO progress (user_id, tutorial_slug, language)
      VALUES (${userId}, ${tutorialSlug}, ${language})
      ON CONFLICT (user_id, language, tutorial_slug) DO NOTHING
    `;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === UNDEFINED_COLUMN) {
      await sql`
        INSERT INTO progress (user_id, tutorial_slug)
        VALUES (${userId}, ${tutorialSlug})
        ON CONFLICT (user_id, tutorial_slug) DO NOTHING
      `;
      return;
    }
    throw err;
  }
}

export async function markIncomplete(
  userId: number,
  tutorialSlug: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      DELETE FROM progress
      WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug} AND (language = ${language} OR language IS NULL)
    `;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === UNDEFINED_COLUMN) {
      await sql`
        DELETE FROM progress WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug}
      `;
      return;
    }
    throw err;
  }
}

export async function resetAllProgress(userId: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM progress WHERE user_id = ${userId}`;
  await clearStepProgress(userId);
  await sql`DELETE FROM achievements WHERE user_id = ${userId}`;
  await sql`
    UPDATE users
    SET xp = 0, streak_days = 0, longest_streak = 0, streak_last_date = NULL
    WHERE id = ${userId}
  `;
}

export async function recordPageView(visitorId: string, pageSlug: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO page_views (visitor_id, page_slug) VALUES (${visitorId}, ${pageSlug})
    ON CONFLICT (visitor_id, page_slug) DO NOTHING
  `;
}

export async function getPageViewCount(visitorId: string): Promise<number> {
  const sql = getSql();
  const [row] = await sql`SELECT COUNT(*)::int AS count FROM page_views WHERE visitor_id = ${visitorId}`;
  return (row?.count as number) ?? 0;
}

export async function clearPageViews(visitorId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM page_views WHERE visitor_id = ${visitorId}`;
}
