import { getSql } from "./client";

/** Users not yet sent a streak reminder today. */
export async function filterUsersNotRemindedToday(userIds: number[]): Promise<number[]> {
  if (userIds.length === 0) return [];
  const sql = getSql();
  const rows = await sql`
    SELECT u.id
    FROM unnest(${userIds}::int[]) AS u(id)
    WHERE NOT EXISTS (
      SELECT 1 FROM streak_reminder_log s
      WHERE s.user_id = u.id AND s.sent_on = CURRENT_DATE
    )
  `;
  return rows.map((r) => r.id as number);
}

export async function markStreakRemindersSent(userIds: number[]): Promise<void> {
  if (userIds.length === 0) return;
  const sql = getSql();
  await sql`
    INSERT INTO streak_reminder_log (user_id, sent_on)
    SELECT unnest(${userIds}::int[]), CURRENT_DATE
    ON CONFLICT (user_id, sent_on) DO NOTHING
  `;
}
