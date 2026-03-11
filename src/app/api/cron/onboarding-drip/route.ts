/**
 * Onboarding + win-back + trial-ending email cron.
 * Run daily at 10am UTC: "0 10 * * *"
 *
 * Sends:
 *   Day 1  — 24h nudge (first lesson prompt)
 *   Day 3  — re-engagement for users who haven't returned
 *   Day 7  — push certifications + Pro upsell
 *   Day 14 — win-back for inactive users (no activity in 7d)
 *   Day 30 — final win-back (last automated email)
 *   Trial expiry warnings — 2 days and 1 day before trial ends
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getUsersForDrip,
  getUsersForWinBack,
  getUsersForTrialEndingWarning,
  markDripEmailSent,
} from "@/lib/db";
import {
  sendDay1Email,
  sendDay3Email,
  sendDay7Email,
  sendDay14WinBackEmail,
  sendDay30WinBackEmail,
  sendTrialEndingEmail,
} from "@/lib/email";
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

  let day1Sent = 0, day3Sent = 0, day7Sent = 0;
  let day14Sent = 0, day30Sent = 0;
  let trialWarningSent = 0;

  // ── Day 1 ────────────────────────────────────────────────────────────────
  for (const user of await getUsersForDrip(1, "day1")) {
    try {
      await sendDay1Email(user.email, user.name);
      await markDripEmailSent(user.id, "day1");
      day1Sent++;
    } catch { /* skip */ }
  }

  // ── Day 3 ────────────────────────────────────────────────────────────────
  for (const user of await getUsersForDrip(3, "day3")) {
    try {
      await sendDay3Email(user.email, user.name);
      await markDripEmailSent(user.id, "day3");
      day3Sent++;
    } catch { /* skip */ }
  }

  // ── Day 7 ────────────────────────────────────────────────────────────────
  for (const user of await getUsersForDrip(7, "day7")) {
    try {
      await sendDay7Email(user.email, user.name);
      await markDripEmailSent(user.id, "day7");
      day7Sent++;
    } catch { /* skip */ }
  }

  // ── Day 14 win-back (inactive users only) ───────────────────────────────
  for (const user of await getUsersForWinBack(14, "day14")) {
    try {
      await sendDay14WinBackEmail(user.email, user.name);
      await markDripEmailSent(user.id, "day14");
      day14Sent++;
    } catch { /* skip */ }
  }

  // ── Day 30 final win-back ────────────────────────────────────────────────
  for (const user of await getUsersForWinBack(30, "day30")) {
    try {
      await sendDay30WinBackEmail(user.email, user.name);
      await markDripEmailSent(user.id, "day30");
      day30Sent++;
    } catch { /* skip */ }
  }

  // ── Trial ending warnings (2 days out and 1 day out) ────────────────────
  const trialWarnings2d = await getUsersForTrialEndingWarning(2, "trial_ending_2d");
  const trialWarnings1d = await getUsersForTrialEndingWarning(1, "trial_ending_1d");

  for (const user of [...trialWarnings2d, ...trialWarnings1d]) {
    const emailType = user.daysLeft <= 1 ? "trial_ending_1d" : "trial_ending_2d";
    const plan = (user.plan === "trial_yearly" ? "trial_yearly" : "trial") as "trial" | "trial_yearly";
    try {
      await sendTrialEndingEmail(user.email, user.name, user.daysLeft, plan);
      await markDripEmailSent(user.id, emailType);
      trialWarningSent++;
    } catch { /* skip */ }
  }

  return NextResponse.json({
    day1Sent, day3Sent, day7Sent,
    day14Sent, day30Sent, trialWarningSent,
  });
});
