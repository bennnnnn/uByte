import { getSql } from "./client";
import type { ActivityLog } from "./types";

const TABLE_MISSING = "42P01"; // PostgreSQL: relation does not exist

async function ensureActivityTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS activity_log (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action     TEXT NOT NULL,
      detail     TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_activity_log_user
    ON activity_log(user_id, created_at DESC)
  `;
}

export async function logActivity(
  userId: number,
  action: string,
  detail: string = ""
): Promise<void> {
  const sql = getSql();
  try {
    await sql`INSERT INTO activity_log (user_id, action, detail) VALUES (${userId}, ${action}, ${detail})`;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureActivityTable();
      await sql`INSERT INTO activity_log (user_id, action, detail) VALUES (${userId}, ${action}, ${detail})`;
      return;
    }
    throw err;
  }
}

export async function getActivityCount(userId: number): Promise<number> {
  const sql = getSql();
  try {
    const [row] = await sql`SELECT COUNT(*)::int AS c FROM activity_log WHERE user_id = ${userId}`;
    return (row?.c as number) ?? 0;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) return 0;
    throw err;
  }
}

export async function getRecentActivity(
  userId: number,
  limit = 10
): Promise<ActivityLog[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT id, action, detail, created_at FROM activity_log
      WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}
    `;
    return rows as ActivityLog[];
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) return [];
    throw err;
  }
}
