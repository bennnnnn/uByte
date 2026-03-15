import { getSql } from "./client";
import type { Rating } from "./types";

const DEFAULT_LANG = "go";

let _ratingsReady = false;
async function ensureRatingsSchema(): Promise<void> {
  if (_ratingsReady) return;
  const sql = getSql();
  // Add language column if table existed before multi-language support
  await sql`
    DO $$ BEGIN
      ALTER TABLE ratings ADD COLUMN language TEXT NOT NULL DEFAULT 'go';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$
  `;
  // Migrate unique constraint to include language
  await sql`
    DO $$ BEGIN
      ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_user_id_tutorial_slug_key;
      ALTER TABLE ratings ADD CONSTRAINT ratings_user_lang_slug_key UNIQUE (user_id, language, tutorial_slug);
    EXCEPTION WHEN duplicate_table THEN NULL;
    END $$
  `;
  _ratingsReady = true;
}

export async function rateTutorial(
  userId: number,
  tutorialSlug: string,
  value: 1 | -1,
  language: string = DEFAULT_LANG
): Promise<void> {
  await ensureRatingsSchema();
  const sql = getSql();
  await sql`
    INSERT INTO ratings (user_id, tutorial_slug, value, language)
    VALUES (${userId}, ${tutorialSlug}, ${value}, ${language})
    ON CONFLICT (user_id, language, tutorial_slug) DO UPDATE SET value = EXCLUDED.value
  `;
}

export async function getTutorialRating(
  tutorialSlug: string,
  userId?: number,
  language: string = DEFAULT_LANG
): Promise<Rating> {
  await ensureRatingsSchema();
  const sql = getSql();
  const [agg] = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0)::int AS thumbs_up,
      COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0)::int AS thumbs_down
    FROM ratings
    WHERE tutorial_slug = ${tutorialSlug} AND (language = ${language} OR language IS NULL)
  `;

  let userVote: number | null = null;
  if (userId) {
    const [row] = await sql`
      SELECT value FROM ratings
      WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug} AND (language = ${language} OR language IS NULL)
    `;
    userVote = (row?.value as number) ?? null;
  }

  return {
    tutorial_slug: tutorialSlug,
    thumbs_up: (agg?.thumbs_up as number) ?? 0,
    thumbs_down: (agg?.thumbs_down as number) ?? 0,
    user_vote: userVote,
  };
}
