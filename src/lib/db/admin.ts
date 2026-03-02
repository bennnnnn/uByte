import { getSql } from "./client";
import type { AdminUserRow, AdminTutorialRow, AdminRevenueStats } from "./types";
import { resetAllProgress } from "./progress";

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.name, u.email, u.xp, u.streak_days, u.created_at, u.last_active_at,
      u.is_admin, u.locked_until,
      (SELECT COUNT(*)::int FROM progress WHERE user_id = u.id) AS completed_count,
      (SELECT COUNT(*)::int FROM bookmarks WHERE user_id = u.id) AS bookmark_count
    FROM users u
    ORDER BY u.created_at DESC
  `;
  const now = new Date();
  return rows.map((r) => ({
    ...r,
    banned: !!r.locked_until && new Date(r.locked_until as string) > now,
  })) as AdminUserRow[];
}

export async function adminDeleteUser(userId: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

export async function adminBanUser(userId: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET locked_until = '2099-12-31 23:59:59' WHERE id = ${userId}`;
}

export async function adminUnbanUser(userId: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = ${userId}`;
}

export async function getAdminTutorialAnalytics(): Promise<AdminTutorialRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      p.tutorial_slug AS slug,
      COUNT(p.user_id)::int AS completed_count,
      COALESCE(SUM(CASE WHEN r.vote = 1 THEN 1 ELSE 0 END)::int, 0) AS thumbs_up,
      COALESCE(SUM(CASE WHEN r.vote = -1 THEN 1 ELSE 0 END)::int, 0) AS thumbs_down
    FROM progress p
    LEFT JOIN ratings r ON r.tutorial_slug = p.tutorial_slug AND r.user_id = p.user_id
    GROUP BY p.tutorial_slug
    ORDER BY completed_count DESC
  `;
  return rows as AdminTutorialRow[];
}

export async function adminResetUserProgress(userId: number): Promise<void> {
  return resetAllProgress(userId);
}

export async function setAdminStatus(userId: number, isAdmin: boolean): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET is_admin = ${isAdmin ? 1 : 0} WHERE id = ${userId}`;
}

// ─── Subscription Events ──────────────────────────────

let _subscriptionEventsReady = false;
async function ensureSubscriptionEventsTable(): Promise<void> {
  if (_subscriptionEventsReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS subscription_events (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
      plan         TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      event_type   TEXT NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_sub_events_created ON subscription_events(created_at DESC)`;
  _subscriptionEventsReady = true;
}

export async function recordSubscriptionEvent(
  userId: number | null,
  plan: string,
  amountCents: number,
  eventType: "activated" | "canceled"
): Promise<void> {
  await ensureSubscriptionEventsTable();
  const sql = getSql();
  await sql`
    INSERT INTO subscription_events (user_id, plan, amount_cents, event_type)
    VALUES (${userId}, ${plan}, ${amountCents}, ${eventType})
  `;
}

export async function getAdminRevenueStats(): Promise<AdminRevenueStats> {
  await ensureSubscriptionEventsTable();
  const sql = getSql();

  const [subscribers] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE plan != 'free')::int AS pro_subscribers,
      COUNT(*) FILTER (WHERE plan = 'pro' OR plan = 'monthly')::int AS monthly_subscribers,
      COUNT(*) FILTER (WHERE plan = 'yearly')::int AS yearly_subscribers
    FROM users
  `;

  const [revenue] = await sql`
    SELECT
      COALESCE(SUM(amount_cents) FILTER (WHERE created_at >= CURRENT_DATE), 0)::int AS today,
      COALESCE(SUM(amount_cents) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'), 0)::int AS this_week,
      COALESCE(SUM(amount_cents) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)), 0)::int AS this_month
    FROM subscription_events
    WHERE event_type = 'activated'
  `;

  const byDay = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS date,
      COALESCE(SUM(amount_cents), 0)::int AS revenue
    FROM subscription_events
    WHERE event_type = 'activated'
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY DATE_TRUNC('day', created_at)
  `;

  return {
    proSubscribers: (subscribers?.pro_subscribers as number) ?? 0,
    monthlySubscribers: (subscribers?.monthly_subscribers as number) ?? 0,
    yearlySubscribers: (subscribers?.yearly_subscribers as number) ?? 0,
    revenueToday: (revenue?.today as number) ?? 0,
    revenueThisWeek: (revenue?.this_week as number) ?? 0,
    revenueThisMonth: (revenue?.this_month as number) ?? 0,
    revenueByDay: byDay.map((r) => ({ date: r.date as string, revenue: r.revenue as number })),
  };
}
