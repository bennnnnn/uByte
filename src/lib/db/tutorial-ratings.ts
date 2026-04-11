import { getSql } from "./client";

let _ready = false;
export async function ensureTutorialRatingsTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS tutorial_ratings (
      user_id       TEXT NOT NULL,
      lang          TEXT NOT NULL,
      tutorial_slug TEXT NOT NULL,
      rating        SMALLINT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, lang, tutorial_slug)
    )
  `;
  _ready = true;
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
