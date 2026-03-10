/**
 * progress.ts — tutorial-level completion tracking
 *
 * ─── PROGRESS MODEL ────────────────────────────────────────────────────────
 * This table tracks CHAPTER completion, NOT lesson (step) completion.
 *
 *   progress  (THIS FILE)
 *     • One row per (user_id, language, tutorial_slug).
 *     • Written only when a user passes ALL steps in a chapter.
 *     • Used for: ✓ checkmarks on tutorial cards, XP, streaks, badges.
 *     • DO NOT use for progress bar counts — partial chapters count as zero.
 *
 *   step_progress  (see lib/db/step-progress.ts)
 *     • One row per (user_id, language, tutorial_slug, step_index).
 *     • Written for every individual step pass.
 *     • Source of truth for ALL "X / 101 lessons" progress bars.
 * ───────────────────────────────────────────────────────────────────────────
 */
import { getSql } from "./client";
import { clearStepProgress } from "./step-progress";

const DEFAULT_LANG = "go";

/**
 * Lazy migration — called only before WRITES, never before reads.
 * Non-throwing so a DDL hiccup never blocks inserts; the write has its own fallback.
 */
let _migrated = false;
async function ensureLanguageColumn(): Promise<void> {
  if (_migrated) return;
  const sql = getSql();
  try {
    // Add language column with default 'go' (no-op if already present)
    await sql`ALTER TABLE progress ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'go'`;
    // Backfill any pre-migration NULLs
    await sql`UPDATE progress SET language = 'go' WHERE language IS NULL OR language = ''`;
    // Add 3-column unique constraint; ignore 42P07 (already exists)
    await sql`
      ALTER TABLE progress
      ADD CONSTRAINT progress_user_id_language_tutorial_slug_key
      UNIQUE (user_id, language, tutorial_slug)
    `.catch((e: unknown) => {
      if ((e as { code?: string })?.code !== "42P07") throw e;
    });
    // Drop old 2-column constraint (IF EXISTS = no-op once gone)
    await sql`ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_user_id_tutorial_slug_key`;
    _migrated = true;
  } catch (err) {
    console.warn("[progress] ensureLanguageColumn warning:", err);
  }
}

/**
 * Get completed tutorial slugs for a language.
 *
 * Uses COALESCE(language, 'go') so rows that were stored before the language
 * column existed (language IS NULL) are still returned for Go queries, even if
 * the migration hasn't backfilled them yet. Falls back gracefully if the column
 * doesn't exist at all.
 */
export async function getProgress(userId: number, language: string = DEFAULT_LANG): Promise<string[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT tutorial_slug FROM progress
      WHERE user_id = ${userId}
        AND COALESCE(language, ${DEFAULT_LANG}) = ${language}
      ORDER BY completed_at
    `;
    return rows.map((r) => r.tutorial_slug as string);
  } catch {
    // language column doesn't exist — treat all rows as Go
    if (language !== DEFAULT_LANG) return [];
    const rows = await sql`
      SELECT tutorial_slug FROM progress WHERE user_id = ${userId} ORDER BY completed_at
    `;
    return rows.map((r) => r.tutorial_slug as string);
  }
}

/**
 * All completed tutorial slugs grouped by language — used by /api/progress/all
 * and the public profile page.
 *
 * COALESCE maps pre-migration NULLs → 'go' so old data is never lost.
 */
export async function getAllProgressByUser(userId: number): Promise<Map<string, string[]>> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT COALESCE(language, ${DEFAULT_LANG}) AS language, tutorial_slug
      FROM progress
      WHERE user_id = ${userId}
      ORDER BY completed_at
    `;
    const result = new Map<string, string[]>();
    for (const r of rows) {
      const lang = (r.language as string) ?? DEFAULT_LANG;
      if (!result.has(lang)) result.set(lang, []);
      result.get(lang)!.push(r.tutorial_slug as string);
    }
    return result;
  } catch {
    // language column doesn't exist — return all slugs as Go
    const rows = await sql`SELECT tutorial_slug FROM progress WHERE user_id = ${userId}`;
    const slugs = rows.map((r) => r.tutorial_slug as string);
    return slugs.length > 0 ? new Map([[DEFAULT_LANG, slugs]]) : new Map();
  }
}

/** If language is omitted, returns total count across all languages. */
export async function getProgressCount(userId: number, language?: string): Promise<number> {
  const sql = getSql();
  if (language === undefined) {
    const [row] = await sql`SELECT COUNT(*)::int AS c FROM progress WHERE user_id = ${userId}`;
    return (row?.c as number) ?? 0;
  }
  try {
    const [row] = await sql`
      SELECT COUNT(*)::int AS c FROM progress
      WHERE user_id = ${userId} AND COALESCE(language, ${DEFAULT_LANG}) = ${language}
    `;
    return (row?.c as number) ?? 0;
  } catch {
    if (language !== DEFAULT_LANG) return 0;
    const [row] = await sql`SELECT COUNT(*)::int AS c FROM progress WHERE user_id = ${userId}`;
    return (row?.c as number) ?? 0;
  }
}

export async function markComplete(
  userId: number,
  tutorialSlug: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  await ensureLanguageColumn();
  const sql = getSql();
  try {
    // Preferred path: uses the 3-column unique constraint
    await sql`
      INSERT INTO progress (user_id, tutorial_slug, language)
      VALUES (${userId}, ${tutorialSlug}, ${language})
      ON CONFLICT (user_id, language, tutorial_slug) DO NOTHING
    `;
  } catch {
    // Fallback: constraint might not exist yet — use safe WHERE NOT EXISTS insert
    await sql`
      INSERT INTO progress (user_id, tutorial_slug, language)
      SELECT ${userId}, ${tutorialSlug}, ${language}
      WHERE NOT EXISTS (
        SELECT 1 FROM progress
        WHERE user_id = ${userId}
          AND tutorial_slug = ${tutorialSlug}
          AND COALESCE(language, ${DEFAULT_LANG}) = ${language}
      )
    `;
  }
}

export async function markIncomplete(
  userId: number,
  tutorialSlug: string,
  language: string = DEFAULT_LANG
): Promise<void> {
  const sql = getSql();
  await sql`
    DELETE FROM progress
    WHERE user_id = ${userId}
      AND tutorial_slug = ${tutorialSlug}
      AND COALESCE(language, ${DEFAULT_LANG}) = ${language}
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
