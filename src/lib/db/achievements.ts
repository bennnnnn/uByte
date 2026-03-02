import { getSql } from "./client";
import type { Achievement } from "./types";

export async function getAchievements(userId: number): Promise<Achievement[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT badge_key, unlocked_at FROM achievements WHERE user_id = ${userId} ORDER BY unlocked_at
  `;
  return rows as Achievement[];
}

export async function unlockAchievement(userId: number, badgeKey: string): Promise<boolean> {
  const sql = getSql();
  try {
    const rows = await sql`
      INSERT INTO achievements (user_id, badge_key) VALUES (${userId}, ${badgeKey})
      ON CONFLICT (user_id, badge_key) DO NOTHING
      RETURNING id
    `;
    return (rows as Record<string, unknown>[]).length > 0;
  } catch {
    return false;
  }
}
