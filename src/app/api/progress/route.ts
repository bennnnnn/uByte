import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProgress, markComplete, markIncomplete, addXp, logActivity, updateStreak, getUserById, addStreakFreeze } from "@/lib/db";
import { checkBadges, BADGE_MAP } from "@/lib/badges";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/progress", async () => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ progress: [] });
  }
  const progress = await getProgress(user.userId);
  return NextResponse.json({ progress });
});

export const POST = withErrorHandling("POST /api/progress", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`progress:post:${ip}:${user.userId}`, 60, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug, completed } = await request.json();
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  if (completed) {
    await markComplete(user.userId, slug);
    await addXp(user.userId, 10);
    await logActivity(user.userId, "complete", slug);

    const today = new Date().toISOString().slice(0, 10);
    const dbUserBefore = await getUserById(user.userId);
    const isSpeedster = dbUserBefore?.created_at?.startsWith(today) ?? false;

    const { streak_days } = await updateStreak(user.userId);

    const newBadges = await checkBadges(user.userId, {
      streakDays: streak_days,
      justCompletedSlug: slug,
      speedster: isSpeedster,
    });
    for (const key of newBadges) {
      const badge = BADGE_MAP[key];
      if (badge) await addXp(user.userId, badge.xpReward);
    }

    // Award streak freeze every 7 days (capped at 3)
    if (streak_days > 0 && streak_days % 7 === 0) {
      await addStreakFreeze(user.userId);
    }
  } else {
    await markIncomplete(user.userId, slug);
  }

  const progress = await getProgress(user.userId);
  return NextResponse.json({ progress });
});
