import { getSql } from "./client";
import type { LeaderboardEntry } from "./types";

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.name, u.avatar, u.xp, u.streak_days,
      (SELECT COUNT(*)::int FROM progress WHERE user_id = u.id) AS completed_count
    FROM users u
    ORDER BY u.xp DESC
    LIMIT ${limit}
  `;
  return rows as LeaderboardEntry[];
}
