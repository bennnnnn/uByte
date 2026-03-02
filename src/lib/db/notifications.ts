import { getSql } from "./client";
import type { Notification } from "./types";

let _notificationsReady = false;
async function ensureNotificationsTable(): Promise<void> {
  if (_notificationsReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL DEFAULT 'info',
      title      TEXT NOT NULL,
      message    TEXT NOT NULL DEFAULT '',
      read       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC)`;
  _notificationsReady = true;
}

export async function getNotifications(userId: number, limit = 20): Promise<Notification[]> {
  await ensureNotificationsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT id, user_id, type, title, message, read, created_at
    FROM notifications WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map((r) => ({ ...r, read: !!r.read })) as Notification[];
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  await ensureNotificationsTable();
  const sql = getSql();
  const [row] = await sql`SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = ${userId} AND read = FALSE`;
  return (row?.c as number) ?? 0;
}

export async function markNotificationsRead(userId: number): Promise<void> {
  await ensureNotificationsTable();
  const sql = getSql();
  await sql`UPDATE notifications SET read = TRUE WHERE user_id = ${userId}`;
}

export async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string
): Promise<void> {
  await ensureNotificationsTable();
  const sql = getSql();
  await sql`INSERT INTO notifications (user_id, type, title, message) VALUES (${userId}, ${type}, ${title}, ${message})`;
}
