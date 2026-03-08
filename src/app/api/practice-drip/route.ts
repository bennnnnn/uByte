import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { getDripStatus } from "@/lib/db/practice-unlocks";
import { hasPaidAccess } from "@/lib/plans";
import { withErrorHandling } from "@/lib/api-utils";

/** Returns the user's practice drip status (unlocked slugs, allowance, etc.) */
export const GET = withErrorHandling("GET /api/practice-drip", async () => {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({
      isPro: false,
      loggedIn: false,
      unlockedSlugs: [],
      unlockedCount: 0,
      allowance: 0,
      maxFree: 10,
      dailyDrip: 2,
      isMaxed: false,
    });
  }

  const profile = await getUserById(user.userId);
  if (hasPaidAccess(profile?.plan)) {
    return NextResponse.json({
      isPro: true,
      loggedIn: true,
      unlockedSlugs: [],
      unlockedCount: 0,
      allowance: 0,
      maxFree: 0,
      dailyDrip: 0,
      isMaxed: false,
    });
  }

  const drip = await getDripStatus(user.userId, profile?.created_at ?? new Date());
  return NextResponse.json({
    isPro: false,
    loggedIn: true,
    ...drip,
  });
});
