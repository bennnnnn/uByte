import { NextRequest, NextResponse } from "next/server";
import { getUsersAtRiskOfLosingStreak, getPushSubscriptionsForUsers, deletePushSubscription } from "@/lib/db";
import { sendStreakReminderEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/web-push";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/cron/streak-reminder", async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getUsersAtRiskOfLosingStreak();
  const userIds = users.map((u) => u.id);

  // Fetch push subscriptions for at-risk users (multi-device support)
  const pushSubs = await getPushSubscriptionsForUsers(userIds);
  const subsByUser = new Map<number, typeof pushSubs>();
  for (const sub of pushSubs) {
    const list = subsByUser.get(sub.userId) ?? [];
    list.push(sub);
    subsByUser.set(sub.userId, list);
  }

  let emailsSent = 0;
  let pushSent = 0;

  for (const user of users) {
    // Send email reminder
    if (user.email) {
      try {
        await sendStreakReminderEmail(user.email, user.name, user.streak_days);
        emailsSent++;
      } catch { /* Skip — don't abort the batch */ }
    }

    // Send push notification to each subscribed device
    const subs = subsByUser.get(user.id) ?? [];
    for (const sub of subs) {
      const result = await sendPushNotification(sub.endpoint, sub.keys, {
        title: `🔥 ${user.streak_days}-day streak at risk!`,
        body: "Come back to uByte today before your streak resets.",
        url: "/tutorial/go",
      });
      if (result.ok) pushSent++;
      // Clean up expired subscriptions automatically
      if (result.expired) {
        deletePushSubscription(user.id, sub.endpoint).catch(() => {});
      }
    }
  }

  return NextResponse.json({ emailsSent, pushSent });
});
