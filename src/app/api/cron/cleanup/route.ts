/**
 * Daily cleanup cron — /api/cron/cleanup
 *
 * Runs once per day (scheduled in vercel.json).
 * Deletes read notifications older than 30 days.
 * Unread notifications are never deleted.
 *
 * Secured with CRON_SECRET to prevent unauthorised calls.
 */
import { NextRequest, NextResponse } from "next/server";
import { deleteOldNotifications } from "@/lib/db";
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

  const deletedNotifications = await deleteOldNotifications(30);

  console.log(`[cron/cleanup] Deleted ${deletedNotifications} old read notifications`);

  return NextResponse.json({
    ok: true,
    deleted: { notifications: deletedNotifications },
  });
});
