/**
 * Referral API
 * GET  /api/referral  — returns the current user's invite code + stats
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateReferralCode, getReferralStats } from "@/lib/db";
import { BASE_URL } from "@/lib/constants";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/referral", async () => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getReferralStats(user.userId);
  return NextResponse.json({
    code: stats.code,
    shareUrl: `${BASE_URL}?ref=${stats.code}`,
    signups: stats.signups,
    subscribed: stats.subscribed,
  });
});
