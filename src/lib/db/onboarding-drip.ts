/**
 * Onboarding email drip log.
 * Tracks which drip emails have been sent so the cron never double-sends.
 * email_type values: 'day1' | 'day3' | 'day7'
 *
 * The table is auto-created on first use (CREATE TABLE IF NOT EXISTS).
 * The welcome email (day0) is sent inline from /api/auth/signup and is
 * not logged here since it fires exactly once.
 */
import { getSql } from "./client";

let _ready = false;

async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS onboarding_email_log (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email_type TEXT    NOT NULL,
      sent_at    TEXT    DEFAULT (NOW()::text),
      UNIQUE(user_id, email_type)
    )
  `;
  _ready = true;
}

export type DripEmailType = "day1" | "day3" | "day7" | "day14" | "day30" | "trial_ending_2d" | "trial_ending_1d";

/** Returns true if the given email type has already been sent to this user. */
export async function hasReceivedDripEmail(
  userId: number,
  emailType: DripEmailType
): Promise<boolean> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT 1 FROM onboarding_email_log
    WHERE user_id = ${userId} AND email_type = ${emailType}
    LIMIT 1
  `;
  return rows.length > 0;
}

/** Marks the given drip email as sent for this user. */
export async function markDripEmailSent(
  userId: number,
  emailType: DripEmailType
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO onboarding_email_log (user_id, email_type)
    VALUES (${userId}, ${emailType})
    ON CONFLICT (user_id, email_type) DO NOTHING
  `;
}

/** Returns users who signed up exactly N days ago (±12h tolerance) and
 *  have NOT yet received the given drip email. */
export async function getUsersForDrip(
  daysAgo: number,
  emailType: DripEmailType
): Promise<Array<{ id: number; name: string; email: string }>> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE
      u.email_verified = 1
      AND COALESCE(u.email_marketing, 1) = 1
      AND u.created_at::timestamptz >= NOW() - INTERVAL '1 day' * ${daysAgo + 0.5}
      AND u.created_at::timestamptz <  NOW() - INTERVAL '1 day' * ${daysAgo - 0.5}
      AND NOT EXISTS (
        SELECT 1 FROM onboarding_email_log l
        WHERE l.user_id = u.id AND l.email_type = ${emailType}
      )
  `;
  return rows as Array<{ id: number; name: string; email: string }>;
}

/**
 * Returns users for win-back drip (day14 / day30):
 * - Signed up ~N days ago
 * - Have NOT been active (last_active_at) in the past 7 days
 * - Have NOT received this win-back email yet
 * - Email verified and marketing opted in
 */
export async function getUsersForWinBack(
  daysAgo: number,
  emailType: "day14" | "day30"
): Promise<Array<{ id: number; name: string; email: string }>> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE
      u.email_verified = 1
      AND COALESCE(u.email_marketing, 1) = 1
      AND u.created_at::timestamptz >= NOW() - INTERVAL '1 day' * ${daysAgo + 0.5}
      AND u.created_at::timestamptz <  NOW() - INTERVAL '1 day' * ${daysAgo - 0.5}
      AND (
        u.last_active_at IS NULL
        OR u.last_active_at::timestamptz < NOW() - INTERVAL '7 days'
      )
      AND NOT EXISTS (
        SELECT 1 FROM onboarding_email_log l
        WHERE l.user_id = u.id AND l.email_type = ${emailType}
      )
  `;
  return rows as Array<{ id: number; name: string; email: string }>;
}

/**
 * Returns users whose trial ends in ~N days and haven't received the warning email.
 * email_type: 'trial_ending_2d' | 'trial_ending_1d'
 */
export async function getUsersForTrialEndingWarning(
  daysUntilExpiry: number,
  emailType: string
): Promise<Array<{ id: number; name: string; email: string; plan: string; daysLeft: number }>> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.name, u.email, u.plan,
           EXTRACT(DAY FROM (u.subscription_expires_at::timestamptz - NOW()))::int AS "daysLeft"
    FROM users u
    WHERE
      u.email_verified = 1
      AND u.plan IN ('trial', 'trial_yearly')
      AND u.subscription_expires_at IS NOT NULL
      AND u.subscription_expires_at::timestamptz >= NOW() + INTERVAL '1 day' * ${daysUntilExpiry - 0.5}
      AND u.subscription_expires_at::timestamptz <  NOW() + INTERVAL '1 day' * ${daysUntilExpiry + 0.5}
      AND NOT EXISTS (
        SELECT 1 FROM onboarding_email_log l
        WHERE l.user_id = u.id AND l.email_type = ${emailType}
      )
  `;
  return rows as Array<{ id: number; name: string; email: string; plan: string; daysLeft: number }>;
}
