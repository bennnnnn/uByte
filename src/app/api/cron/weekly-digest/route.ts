/**
 * Weekly progress digest cron.
 * Run every Sunday at 8am UTC.
 *   { "path": "/api/cron/weekly-digest", "schedule": "0 8 * * 0" }
 *
 * Sends a personalised weekly recap to every user who:
 *   - Has a verified email
 *   - Was active in the past 30 days
 *   - Solved at least 1 problem OR completed at least 1 tutorial step this week
 *   - Has NOT received this email in the past 6 days (idempotent)
 *
 * Protected by CRON_SECRET header (same pattern as other crons).
 */
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getUsersForWeeklyDigest, markWeeklyDigestSent } from "@/lib/db";
import { sendWeeklyDigestEmail } from "@/lib/email";

export const GET = withErrorHandling(
  "GET /api/cron/weekly-digest",
  async (request: NextRequest) => {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }
    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await getUsersForWeeklyDigest();
    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await sendWeeklyDigestEmail({
          to: user.email,
          name: user.name,
          streakDays: user.streak_days,
          xp: user.xp,
          problemsThisWeek: user.problems_this_week,
          tutorialsThisWeek: user.tutorials_this_week,
        });
        await markWeeklyDigestSent(user.id);
        sent++;
      } catch (err) {
        console.error(`[weekly-digest] Failed for user ${user.id}:`, err);
        failed++;
      }
    }

    console.log(`[weekly-digest] Sent: ${sent}, Failed: ${failed}, Total: ${users.length}`);
    return NextResponse.json({ sent, failed, total: users.length });
  }
);
