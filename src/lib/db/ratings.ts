import { getSql } from "./client";
import type { Rating } from "./types";

const DEFAULT_LANG = "go";

async function ensureRatingsSchema(): Promise<void> {
  /* schema via npm run migrate */
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

/**
 * Returns a slug → {thumbs_up, thumbs_down} map for all tutorials in a language.
 * Merges both the legacy `ratings` table and the newer `tutorial_ratings` table.
 * Used by the tutorial listing page to show satisfaction scores on cards.
 */
export async function getTutorialRatingsByLang(
  lang: string,
): Promise<Record<string, { thumbs_up: number; thumbs_down: number }>> {
  await ensureRatingsSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT tutorial_slug,
      SUM(CASE WHEN value = 1  THEN 1 ELSE 0 END)::int AS thumbs_up,
      SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END)::int AS thumbs_down
    FROM ratings
    WHERE language = ${lang}
    GROUP BY tutorial_slug
    UNION ALL
    SELECT tutorial_slug,
      SUM(CASE WHEN rating = 1  THEN 1 ELSE 0 END)::int AS thumbs_up,
      SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END)::int AS thumbs_down
    FROM tutorial_ratings
    WHERE lang = ${lang}
    GROUP BY tutorial_slug
  `;

  const map: Record<string, { thumbs_up: number; thumbs_down: number }> = {};
  for (const row of rows) {
    const slug = row.tutorial_slug as string;
    if (!map[slug]) map[slug] = { thumbs_up: 0, thumbs_down: 0 };
    map[slug].thumbs_up  += (row.thumbs_up  as number) ?? 0;
    map[slug].thumbs_down += (row.thumbs_down as number) ?? 0;
  }
  return map;
}
