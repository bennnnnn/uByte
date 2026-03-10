import { getSql } from "./client";
import { clearStepProgress } from "./step-progress";

const DEFAULT_LANG = "go";


/**
 * One-time lazy migration: adds the language column + correct unique constraint
 * to the progress table. Safe to call on every server start — it's a no-op
 * once the column and constraint already exist.
 *
 * Why lazy instead of a separate migration script? The DB may be used by
 * Vercel serverless functions that don't run migration scripts on deploy.
 * Running it here ensures the migration happens automatically on first use.
 */
let _migrated = false;
async function ensureLanguageColumn(): Promise<void> {
  if (_migrated) return;
  const sql = getSql();

  // Step 1: add language column — sets default 'go' for all existing rows.
  // IF NOT EXISTS makes this a no-op once the column is there.
  await sql`ALTER TABLE progress ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'go'`;

  // Step 1b: backfill any rows that got NULL (possible if the column was previously
  // added as nullable in a partial migration run).
  await sql`UPDATE progress SET language = 'go' WHERE language IS NULL OR language = ''`;

  // Step 2: add the 3-column unique constraint.
  // Error 42P07 = constraint already exists — safe to ignore.
  await sql`
    ALTER TABLE progress
    ADD CONSTRAINT progress_user_id_language_tutorial_slug_key
    UNIQUE (user_id, language, tutorial_slug)
  `.catch((e: unknown) => {
    if ((e as { code?: string })?.code !== "42P07") throw e;
  });

  // Step 3: drop the old 2-column constraint.
  // IF EXISTS makes this a no-op once already dropped.
  await sql`
    ALTER TABLE progress
    DROP CONSTRAINT IF EXISTS progress_user_id_tutorial_slug_key
  `;

  _migrated = true;
}

export async function getProgress(userId: number, language: string = DEFAULT_LANG): Promise<string[]> {
  await ensureLanguageColumn();
  const sql = getSql();
  const rows = await sql`
    SELECT tutorial_slug FROM progress
    WHERE user_id = ${userId} AND language = ${language}
    ORDER BY completed_at
  `;
  return rows.map((r) => r.tutorial_slug as string);
}

/**
 * Fetches completed tutorial slugs for ALL languages in a single query.
 * Returns a map of language → slug[].  Use this on the public profile page
 * instead of calling getProgress() once per language.
 */
export async function getAllProgressByUser(
  userId: number
): Promise<Map<string, string[]>> {
  await ensureLanguageColumn();
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
  await ensureLanguageColumn();
  const [row] = await sql`
    SELECT COUNT(*)::int AS c FROM progress
    WHERE user_id = ${userId} AND language = ${language}
  `;
  return (row?.c as number) ?? 0;
}

export async function markComplete(
  userId: number,
  tutorialSlug: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  await ensureLanguageColumn();
  const sql = getSql();
  await sql`
    INSERT INTO progress (user_id, tutorial_slug, language)
    VALUES (${userId}, ${tutorialSlug}, ${language})
    ON CONFLICT (user_id, language, tutorial_slug) DO NOTHING
  `;
}

export async function markIncomplete(
  userId: number,
  tutorialSlug: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  await ensureLanguageColumn();
  const sql = getSql();
  await sql`
    DELETE FROM progress
    WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug} AND language = ${language}
  `;
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
