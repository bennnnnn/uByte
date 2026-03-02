import { getSql } from "./client";
import type { Rating } from "./types";

const DEFAULT_LANG = "go";

export async function rateTutorial(
  userId: number,
  tutorialSlug: string,
  value: 1 | -1,
  language: string = DEFAULT_LANG
): Promise<void> {
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
