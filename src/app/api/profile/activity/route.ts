import { NextRequest, NextResponse } from "next/server";
import { logActivity, updateStreak, getRecentActivity } from "@/lib/db";
import { checkBadges } from "@/lib/badges";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/profile/activity", async () => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const activity = await getRecentActivity(tokenUser.userId, 20);
  return NextResponse.json({ activity });
});

export const POST = withErrorHandling("POST /api/profile/activity", async (request: NextRequest) => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const { action, detail } = await request.json();
  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  await logActivity(tokenUser.userId, action, detail || "");
  const { streak_days } = await updateStreak(tokenUser.userId);
  const newBadges = await checkBadges(tokenUser.userId, { streakDays: streak_days });

  return NextResponse.json({ streak_days, newBadges });
});
