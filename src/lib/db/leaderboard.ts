import { getSql } from "./client";
import type { LeaderboardEntry } from "./types";

export type LeaderboardPeriod = "all" | "week";

type WeeklyLeaderboardRow = {
  id: number;
  name: string;
  avatar: string;
  streak_days: number;
  country: string | null;
  completed_count: number;
};

/** Get leaderboard using JOINs instead of correlated subqueries. */
export async function getLeaderboard(limit = 20, period: LeaderboardPeriod = "all"): Promise<LeaderboardEntry[]> {
  const sql = getSql();

  if (period === "week") {
    const rows = await sql`
      SELECT
        u.id,
        u.name,
        u.avatar,
        u.streak_days,
        u.country,
        COALESCE(p.weekly_completed_count, 0)::int AS completed_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS weekly_completed_count
        FROM progress
        WHERE completed_at >= NOW() - INTERVAL '7 days'
        GROUP BY user_id
      ) p ON p.user_id = u.id
      WHERE COALESCE(p.weekly_completed_count, 0) > 0
    `;

    return (rows as WeeklyLeaderboardRow[])
      .map((row) => ({
        id: row.id,
        name: row.name,
        avatar: row.avatar,
        // The product is tutorials-only, so weekly progress is weekly tutorial XP.
        xp: row.completed_count * 10,
        streak_days: row.streak_days,
        completed_count: row.completed_count,
        country: row.country,
      }))
      .sort((a, b) =>
        b.xp - a.xp ||
        b.completed_count - a.completed_count ||
        b.streak_days - a.streak_days ||
        a.id - b.id
      )
      .slice(0, limit);
  }

  const rows = await sql`
    SELECT
      u.id, u.name, u.avatar, u.xp, u.streak_days, u.country,
      COALESCE(p.completed_count, 0)::int AS completed_count
    FROM users u
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS completed_count
      FROM progress
      GROUP BY user_id
    ) p ON p.user_id = u.id
    WHERE u.xp > 0
    ORDER BY u.xp DESC
    LIMIT ${limit}
  `;

  return rows as LeaderboardEntry[];
}
