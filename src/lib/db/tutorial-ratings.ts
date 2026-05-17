import { getSql } from "./client";

export async function ensureTutorialRatingsTable(): Promise<void> {
  /* schema via npm run migrate */
}

/** Submit or update a thumbs rating. 1 = up, -1 = down. */
export async function rateTutorial(
  userId: string,
  lang: string,
  tutorialSlug: string,
  rating: 1 | -1,
): Promise<void> {
  await ensureTutorialRatingsTable();
  const sql = getSql();
  await sql`
    INSERT INTO tutorial_ratings (user_id, lang, tutorial_slug, rating)
    VALUES (${userId}, ${lang}, ${tutorialSlug}, ${rating})
    ON CONFLICT (user_id, lang, tutorial_slug)
    DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
  `;
}

/** Get a user's existing rating for a tutorial, or null if not rated yet. */
export async function getUserTutorialRating(
  userId: string,
  lang: string,
  tutorialSlug: string,
): Promise<1 | -1 | null> {
  await ensureTutorialRatingsTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT rating FROM tutorial_ratings
    WHERE user_id = ${userId} AND lang = ${lang} AND tutorial_slug = ${tutorialSlug}
  `;
  return row ? (row.rating as 1 | -1) : null;
}
