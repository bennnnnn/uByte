import { NextResponse } from "next/server";
import { getUserById, getProgressCount, getAchievements, getActivityCount } from "@/lib/db";
import { BADGES } from "@/lib/badges";
import { getAllTutorials } from "@/lib/tutorials";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/profile/stats", async () => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const [user, completedCount, achievements, activityCount] = await Promise.all([
    getUserById(tokenUser.userId),
    getProgressCount(tokenUser.userId),
    getAchievements(tokenUser.userId),
    getActivityCount(tokenUser.userId),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    stats: {
      xp: user.xp,
      streak_days: user.streak_days,
      longest_streak: user.longest_streak,
      completed_count: completedCount,
      total_tutorials: getAllTutorials().length,
      activity_count: activityCount,
      created_at: user.created_at,
      last_active_at: user.last_active_at,
    },
    achievements,
    all_badges: BADGES,
  });
});
