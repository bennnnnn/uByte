import { getSql } from "./client";

const TABLE_MISSING = "42P01"; // relation does not exist

/** Submit or update a thumbs rating. 1 = up, -1 = down. */
export async function rateTutorial(
  userId: string,
  lang: string,
  tutorialSlug: string,
  rating: 1 | -1,
): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      INSERT INTO tutorial_ratings (user_id, lang, tutorial_slug, rating)
      VALUES (${userId}, ${lang}, ${tutorialSlug}, ${rating})
      ON CONFLICT (user_id, lang, tutorial_slug)
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) return;
    throw err;
  }
}

/** Get a user's existing rating for a tutorial, or null if not rated yet. */
export async function getUserTutorialRating(
  userId: string,
  lang: string,
  tutorialSlug: string,
): Promise<1 | -1 | null> {
  const sql = getSql();
  try {
    const [row] = await sql`
      SELECT rating FROM tutorial_ratings
      WHERE user_id = ${userId} AND lang = ${lang} AND tutorial_slug = ${tutorialSlug}
    `;
    return row ? (row.rating as 1 | -1) : null;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) return null;
    throw err;
  }
}
