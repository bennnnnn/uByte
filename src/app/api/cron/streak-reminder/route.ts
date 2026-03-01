import { NextRequest, NextResponse } from "next/server";
import { getUsersAtRiskOfLosingStreak } from "@/lib/db";
import { sendStreakReminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const users = await getUsersAtRiskOfLosingStreak();

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;
    try {
      await sendStreakReminderEmail(user.email, user.name, user.streak_days);
      sent++;
    } catch {
      // Skip failed sends — don't abort the whole batch
    }
  }

  return NextResponse.json({ sent });
}
