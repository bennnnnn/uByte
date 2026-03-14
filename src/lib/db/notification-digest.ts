/**
 * Notification digest — DB helpers.
 *
 * Finds users who have unread reply/mention notifications they haven't
 * been emailed about yet, and tracks when the digest was last sent so
 * we never send the same batch twice.
 */
import { getSql } from "./client";

let _ready = false;

async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS notification_digest_log (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Expression-based unique constraints cannot live inside CREATE TABLE in
  // PostgreSQL. Use a unique index instead — ON CONFLICT DO NOTHING will
  // still honour it.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_digest_user_day
    ON notification_digest_log (user_id, (DATE_TRUNC('day', sent_at AT TIME ZONE 'UTC')))
  `;
  _ready = true;
}

export interface NotificationDigestItem {
  title: string;
  message: string;
}

export interface NotificationDigestUser {
  id: number;
  name: string;
  email: string;
  notifications: NotificationDigestItem[];
}

/**
 * Returns users who have unread reply/mention notifications created
 * in the past 24 hours and have NOT yet received a digest today.
 * Only users with a verified email and email_marketing enabled.
 */
export async function getUsersForNotificationDigest(): Promise<NotificationDigestUser[]> {
  await ensureTable();
  const sql = getSql();

  const rows = await sql`
    SELECT
      u.id,
      u.name,
      u.email,
      JSON_AGG(
        JSON_BUILD_OBJECT('title', n.title, 'message', n.message)
        ORDER BY n.created_at DESC
      ) AS notifications
    FROM users u
    INNER JOIN notifications n ON n.user_id = u.id
    WHERE
      n.read = FALSE
      AND n.type IN ('reply', 'mention')
      AND n.created_at > NOW() - INTERVAL '24 hours'
      AND u.email_verified = 1
      AND u.email IS NOT NULL
      AND COALESCE(u.email_marketing, 1) = 1
      AND NOT EXISTS (
        SELECT 1 FROM notification_digest_log dl
        WHERE dl.user_id = u.id
          AND dl.sent_at > NOW() - INTERVAL '20 hours'
      )
    GROUP BY u.id, u.name, u.email
    LIMIT 500
  `;

  return rows.map((r) => ({
    ...r,
    notifications: r.notifications as NotificationDigestItem[],
  })) as NotificationDigestUser[];
}

/** Mark that the notification digest was sent to this user today. */
export async function markNotificationDigestSent(userId: number): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO notification_digest_log (user_id)
    VALUES (${userId})
    ON CONFLICT DO NOTHING
  `;
}
