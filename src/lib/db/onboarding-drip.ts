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

export type DripEmailType = "day1" | "day3" | "day7";

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
      AND u.created_at::timestamptz >= NOW() - INTERVAL '1 day' * ${daysAgo + 0.5}
      AND u.created_at::timestamptz <  NOW() - INTERVAL '1 day' * ${daysAgo - 0.5}
      AND NOT EXISTS (
        SELECT 1 FROM onboarding_email_log l
        WHERE l.user_id = u.id AND l.email_type = ${emailType}
      )
  `;
  return rows as Array<{ id: number; name: string; email: string }>;
}
