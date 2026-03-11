import { getSql } from "./client";
import type { LeaderboardEntry } from "./types";
import { ensurePracticeAttemptsTable } from "./practice-attempts";

export type LeaderboardPeriod = "all" | "week";

/** Get leaderboard using JOINs instead of correlated subqueries. */
export async function getLeaderboard(limit = 20, period: LeaderboardPeriod = "all"): Promise<LeaderboardEntry[]> {
  await ensurePracticeAttemptsTable();
  const sql = getSql();

  const weekFilter = period === "week"
    ? sql`WHERE u.last_active_at IS NOT NULL AND u.last_active_at::timestamptz >= NOW() - INTERVAL '7 days'`
    : sql``;

  const rows = await sql`
    SELECT
      u.id, u.name, u.avatar, u.xp, u.streak_days,
      COALESCE(p.completed_count, 0)::int AS completed_count,
      COALESCE(pa.problems_solved, 0)::int AS problems_solved
    FROM users u
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS completed_count
      FROM progress
      GROUP BY user_id
    ) p ON p.user_id = u.id
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS problems_solved
      FROM practice_attempts
      WHERE status = 'solved'
      GROUP BY user_id
    ) pa ON pa.user_id = u.id
    ${weekFilter}
    ORDER BY u.xp DESC
    LIMIT ${limit}
  `;

  return rows as LeaderboardEntry[];
}
