import { getSql } from "./client";
import type { ActivityLog } from "./types";

export async function logActivity(
  userId: number,
  action: string,
  detail: string = ""
): Promise<void> {
  const sql = getSql();
  await sql`INSERT INTO activity_log (user_id, action, detail) VALUES (${userId}, ${action}, ${detail})`;
}

export async function getActivityCount(userId: number): Promise<number> {
  const sql = getSql();
  const [row] = await sql`SELECT COUNT(*)::int AS c FROM activity_log WHERE user_id = ${userId}`;
  return (row?.c as number) ?? 0;
}

export async function getRecentActivity(
  userId: number,
  limit = 10
): Promise<ActivityLog[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, action, detail, created_at FROM activity_log
    WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as ActivityLog[];
}
