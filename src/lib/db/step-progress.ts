/**
 * step-progress.ts — individual step completion tracking
 *
 * ─── PROGRESS MODEL ────────────────────────────────────────────────────────
 * A "lesson" = one STEP inside a tutorial chapter.
 * Go has ~20 chapters but 101 lessons (steps total).
 *
 * TWO tables, two purposes — do NOT mix them up:
 *
 *   step_progress  (THIS FILE)
 *     • One row per (user_id, language, tutorial_slug, step_index).
 *     • Written when a user passes or skips any individual step.
 *     • skipped=TRUE rows exist but are EXCLUDED from progress counts.
 *     • Source of truth for ALL "X / 101 lessons" progress bars.
 *
 *   progress  (see lib/db/progress.ts)
 *     • One row per (user_id, language, tutorial_slug).
 *     • Written only when a user finishes EVERY step in a chapter.
 *     • Used only for: ✓ checkmarks on tutorial cards, XP rewards, badges.
 *     • DO NOT use this table for progress bar counts — partial chapters
 *       would count as zero.
 * ───────────────────────────────────────────────────────────────────────────
 */
import { getSql } from "./client";

const DEFAULT_LANG = "go";

let _ready = false;
async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();

  // Create table with the correct 4-column PK (language included).
  // For existing deployments this is a no-op; the ALTER steps below handle migration.
  await sql`
    CREATE TABLE IF NOT EXISTS step_progress (
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tutorial_slug TEXT NOT NULL,
      step_index    INTEGER NOT NULL,
      language      TEXT NOT NULL DEFAULT 'go',
      completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      skipped       BOOLEAN NOT NULL DEFAULT FALSE,
      PRIMARY KEY (user_id, tutorial_slug, step_index, language)
    )
  `;

  // Add columns that may be missing from older table versions
  await sql`ALTER TABLE step_progress ADD COLUMN IF NOT EXISTS skipped  BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE step_progress ADD COLUMN IF NOT EXISTS language TEXT    NOT NULL DEFAULT 'go'`;

  // Migrate the primary key to include language.
  // Old PK was (user_id, tutorial_slug, step_index) — this caused non-Go step
  // progress to be silently dropped because different-language rows for the same
  // (user_id, slug, stepIndex) conflicted and the DO UPDATE never changed language.
  //
  // Drop the old 3-column PK (IF EXISTS is safe if migration already ran).
  await sql`ALTER TABLE step_progress DROP CONSTRAINT IF EXISTS step_progress_pkey`;

  // Add the new 4-column PK. Error 42P07 = already exists (e.g. fresh CREATE TABLE above).
  await sql`
    ALTER TABLE step_progress
    ADD CONSTRAINT step_progress_pkey
    PRIMARY KEY (user_id, tutorial_slug, step_index, language)
  `.catch((e: unknown) => {
    if ((e as { code?: string })?.code !== "42P07") throw e;
  });

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
    ON CONFLICT (user_id, tutorial_slug, step_index, language)
    DO UPDATE SET completed_at = NOW(), skipped = ${skipped}
  `;
}

/**
 * Returns how many non-skipped steps the user has completed per tutorial slug
 * for a given language. Used by the profile progress breakdown.
 * Returns only tutorials that have at least one completed step.
 */
export async function getStepProgressSummaryByLanguage(
  userId: number,
  language: string
): Promise<Map<string, number>> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT tutorial_slug, COUNT(*)::int AS cnt
    FROM step_progress
    WHERE user_id = ${userId} AND language = ${language} AND skipped = FALSE
    GROUP BY tutorial_slug
  `;
  const result = new Map<string, number>();
  for (const r of rows) {
    result.set(r.tutorial_slug as string, r.cnt as number);
  }
  return result;
}

/**
 * Count non-skipped completed steps per language for a user.
 * Used by /api/progress/all and the profile stats API so that
 * progress bars count individual steps, not whole tutorials.
 */
export async function getCompletedStepCountByLanguage(
  userId: number
): Promise<Map<string, number>> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT language, COUNT(*)::int AS cnt
    FROM step_progress
    WHERE user_id = ${userId} AND skipped = FALSE
    GROUP BY language
  `;
  const result = new Map<string, number>();
  for (const r of rows) {
    result.set(r.language as string, r.cnt as number);
  }
  return result;
}

/** Clear all step progress for a user (e.g. on profile reset). */
export async function clearStepProgress(userId: number): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM step_progress WHERE user_id = ${userId}`;
}
