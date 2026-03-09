/**
 * Onboarding email drip cron.
 * Run this daily (e.g., Vercel Cron: "0 10 * * *" — 10am UTC).
 *
 * Sends:
 *   Day 3 — re-engagement for users who haven't returned
 *   Day 7 — push certifications + Pro after one week
 *
 * Protected by CRON_SECRET (same as streak-reminder).
 * Add to vercel.json crons:
 *   { "path": "/api/cron/onboarding-drip", "schedule": "0 10 * * *" }
 */
import { NextRequest, NextResponse } from "next/server";
import { getUsersForDrip, markDripEmailSent } from "@/lib/db";
import { sendDay3Email, sendDay7Email } from "@/lib/email";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/cron/onboarding-drip", async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let day3Sent = 0;
  let day7Sent = 0;

  // ── Day 3 email ────────────────────────────────────────────────────────────
  const day3Users = await getUsersForDrip(3, "day3");
  for (const user of day3Users) {
    try {
      await sendDay3Email(user.email, user.name);
      await markDripEmailSent(user.id, "day3");
      day3Sent++;
    } catch {
      // Skip failed sends — don't abort the batch
    }
  }

  // ── Day 7 email ────────────────────────────────────────────────────────────
  const day7Users = await getUsersForDrip(7, "day7");
  for (const user of day7Users) {
    try {
      await sendDay7Email(user.email, user.name);
      await markDripEmailSent(user.id, "day7");
      day7Sent++;
    } catch {
      // Skip failed sends — don't abort the batch
    }
  }

  return NextResponse.json({ day3Sent, day7Sent });
});
