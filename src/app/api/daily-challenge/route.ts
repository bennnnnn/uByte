import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { getCurrentUser } from "@/lib/auth";
import { getSql } from "@/lib/db/client";

/** Returns a deterministic daily problem (changes at midnight UTC) + today's solver count. */
export const GET = withErrorHandling("GET /api/daily-challenge", async () => {
  const problems = getAllPracticeProblems();
  if (problems.length === 0) return NextResponse.json({ error: "No problems" }, { status: 500 });

  // Pick today's problem deterministically by epoch-day
  const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const problem = problems[epochDay % problems.length];

  // Today's date string (UTC)
  const today = new Date().toISOString().slice(0, 10); // "2026-03-10"

  // Count how many users solved this problem today
  const sql = getSql();
  let solvedToday = 0;
  let userSolvedToday = false;

  try {
    const [row] = await sql`
      SELECT COUNT(DISTINCT user_id)::int AS count
      FROM practice_attempts
      WHERE problem_slug = ${problem.slug}
        AND status = 'solved'
        AND updated_at::date = ${today}::date
    `;
    solvedToday = (row as { count: number }).count ?? 0;

    // Check if the current user solved it today
    const authUser = await getCurrentUser();
    if (authUser) {
      const [userRow] = await sql`
        SELECT 1 FROM practice_attempts
        WHERE user_id = ${authUser.userId}
          AND problem_slug = ${problem.slug}
          AND status = 'solved'
          AND updated_at::date = ${today}::date
        LIMIT 1
      `;
      userSolvedToday = !!userRow;
    }
  } catch {
    // DB stats are non-critical — continue with defaults (0 solvers, not solved)
  }

  return NextResponse.json({
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    category: problem.category,
    solvedToday,
    userSolvedToday,
    date: today,
  });
});
