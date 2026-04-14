import { getSql } from "./client";
import type { LeaderboardEntry } from "./types";
import { XP_BY_DIFFICULTY } from "@/lib/constants";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";

export type LeaderboardPeriod = "all" | "week";

type WeeklyLeaderboardRow = {
  id: number;
  name: string;
  avatar: string;
  streak_days: number;
  country: string | null;
  completed_count: number;
  problems_solved: number;
  weekly_problem_slugs: string[];
};

function getWeeklyProblemXp(problemSlugs: string[]): number {
  return problemSlugs.reduce((sum, slug) => {
    const difficulty = getPracticeProblemBySlug(slug)?.difficulty;
    return sum + (difficulty ? XP_BY_DIFFICULTY[difficulty] ?? 0 : 0);
  }, 0);
}

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
        COALESCE(p.weekly_completed_count, 0)::int AS completed_count,
        COALESCE(pa.weekly_problems_solved, 0)::int AS problems_solved,
        COALESCE(pa.weekly_problem_slugs, ARRAY[]::text[]) AS weekly_problem_slugs
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS weekly_completed_count
        FROM progress
        WHERE completed_at >= NOW() - INTERVAL '7 days'
        GROUP BY user_id
      ) p ON p.user_id = u.id
      LEFT JOIN (
        SELECT
          user_id,
          COUNT(*) FILTER (
            WHERE status = 'solved' AND updated_at >= NOW() - INTERVAL '7 days'
          )::int AS weekly_problems_solved,
          COALESCE(
            ARRAY_AGG(problem_slug) FILTER (
              WHERE status = 'solved' AND updated_at >= NOW() - INTERVAL '7 days'
            ),
            ARRAY[]::text[]
          ) AS weekly_problem_slugs
        FROM practice_attempts
        GROUP BY user_id
      ) pa ON pa.user_id = u.id
      WHERE COALESCE(p.weekly_completed_count, 0) > 0
         OR COALESCE(pa.weekly_problems_solved, 0) > 0
    `;

    return (rows as WeeklyLeaderboardRow[])
      .map((row) => ({
        id: row.id,
        name: row.name,
        avatar: row.avatar,
        xp: row.completed_count * 10 + getWeeklyProblemXp(row.weekly_problem_slugs ?? []),
        streak_days: row.streak_days,
        completed_count: row.completed_count,
        problems_solved: row.problems_solved,
        country: row.country,
      }))
      .sort((a, b) =>
        b.xp - a.xp ||
        b.completed_count - a.completed_count ||
        b.problems_solved - a.problems_solved ||
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
