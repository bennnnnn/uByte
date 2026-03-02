import { NextResponse } from "next/server";
import { getUserById, getProgress, getAchievements, getBookmarks, getRecentActivity } from "@/lib/db";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/profile/export", async () => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const [dbUser, progress, achievements, bookmarks, activity] = await Promise.all([
    getUserById(user.userId),
    getProgress(user.userId),
    getAchievements(user.userId),
    getBookmarks(user.userId, 1000, 0),
    getRecentActivity(user.userId, 100),
  ]);

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar,
      bio: dbUser.bio,
      xp: dbUser.xp,
      streak_days: dbUser.streak_days,
      longest_streak: dbUser.longest_streak,
      created_at: dbUser.created_at,
      last_active_at: dbUser.last_active_at,
    },
    progress,
    achievements,
    bookmarks,
    activity,
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="go-tutorials-data-${user.userId}.json"`,
    },
  });
});
