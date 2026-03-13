/**
 * Daily notification digest cron.
 * Runs every day at noon UTC:
 *   { "path": "/api/cron/notification-digest", "schedule": "0 12 * * *" }
 *
 * Sends an email to every user who has unread reply/mention notifications
 * from the past 24 hours and hasn't been emailed about them yet today.
 * Protected by CRON_SECRET header.
 */
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import {
  getUsersForNotificationDigest,
  markNotificationDigestSent,
} from "@/lib/db/notification-digest";
import { sendNotificationDigestEmail } from "@/lib/email";

export const GET = withErrorHandling(
  "GET /api/cron/notification-digest",
  async (request: NextRequest) => {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }
    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await getUsersForNotificationDigest();
    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await sendNotificationDigestEmail({
          to: user.email,
          name: user.name,
          notifications: user.notifications,
        });
        await markNotificationDigestSent(user.id);
        sent++;
      } catch (err) {
        console.error(`[notification-digest] Failed for user ${user.id}:`, err);
        failed++;
      }
    }

    console.log(`[notification-digest] Sent: ${sent}, Failed: ${failed}, Total: ${users.length}`);
    return NextResponse.json({ sent, failed, total: users.length });
  },
);
