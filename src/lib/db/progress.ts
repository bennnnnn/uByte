import { getSql } from "./client";

export async function getProgress(userId: number): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT tutorial_slug FROM progress WHERE user_id = ${userId} ORDER BY completed_at
  `;
  return rows.map((r) => r.tutorial_slug as string);
}

export async function getProgressCount(userId: number): Promise<number> {
  const sql = getSql();
  const [row] = await sql`SELECT COUNT(*)::int AS c FROM progress WHERE user_id = ${userId}`;
  return (row?.c as number) ?? 0;
}

export async function markComplete(userId: number, tutorialSlug: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO progress (user_id, tutorial_slug)
    VALUES (${userId}, ${tutorialSlug})
    ON CONFLICT (user_id, tutorial_slug) DO NOTHING
  `;
}

export async function markIncomplete(userId: number, tutorialSlug: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM progress WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug}`;
}

export async function resetAllProgress(userId: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM progress WHERE user_id = ${userId}`;
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
