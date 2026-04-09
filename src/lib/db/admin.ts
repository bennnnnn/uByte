import { getSql } from "./client";
import type { AdminUserRow, AdminTutorialRow, AdminRevenueStats, AdminGrowthSnapshot } from "./types";
import { resetAllProgress } from "./progress";
import { incrementTokenVersion } from "./users";
import { ensureReferralTables } from "./referrals";

export type AdminRole = "super" | "limited";

// Ensure admin_role column exists (idempotent migration)
let _adminRoleReady = false;
async function ensureAdminRoleColumn(): Promise<void> {
  if (_adminRoleReady) return;
  const sql = getSql();
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT NULL
      CHECK (admin_role IS NULL OR admin_role IN ('super', 'limited'))
  `;
  // Backfill existing super admins with 'super' role
  await sql`
    UPDATE users SET admin_role = 'super'
    WHERE is_admin = 1 AND admin_role IS NULL
  `;
  _adminRoleReady = true;
}

// Ensure admin_permissions column exists
let _adminPermsReady = false;
async function ensureAdminPermissionsColumn(): Promise<void> {
  if (_adminPermsReady) return;
  const sql = getSql();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_permissions TEXT DEFAULT NULL`;
  _adminPermsReady = true;
}

// Ensure admin_slug column exists (unique personal admin URL slug)
let _adminSlugReady = false;
async function ensureAdminSlugColumn(): Promise<void> {
  if (_adminSlugReady) return;
  const sql = getSql();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_slug TEXT DEFAULT NULL`;
  // Add unique index if it doesn't exist
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_admin_slug_unique
    ON users (admin_slug) WHERE admin_slug IS NOT NULL
  `;
  _adminSlugReady = true;
}

/** Get an admin user by their personal URL slug. Returns null if not found. */
export async function getAdminBySlug(slug: string): Promise<{ id: number; name: string; email: string } | null> {
  await ensureAdminSlugColumn();
  const sql = getSql();
  const [row] = await sql`
    SELECT id, name, email FROM users
    WHERE admin_slug = ${slug} AND is_admin = 1
  `;
  return (row as { id: number; name: string; email: string } | undefined) ?? null;
}

/** Set the personal admin slug for a user. Pass null to clear it. */
export async function setAdminSlug(userId: number, slug: string | null): Promise<void> {
  await ensureAdminSlugColumn();
  const sql = getSql();
  await sql`UPDATE users SET admin_slug = ${slug} WHERE id = ${userId}`;
}

/** Get the admin slug for a user. */
export async function getAdminSlug(userId: number): Promise<string | null> {
  await ensureAdminSlugColumn();
  const sql = getSql();
  const [row] = await sql`SELECT admin_slug FROM users WHERE id = ${userId}`;
  return (row as { admin_slug: string | null } | undefined)?.admin_slug ?? null;
}

/** Set the granular permission list for a limited admin (JSON array). */
export async function setAdminPermissions(userId: number, permissions: string[]): Promise<void> {
  await ensureAdminPermissionsColumn();
  const sql = getSql();
  const json = JSON.stringify(permissions);
  await sql`UPDATE users SET admin_permissions = ${json} WHERE id = ${userId}`;
}

/** Clear custom permissions so the user falls back to role-based defaults. */
export async function clearAdminPermissions(userId: number): Promise<void> {
  await ensureAdminPermissionsColumn();
  const sql = getSql();
  await sql`UPDATE users SET admin_permissions = NULL WHERE id = ${userId}`;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  await ensureAdminRoleColumn();
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.name, u.email, u.xp, u.streak_days, u.created_at, u.last_active_at,
      u.is_admin, u.admin_role, u.locked_until, COALESCE(u.plan, 'free') AS plan,
      COALESCE(u.email_verified, 0) AS email_verified,
      u.admin_slug,
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

/**
 * Paginated user list with optional full-text search, plan filter, and email-verified filter.
 * verified: "" = all, "verified" = email_verified=1, "unverified" = email_verified=0
 */
export async function getAdminUsersPaginated(
  search: string,
  page: number,
  limit: number,
  plan = "",
  verified = "",
): Promise<{ users: AdminUserRow[]; total: number }> {
  await ensureAdminRoleColumn();
  await ensureAdminSlugColumn();
  const sql = getSql();
  const offset      = (page - 1) * limit;
  const pattern     = `%${search.toLowerCase()}%`;
  const hasSearch   = search.trim().length > 0;
  const hasPlan     = plan.trim().length > 0;
  const hasVerified = verified === "verified" || verified === "unverified";
  const verifiedVal = verified === "verified" ? 1 : 0;

  type Row = Record<string, unknown>;

  // 8 explicit parameterized variants covering all filter combinations
  const [rows, countRows] = (await Promise.all([
    hasSearch && hasPlan && hasVerified
      ? sql`SELECT u.id,u.name,u.email,u.xp,u.streak_days,u.created_at,u.last_active_at,u.is_admin,u.admin_role,u.locked_until,COALESCE(u.plan,'free')AS plan,COALESCE(u.email_verified,0)AS email_verified,u.admin_slug,(SELECT COUNT(*)::int FROM progress WHERE user_id=u.id)AS completed_count,(SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id)AS bookmark_count FROM users u WHERE(LOWER(u.email)LIKE ${pattern} OR LOWER(u.name)LIKE ${pattern})AND COALESCE(u.plan,'free')=${plan} AND COALESCE(u.email_verified,0)=${verifiedVal} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    : hasSearch && hasPlan
      ? sql`SELECT u.id,u.name,u.email,u.xp,u.streak_days,u.created_at,u.last_active_at,u.is_admin,u.admin_role,u.locked_until,COALESCE(u.plan,'free')AS plan,COALESCE(u.email_verified,0)AS email_verified,u.admin_slug,(SELECT COUNT(*)::int FROM progress WHERE user_id=u.id)AS completed_count,(SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id)AS bookmark_count FROM users u WHERE(LOWER(u.email)LIKE ${pattern} OR LOWER(u.name)LIKE ${pattern})AND COALESCE(u.plan,'free')=${plan} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    : hasSearch && hasVerified
      ? sql`SELECT u.id,u.name,u.email,u.xp,u.streak_days,u.created_at,u.last_active_at,u.is_admin,u.admin_role,u.locked_until,COALESCE(u.plan,'free')AS plan,COALESCE(u.email_verified,0)AS email_verified,u.admin_slug,(SELECT COUNT(*)::int FROM progress WHERE user_id=u.id)AS completed_count,(SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id)AS bookmark_count FROM users u WHERE(LOWER(u.email)LIKE ${pattern} OR LOWER(u.name)LIKE ${pattern})AND COALESCE(u.email_verified,0)=${verifiedVal} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    : hasPlan && hasVerified
      ? sql`SELECT u.id,u.name,u.email,u.xp,u.streak_days,u.created_at,u.last_active_at,u.is_admin,u.admin_role,u.locked_until,COALESCE(u.plan,'free')AS plan,COALESCE(u.email_verified,0)AS email_verified,u.admin_slug,(SELECT COUNT(*)::int FROM progress WHERE user_id=u.id)AS completed_count,(SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id)AS bookmark_count FROM users u WHERE COALESCE(u.plan,'free')=${plan} AND COALESCE(u.email_verified,0)=${verifiedVal} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    : hasSearch
      ? sql`SELECT u.id,u.name,u.email,u.xp,u.streak_days,u.created_at,u.last_active_at,u.is_admin,u.admin_role,u.locked_until,COALESCE(u.plan,'free')AS plan,COALESCE(u.email_verified,0)AS email_verified,u.admin_slug,(SELECT COUNT(*)::int FROM progress WHERE user_id=u.id)AS completed_count,(SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id)AS bookmark_count FROM users u WHERE LOWER(u.email)LIKE ${pattern} OR LOWER(u.name)LIKE ${pattern} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    : hasPlan
      ? sql`SELECT u.id,u.name,u.email,u.xp,u.streak_days,u.created_at,u.last_active_at,u.is_admin,u.admin_role,u.locked_until,COALESCE(u.plan,'free')AS plan,COALESCE(u.email_verified,0)AS email_verified,u.admin_slug,(SELECT COUNT(*)::int FROM progress WHERE user_id=u.id)AS completed_count,(SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id)AS bookmark_count FROM users u WHERE COALESCE(u.plan,'free')=${plan} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    : hasVerified
      ? sql`SELECT u.id,u.name,u.email,u.xp,u.streak_days,u.created_at,u.last_active_at,u.is_admin,u.admin_role,u.locked_until,COALESCE(u.plan,'free')AS plan,COALESCE(u.email_verified,0)AS email_verified,u.admin_slug,(SELECT COUNT(*)::int FROM progress WHERE user_id=u.id)AS completed_count,(SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id)AS bookmark_count FROM users u WHERE COALESCE(u.email_verified,0)=${verifiedVal} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`
      : sql`SELECT u.id,u.name,u.email,u.xp,u.streak_days,u.created_at,u.last_active_at,u.is_admin,u.admin_role,u.locked_until,COALESCE(u.plan,'free')AS plan,COALESCE(u.email_verified,0)AS email_verified,u.admin_slug,(SELECT COUNT(*)::int FROM progress WHERE user_id=u.id)AS completed_count,(SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id)AS bookmark_count FROM users u ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`,

    hasSearch && hasPlan && hasVerified
      ? sql`SELECT COUNT(*)::int AS total FROM users WHERE(LOWER(email)LIKE ${pattern} OR LOWER(name)LIKE ${pattern})AND COALESCE(plan,'free')=${plan} AND COALESCE(email_verified,0)=${verifiedVal}`
    : hasSearch && hasPlan
      ? sql`SELECT COUNT(*)::int AS total FROM users WHERE(LOWER(email)LIKE ${pattern} OR LOWER(name)LIKE ${pattern})AND COALESCE(plan,'free')=${plan}`
    : hasSearch && hasVerified
      ? sql`SELECT COUNT(*)::int AS total FROM users WHERE(LOWER(email)LIKE ${pattern} OR LOWER(name)LIKE ${pattern})AND COALESCE(email_verified,0)=${verifiedVal}`
    : hasPlan && hasVerified
      ? sql`SELECT COUNT(*)::int AS total FROM users WHERE COALESCE(plan,'free')=${plan} AND COALESCE(email_verified,0)=${verifiedVal}`
    : hasSearch
      ? sql`SELECT COUNT(*)::int AS total FROM users WHERE LOWER(email)LIKE ${pattern} OR LOWER(name)LIKE ${pattern}`
    : hasPlan
      ? sql`SELECT COUNT(*)::int AS total FROM users WHERE COALESCE(plan,'free')=${plan}`
    : hasVerified
      ? sql`SELECT COUNT(*)::int AS total FROM users WHERE COALESCE(email_verified,0)=${verifiedVal}`
      : sql`SELECT COUNT(*)::int AS total FROM users`,
  ])) as [Row[], Array<{ total: number }>];

  const now = new Date();
  return {
    users: rows.map((r) => ({
      ...r,
      banned: !!r.locked_until && new Date(r.locked_until as string) > now,
    })) as AdminUserRow[],
    total: Number(countRows[0]?.total ?? 0),
  };
}

export async function getAdminList(): Promise<AdminUserRow[]> {
  await ensureAdminRoleColumn();
  await ensureAdminPermissionsColumn();
  await ensureAdminSlugColumn();
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.name, u.email, u.xp, u.streak_days, u.created_at, u.last_active_at,
      u.is_admin, u.admin_role, u.admin_permissions, u.locked_until, COALESCE(u.plan, 'free') AS plan,
      COALESCE(u.email_verified, 0) AS email_verified, u.admin_slug,
      (SELECT COUNT(*)::int FROM progress WHERE user_id = u.id) AS completed_count,
      (SELECT COUNT(*)::int FROM bookmarks WHERE user_id = u.id) AS bookmark_count
    FROM users u
    WHERE u.is_admin = 1
    ORDER BY u.admin_role ASC, u.created_at ASC
  `;
  const now = new Date();
  return rows.map((r) => ({
    ...r,
    banned: !!r.locked_until && new Date(r.locked_until as string) > now,
  })) as AdminUserRow[];
}

export async function adminDeleteUser(userId: number): Promise<void> {
  await ensureReferralTables();
  const sql = getSql();
  // referral_conversions.referrer_id historically had no ON DELETE action — removing those
  // rows first keeps deletes working on DBs that have not run migration 025 yet.
  await sql.transaction([
    sql`DELETE FROM referral_conversions WHERE referrer_id = ${userId}`,
    sql`DELETE FROM users WHERE id = ${userId}`,
  ]);
}

export async function adminBanUser(userId: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET locked_until = '2099-12-31 23:59:59', token_version = token_version + 1
    WHERE id = ${userId}
  `;
}

export async function adminUnbanUser(userId: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = ${userId}`;
}

export async function getAdminTutorialAnalytics(): Promise<AdminTutorialRow[]> {
  const sql = getSql();
  // Union both rating tables so votes from InlineRatingNudge/CongratsModal
  // (tutorial_ratings) and the sidebar widget (ratings) are both counted.
  const rows = await sql`
    SELECT
      slug,
      MAX(completed_count)::int AS completed_count,
      SUM(thumbs_up)::int      AS thumbs_up,
      SUM(thumbs_down)::int    AS thumbs_down
    FROM (
      -- Legacy ratings table (sidebar TutorialRating widget)
      SELECT
        p.tutorial_slug AS slug,
        COUNT(DISTINCT p.user_id)::int AS completed_count,
        COALESCE(SUM(CASE WHEN r.value = 1  THEN 1 ELSE 0 END), 0)::int AS thumbs_up,
        COALESCE(SUM(CASE WHEN r.value = -1 THEN 1 ELSE 0 END), 0)::int AS thumbs_down
      FROM progress p
      LEFT JOIN ratings r
        ON r.tutorial_slug = p.tutorial_slug AND r.user_id = p.user_id
      GROUP BY p.tutorial_slug

      UNION ALL

      -- Newer tutorial_ratings table (InlineRatingNudge + CongratsModal)
      SELECT
        tutorial_slug AS slug,
        0::int AS completed_count,
        SUM(CASE WHEN rating = 1  THEN 1 ELSE 0 END)::int AS thumbs_up,
        SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END)::int AS thumbs_down
      FROM tutorial_ratings
      GROUP BY tutorial_slug
    ) combined
    GROUP BY slug
    ORDER BY completed_count DESC
  `;
  return rows as AdminTutorialRow[];
}

export async function adminResetUserProgress(userId: number): Promise<void> {
  return resetAllProgress(userId);
}

export async function setAdminStatus(
  userId: number,
  isAdmin: boolean,
  role: AdminRole = "limited",
  permissions?: string[],
): Promise<void> {
  await ensureAdminRoleColumn();
  await ensureAdminPermissionsColumn();
  const sql = getSql();
  if (isAdmin) {
    const permsJson = permissions ? JSON.stringify(permissions) : null;
    await sql`UPDATE users SET is_admin = 1, admin_role = ${role}, admin_permissions = ${permsJson} WHERE id = ${userId}`;
  } else {
    await sql`UPDATE users SET is_admin = 0, admin_role = NULL, admin_permissions = NULL WHERE id = ${userId}`;
    await incrementTokenVersion(userId);
  }
}

export async function setAdminRole(userId: number, role: AdminRole, permissions?: string[]): Promise<void> {
  await ensureAdminRoleColumn();
  await ensureAdminPermissionsColumn();
  const sql = getSql();
  const permsJson = permissions ? JSON.stringify(permissions) : null;
  // When setting super role, clear custom permissions (super always has full access)
  if (role === "super") {
    await sql`UPDATE users SET admin_role = 'super', admin_permissions = NULL WHERE id = ${userId} AND is_admin = 1`;
  } else {
    await sql`UPDATE users SET admin_role = ${role}, admin_permissions = ${permsJson} WHERE id = ${userId} AND is_admin = 1`;
  }
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

/** Funnel + churn aggregates for admins with `growth` permission only (avoids exposing the full user list). */
export async function getAdminGrowthSnapshot(): Promise<AdminGrowthSnapshot> {
  const sql = getSql();

  const [totals] = await sql`
    SELECT
      COUNT(*)::int AS total_users,
      COUNT(*) FILTER (
        WHERE u.xp > 0 OR EXISTS (SELECT 1 FROM progress p WHERE p.user_id = u.id)
      )::int AS activated,
      COUNT(*) FILTER (
        WHERE (SELECT COUNT(*)::int FROM progress p WHERE p.user_id = u.id) >= 5
      )::int AS engaged_5plus,
      COUNT(*) FILTER (WHERE COALESCE(u.plan, 'free') <> 'free')::int AS pro_subscribers
    FROM users u
  `;

  const [churn] = await sql`
    SELECT
      COUNT(*) FILTER (
        WHERE u.created_at::timestamptz < NOW() - INTERVAL '3 days'
          AND u.xp = 0
          AND NOT EXISTS (SELECT 1 FROM progress p WHERE p.user_id = u.id)
      )::int AS never_started_count,
      COUNT(*) FILTER (
        WHERE EXISTS (SELECT 1 FROM progress p WHERE p.user_id = u.id)
          AND COALESCE(u.last_active_at::timestamptz, u.created_at::timestamptz) < NOW() - INTERVAL '14 days'
      )::int AS went_cold_count,
      COUNT(*) FILTER (
        WHERE COALESCE(u.plan, 'free') <> 'free'
          AND COALESCE(u.last_active_at::timestamptz, u.created_at::timestamptz) < NOW() - INTERVAL '7 days'
      )::int AS at_risk_pro_count
    FROM users u
  `;

  const signRows = await sql`
    SELECT
      to_char(date_trunc('day', u.created_at::timestamptz), 'YYYY-MM-DD') AS d,
      COUNT(*)::int AS c
    FROM users u
    WHERE u.created_at::timestamptz >= date_trunc('day', NOW()) - INTERVAL '30 days'
    GROUP BY 1
    ORDER BY 1
  `;

  const byDay = new Map<string, number>();
  for (const row of signRows as { d: string; c: number }[]) {
    byDay.set(row.d, row.c);
  }
  const signup_by_day: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dt = new Date();
    dt.setUTCHours(0, 0, 0, 0);
    dt.setUTCDate(dt.getUTCDate() - i);
    const key = dt.toISOString().slice(0, 10);
    signup_by_day.push({ date: key, count: byDay.get(key) ?? 0 });
  }

  const sampleRows = await sql`
    SELECT u.id, u.name, u.email, u.created_at, COALESCE(u.plan, 'free') AS plan
    FROM users u
    WHERE u.created_at::timestamptz < NOW() - INTERVAL '3 days'
      AND u.xp = 0
      AND NOT EXISTS (SELECT 1 FROM progress p WHERE p.user_id = u.id)
    ORDER BY u.created_at DESC
    LIMIT 10
  `;

  return {
    total_users: (totals?.total_users as number) ?? 0,
    activated: (totals?.activated as number) ?? 0,
    engaged_5plus: (totals?.engaged_5plus as number) ?? 0,
    pro_subscribers: (totals?.pro_subscribers as number) ?? 0,
    signup_by_day,
    never_started_count: (churn?.never_started_count as number) ?? 0,
    went_cold_count: (churn?.went_cold_count as number) ?? 0,
    at_risk_pro_count: (churn?.at_risk_pro_count as number) ?? 0,
    never_started_sample: sampleRows as AdminGrowthSnapshot["never_started_sample"],
  };
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
