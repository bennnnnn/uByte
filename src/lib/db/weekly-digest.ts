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

let _ready = false;

async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS weekly_digest_log (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, DATE_TRUNC('week', sent_at))
    )
  `;
  _ready = true;
}

export interface WeeklyDigestUser {
  id: number;
  name: string;
  email: string;
  streak_days: number;
  xp: number;
  /** Problems solved in the past 7 days */
  problems_this_week: number;
  /** Tutorials completed in the past 7 days */
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
      COALESCE(pa.problems_this_week, 0)  AS problems_this_week,
      COALESCE(sp.tutorials_this_week, 0) AS tutorials_this_week
    FROM users u

    -- Only users active in the past 30 days
    INNER JOIN (
      SELECT DISTINCT user_id
      FROM activity_log
      WHERE created_at > NOW() - INTERVAL '30 days'
    ) active ON active.user_id = u.id

    -- Count problems solved this week
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS problems_this_week
      FROM practice_attempts
      WHERE status = 'accepted'
        AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY user_id
    ) pa ON pa.user_id = u.id

    -- Count tutorial steps completed this week (step_progress)
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS tutorials_this_week
      FROM step_progress
      WHERE completed_at > NOW() - INTERVAL '7 days'
      GROUP BY user_id
    ) sp ON sp.user_id = u.id

    -- Not already sent this week
    WHERE u.email_verified = 1
      AND u.email IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM weekly_digest_log dl
        WHERE dl.user_id = u.id
          AND dl.sent_at > NOW() - INTERVAL '6 days'
      )

    -- Only send to users who actually did something this week
    -- (problems OR tutorial steps > 0)
    AND (COALESCE(pa.problems_this_week, 0) + COALESCE(sp.tutorials_this_week, 0)) > 0

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
