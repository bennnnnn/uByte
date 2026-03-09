/**
 * Daily cleanup cron — /api/cron/cleanup
 *
 * Runs once per day (scheduled in vercel.json).
 * 1. Deletes read notifications older than 30 days.
 * 2. Downgrades "canceling" users whose billing period has now ended.
 *    (set by cancelUserPlanGracefully in the Paddle webhook on subscription.canceled)
 *
 * Secured with CRON_SECRET to prevent unauthorised calls.
 */
import { NextRequest, NextResponse } from "next/server";
import { deleteOldNotifications, downgradeExpiredCancelingUsers } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/cron/cleanup", async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deletedNotifications, expiredDowngrades] = await Promise.all([
    deleteOldNotifications(30),
    downgradeExpiredCancelingUsers(),
  ]);

  console.log(`[cron/cleanup] Deleted ${deletedNotifications} old notifications`);
  console.log(`[cron/cleanup] Downgraded ${expiredDowngrades} expired canceling subscriptions`);

  return NextResponse.json({
    ok: true,
    deleted: { notifications: deletedNotifications },
    downgraded: { expired_subscriptions: expiredDowngrades },
  });
});
