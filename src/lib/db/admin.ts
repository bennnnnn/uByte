import { getSql } from "./client";
import type { AdminUserRow, AdminTutorialRow, AdminRevenueStats } from "./types";
import { resetAllProgress } from "./progress";

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.name, u.email, u.xp, u.streak_days, u.created_at, u.last_active_at,
      u.is_admin, u.locked_until, COALESCE(u.plan, 'free') AS plan,
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

// ─── Step Checks (pass/fail heatmap) ──────────────────

let _stepChecksReady = false;
async function ensureStepChecksTable(): Promise<void> {
  if (_stepChecksReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS step_checks (
      id            SERIAL PRIMARY KEY,
      tutorial_slug TEXT NOT NULL,
      step_index    INTEGER NOT NULL,
      passed        BOOLEAN NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_step_checks_slug ON step_checks(tutorial_slug)`;
  _stepChecksReady = true;
}

export async function recordStepCheck(
  tutorialSlug: string,
  stepIndex: number,
  passed: boolean
): Promise<void> {
  await ensureStepChecksTable();
  const sql = getSql();
  await sql`
    INSERT INTO step_checks (tutorial_slug, step_index, passed)
    VALUES (${tutorialSlug}, ${stepIndex}, ${passed})
  `;
}

export async function getStepCheckStats(
  tutorialSlug: string
): Promise<{ step_index: number; pass_count: number; fail_count: number }[]> {
  await ensureStepChecksTable();
  const sql = getSql();
  const rows = await sql`
    SELECT
      step_index,
      COUNT(*) FILTER (WHERE passed = TRUE)::int  AS pass_count,
      COUNT(*) FILTER (WHERE passed = FALSE)::int AS fail_count
    FROM step_checks
    WHERE tutorial_slug = ${tutorialSlug}
    GROUP BY step_index
    ORDER BY step_index
  `;
  return rows as { step_index: number; pass_count: number; fail_count: number }[];
}

// ─── Admin Audit Log ──────────────────────────────────

let _auditLogReady = false;
async function ensureAuditLogTable(): Promise<void> {
  if (_auditLogReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id             SERIAL PRIMARY KEY,
      admin_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action         TEXT NOT NULL,
      target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC)`;
  _auditLogReady = true;
}

export async function getAdminAuditLog(
  limit = 100
): Promise<{ id: number; action: string; admin_name: string | null; target_name: string | null; created_at: string }[]> {
  await ensureAuditLogTable();
  const sql = getSql();
  const rows = await sql`
    SELECT
      a.id,
      a.action,
      a.created_at,
      adm.name AS admin_name,
      tgt.name AS target_name
    FROM admin_audit_log a
    LEFT JOIN users adm ON adm.id = a.admin_id
    LEFT JOIN users tgt ON tgt.id = a.target_user_id
    ORDER BY a.created_at DESC
    LIMIT ${limit}
  `;
  return rows as { id: number; action: string; admin_name: string | null; target_name: string | null; created_at: string }[];
}

export async function logAdminAction(
  adminId: number,
  action: string,
  targetUserId: number | null
): Promise<void> {
  await ensureAuditLogTable();
  const sql = getSql();
  await sql`
    INSERT INTO admin_audit_log (admin_id, action, target_user_id)
    VALUES (${adminId}, ${action}, ${targetUserId})
  `;
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

  const [revenueYear] = await sql`
    SELECT COALESCE(SUM(amount_cents) FILTER (WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)), 0)::int AS this_year
    FROM subscription_events
    WHERE event_type = 'activated'
  `;

  return {
    proSubscribers: (subscribers?.pro_subscribers as number) ?? 0,
    monthlySubscribers: (subscribers?.monthly_subscribers as number) ?? 0,
    yearlySubscribers: (subscribers?.yearly_subscribers as number) ?? 0,
    revenueToday: (revenue?.today as number) ?? 0,
    revenueThisWeek: (revenue?.this_week as number) ?? 0,
    revenueThisMonth: (revenue?.this_month as number) ?? 0,
    revenueByDay: byDay.map((r) => ({ date: r.date as string, revenue: r.revenue as number })),
    revenueThisYear: (revenueYear?.this_year as number) ?? 0,
  };
}

export type RevenuePeriod = "7days" | "month" | "year";

export async function getAdminRevenueByPeriod(
  period: RevenuePeriod
): Promise<{ date: string; revenue: number; label?: string }[]> {
  await ensureSubscriptionEventsTable();
  const sql = getSql();
  if (period === "7days") {
    const rows = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS date,
        COALESCE(SUM(amount_cents), 0)::int AS revenue
      FROM subscription_events
      WHERE event_type = 'activated'
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at)
    `;
    return rows.map((r) => ({ date: r.date as string, revenue: r.revenue as number }));
  }
  if (period === "month") {
    const rows = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS date,
        COALESCE(SUM(amount_cents), 0)::int AS revenue
      FROM subscription_events
      WHERE event_type = 'activated'
        AND created_at >= CURRENT_DATE - INTERVAL '1 month'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at)
    `;
    return rows.map((r) => ({ date: r.date as string, revenue: r.revenue as number }));
  }
  // year: last 12 months by month
  const rows = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS date,
      COALESCE(SUM(amount_cents), 0)::int AS revenue
    FROM subscription_events
    WHERE event_type = 'activated'
      AND created_at >= CURRENT_DATE - INTERVAL '1 year'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `;
  return rows.map((r) => ({ date: r.date as string, revenue: r.revenue as number }));
}

export interface AdminSubscriptionEventRow {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  plan: string;
  amount_cents: number;
  event_type: string;
  created_at: string;
}

export async function getAdminRecentSubscriptionEvents(
  limit = 50
): Promise<AdminSubscriptionEventRow[]> {
  await ensureSubscriptionEventsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT
      e.id,
      e.user_id,
      u.name AS user_name,
      u.email AS user_email,
      e.plan,
      e.amount_cents,
      e.event_type,
      e.created_at
    FROM subscription_events e
    LEFT JOIN users u ON u.id = e.user_id
    ORDER BY e.created_at DESC
    LIMIT ${limit}
  `;
  return rows as AdminSubscriptionEventRow[];
}

// ─── Practice exam stats (admin) ──────────────────────

export interface ExamStatsByLang {
  lang: string;
  question_count: number;
  attempt_count: number;
  passed_count: number;
  certificates_count: number;
}

export interface AdminExamStats {
  questionsByLang: ExamStatsByLang[];
  totalQuestions: number;
  totalAttempts: number;
  passedAttempts: number;
  certificatesIssued: number;
  passRatePercent: number;
}

export async function getAdminExamStats(): Promise<AdminExamStats> {
  const sql = getSql();
  const [qRows, aRows, pRows, cRows] = await Promise.all([
    sql`SELECT lang, COUNT(*)::int AS cnt FROM exam_questions GROUP BY lang ORDER BY lang`,
    sql`SELECT lang, COUNT(*)::int AS cnt FROM exam_attempts WHERE submitted_at IS NOT NULL GROUP BY lang`,
    sql`SELECT lang, COUNT(*)::int AS cnt FROM exam_attempts WHERE submitted_at IS NOT NULL AND passed = true GROUP BY lang`,
    sql`SELECT lang, COUNT(*)::int AS cnt FROM exam_certificates GROUP BY lang`,
  ]);
  const langSet = new Set<string>();
  (qRows as { lang: string }[]).forEach((r) => langSet.add(r.lang));
  (aRows as { lang: string }[]).forEach((r) => langSet.add(r.lang));
  (pRows as { lang: string }[]).forEach((r) => langSet.add(r.lang));
  (cRows as { lang: string }[]).forEach((r) => langSet.add(r.lang));
  const qMap = new Map<string, number>();
  const aMap = new Map<string, number>();
  const pMap = new Map<string, number>();
  const cMap = new Map<string, number>();
  (qRows as { lang: string; cnt: number }[]).forEach((r) => qMap.set(r.lang, r.cnt));
  (aRows as { lang: string; cnt: number }[]).forEach((r) => aMap.set(r.lang, r.cnt));
  (pRows as { lang: string; cnt: number }[]).forEach((r) => pMap.set(r.lang, r.cnt));
  (cRows as { lang: string; cnt: number }[]).forEach((r) => cMap.set(r.lang, r.cnt));
  const questionsByLang: ExamStatsByLang[] = [...langSet].sort().map((lang) => ({
    lang,
    question_count: qMap.get(lang) ?? 0,
    attempt_count: aMap.get(lang) ?? 0,
    passed_count: pMap.get(lang) ?? 0,
    certificates_count: cMap.get(lang) ?? 0,
  }));
  const totalQuestions = [...qMap.values()].reduce((s, n) => s + n, 0);
  const totalAttempts = [...aMap.values()].reduce((s, n) => s + n, 0);
  const passedAttempts = [...pMap.values()].reduce((s, n) => s + n, 0);
  const certificatesIssued = [...cMap.values()].reduce((s, n) => s + n, 0);
  return {
    questionsByLang,
    totalQuestions,
    totalAttempts,
    passedAttempts,
    certificatesIssued,
    passRatePercent: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
  };
}
