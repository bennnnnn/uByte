/**
 * Weekly progress digest — DB helpers.
 *
 * Tracks which users have received the weekly digest email so the cron
 * never double-sends within the same week.
 *
 * The digest is sent to users who:
 *   - Have a verified email
 *   - Were active at least once in the past 30 days
 *   - Have NOT received the digest email in the past 6 days
 *     (prevents double-send if cron fires twice in a week)
 */
import { getSql } from "./client";


async function ensureTable(): Promise<void> {
  /* schema via npm run migrate */
}

export interface WeeklyDigestUser {
  id: number;
  name: string;
  email: string;
  streak_days: number;
  xp: number;
  /** Tutorials (step completions) in the past 7 days */
  tutorials_this_week: number;
}

/**
 * Returns active users who are due for the weekly digest.
 * Active = had at least one activity_log entry in the past 30 days.
 * Due = have not received the digest in the past 6 days.
 */
export async function getUsersForWeeklyDigest(): Promise<WeeklyDigestUser[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u.streak_days,
      u.xp,
      COALESCE(sp.tutorials_this_week, 0) AS tutorials_this_week
    FROM users u

    INNER JOIN (
      SELECT DISTINCT user_id
      FROM activity_log
      WHERE created_at > NOW() - INTERVAL '30 days'
    ) active ON active.user_id = u.id

    LEFT JOIN (
      SELECT user_id, COUNT(*) AS tutorials_this_week
      FROM step_progress
      WHERE completed_at > NOW() - INTERVAL '7 days'
      GROUP BY user_id
    ) sp ON sp.user_id = u.id

    WHERE u.email_verified = 1
      AND u.email IS NOT NULL
      AND COALESCE(u.email_marketing, 1) = 1
      AND NOT EXISTS (
        SELECT 1 FROM weekly_digest_log dl
        WHERE dl.user_id = u.id
          AND dl.sent_at > NOW() - INTERVAL '6 days'
      )

    AND COALESCE(sp.tutorials_this_week, 0) > 0

    LIMIT 1000
  `;
  return rows as WeeklyDigestUser[];
}

/** Mark that the weekly digest was sent to this user. */
export async function markWeeklyDigestSent(userId: number): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO weekly_digest_log (user_id)
    VALUES (${userId})
    ON CONFLICT DO NOTHING
  `;
}
