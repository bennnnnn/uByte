import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserById,
  getAllProgressByUser,
  getCompletedStepCountByLanguage,
  getPageViewCount,
  getUnreadNotificationCount,
} from "@/lib/db";

const VISITOR_COOKIE = "visitor_id";
const FREE_PAGE_LIMIT = 20;

function buildProfile(user: Awaited<ReturnType<typeof getUserById>>) {
  if (!user) return null;

  return {
    avatar: user.avatar,
    bio: user.bio,
    theme: user.theme,
    xp: user.xp,
    streak_days: user.streak_days,
    plan: user.plan ?? "free",
    subscription_expires_at: user.subscription_expires_at ?? null,
    email_verified: user.email_verified,
    is_admin: user.is_admin,
    onboarding_goal: user.onboarding_goal ?? null,
    onboarding_lang: user.onboarding_lang ?? null,
  };
}

export const GET = withErrorHandling("GET /api/app-state", async (request: NextRequest) => {
  const tokenUser = await getCurrentUser();

  if (!tokenUser) {
    const visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
    const viewCount = visitorId ? await getPageViewCount(visitorId) : 0;

    return NextResponse.json({
      user: null,
      profile: null,
      progress: {},
      stepCounts: {},
      unreadCount: 0,
      viewCount,
      limited: viewCount >= FREE_PAGE_LIMIT,
    });
  }

  const [user, byLang, stepCountMap, unreadCount] = await Promise.all([
    getUserById(tokenUser.userId),
    getAllProgressByUser(tokenUser.userId),
    getCompletedStepCountByLanguage(tokenUser.userId),
    getUnreadNotificationCount(tokenUser.userId),
  ]);

  if (!user) {
    return NextResponse.json({
      user: null,
      profile: null,
      progress: {},
      stepCounts: {},
      unreadCount: 0,
      viewCount: 0,
      limited: false,
    });
  }

  const progress: Record<string, string[]> = {};
  for (const [lang, slugs] of byLang) {
    progress[lang] = slugs;
  }

  const stepCounts: Record<string, number> = {};
  for (const [lang, count] of stepCountMap) {
    stepCounts[lang] = count;
  }

  return NextResponse.json({
    user: { id: tokenUser.userId, name: tokenUser.name, email: tokenUser.email },
    profile: buildProfile(user),
    progress,
    stepCounts,
    unreadCount,
    viewCount: 0,
    limited: false,
  });
});
