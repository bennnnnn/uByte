import { getSql } from "./client";
import type { LeaderboardEntry } from "./types";
import { ensurePracticeAttemptsTable } from "./practice-attempts";

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  await ensurePracticeAttemptsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.name, u.avatar, u.xp, u.streak_days,
      (SELECT COUNT(*)::int FROM progress        WHERE user_id = u.id) AS completed_count,
      (SELECT COUNT(*)::int FROM practice_attempts WHERE user_id = u.id AND status = 'solved') AS problems_solved
    FROM users u
    ORDER BY u.xp DESC
    LIMIT ${limit}
  `;
  return rows as LeaderboardEntry[];
}
