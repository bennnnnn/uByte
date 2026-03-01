import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Lazily create the SQL client so DATABASE_URL can be set at runtime
let _sql: NeonQueryFunction<false, false> | undefined;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    _sql = neon(url);
  }
  return _sql;
}

// ─── Types ───────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  google_id: string | null;
  avatar: string;
  bio: string;
  theme: string;
  xp: number;
  streak_days: number;
  longest_streak: number;
  streak_last_date: string | null;
  last_active_at: string | null;
  created_at: string;
  is_admin: number;
  email_verified: number;
  email_verification_token: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  token_version: number;
  plan: string;
  stripe_customer_id: string | null;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  xp: number;
  streak_days: number;
  completed_count: number;
}

export interface Rating {
  tutorial_slug: string;
  thumbs_up: number;
  thumbs_down: number;
  user_vote: number | null;
}

export interface PlaygroundSnippet {
  share_id: string;
  code: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  detail: string;
  created_at: string;
}

export interface Bookmark {
  id: number;
  user_id: number;
  tutorial_slug: string;
  snippet: string;
  note: string;
  created_at: string;
}

export interface Achievement {
  badge_key: string;
  unlocked_at: string;
}

export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: number;
  created_at: string;
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak_days: number;
  created_at: string;
  last_active_at: string | null;
  is_admin: number;
  banned: boolean;
  completed_count: number;
  bookmark_count: number;
}

export interface AdminTutorialRow {
  slug: string;
  completed_count: number;
  thumbs_up: number;
  thumbs_down: number;
}

// ─── Users ───────────────────────────────────────────

export async function createUser(name: string, email: string, passwordHash: string): Promise<User> {
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${name}, ${email}, ${passwordHash})
    RETURNING *
  `;
  return row as User;
}

export async function createUserWithGoogle(name: string, email: string, googleId: string): Promise<User> {
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO users (name, email, password_hash, google_id)
    VALUES (${name}, ${email}, 'GOOGLE_OAUTH', ${googleId})
    RETURNING *
  `;
  return row as User;
}

export async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  const sql = getSql();
  const [row] = await sql`SELECT * FROM users WHERE google_id = ${googleId}`;
  return row as User | undefined;
}

export async function linkGoogleId(userId: number, googleId: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET google_id = ${googleId} WHERE id = ${userId}`;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const sql = getSql();
  const [row] = await sql`SELECT * FROM users WHERE email = ${email}`;
  return row as User | undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const sql = getSql();
  const [row] = await sql`SELECT * FROM users WHERE id = ${id}`;
  return row as User | undefined;
}

const ALLOWED_PROFILE_FIELDS = new Set(["name", "bio", "avatar", "theme"]);

export async function updateUserProfile(
  userId: number,
  fields: { name?: string; bio?: string; avatar?: string; theme?: string }
): Promise<void> {
  const sql = getSql();
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [key, val] of Object.entries(fields)) {
    if (!ALLOWED_PROFILE_FIELDS.has(key)) continue; // allowlist — prevents SQL injection
    if (val !== undefined) {
      vals.push(val);
      sets.push(`${key} = $${vals.length}`);
    }
  }
  if (sets.length === 0) return;
  vals.push(userId);
  // sql.query() supports parameterized raw queries (safe; values are still parameterized)
  await sql.query(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${vals.length}`,
    vals as string[]
  );
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`;
}

export async function deleteUser(userId: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

export async function addXp(userId: number, amount: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET xp = xp + ${amount} WHERE id = ${userId}`;
}

export async function updateStreak(
  userId: number
): Promise<{ streak_days: number; longest_streak: number }> {
  const user = await getUserById(userId);
  if (!user) return { streak_days: 0, longest_streak: 0 };

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let streak = user.streak_days;
  let longest = user.longest_streak;

  if (user.streak_last_date === today) {
    return { streak_days: streak, longest_streak: longest };
  } else if (user.streak_last_date === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  if (streak > longest) longest = streak;

  const sql = getSql();
  await sql`
    UPDATE users
    SET streak_days = ${streak}, longest_streak = ${longest},
        streak_last_date = ${today}, last_active_at = NOW()::text
    WHERE id = ${userId}
  `;
  return { streak_days: streak, longest_streak: longest };
}

// ─── Progress ────────────────────────────────────────

export async function getProgress(userId: number): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT tutorial_slug FROM progress WHERE user_id = ${userId} ORDER BY completed_at
  `;
  return rows.map((r) => r.tutorial_slug as string);
}

export async function getProgressCount(userId: number): Promise<number> {
  const sql = getSql();
  const [row] = await sql`SELECT COUNT(*)::int AS c FROM progress WHERE user_id = ${userId}`;
  return (row?.c as number) ?? 0;
}

export async function markComplete(userId: number, tutorialSlug: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO progress (user_id, tutorial_slug)
    VALUES (${userId}, ${tutorialSlug})
    ON CONFLICT (user_id, tutorial_slug) DO NOTHING
  `;
}

export async function markIncomplete(userId: number, tutorialSlug: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM progress WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug}`;
}

// ─── Achievements ────────────────────────────────────

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
    return (rows as Record<string, unknown>[]).length > 0; // true if newly inserted
  } catch {
    return false;
  }
}

// ─── Bookmarks ───────────────────────────────────────

export async function getBookmarks(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<Bookmark[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM bookmarks WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as Bookmark[];
}

export async function getBookmarkTotal(userId: number): Promise<number> {
  const sql = getSql();
  const [row] = await sql`SELECT COUNT(*)::int AS c FROM bookmarks WHERE user_id = ${userId}`;
  return (row?.c as number) ?? 0;
}

export async function getBookmarkCount(userId: number): Promise<number> {
  return getBookmarkTotal(userId);
}

export async function addBookmark(
  userId: number,
  tutorialSlug: string,
  snippet: string,
  note: string
): Promise<Bookmark> {
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO bookmarks (user_id, tutorial_slug, snippet, note)
    VALUES (${userId}, ${tutorialSlug}, ${snippet}, ${note})
    RETURNING *
  `;
  return row as Bookmark;
}

export async function deleteBookmark(userId: number, bookmarkId: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM bookmarks WHERE id = ${bookmarkId} AND user_id = ${userId}`;
}

// ─── Activity Log ────────────────────────────────────

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

// ─── Password Reset Tokens ───────────────────────────

export async function createPasswordResetToken(
  userId: number,
  token: string,
  expiresAt: string
): Promise<void> {
  const sql = getSql();
  await sql`UPDATE password_reset_tokens SET used = 1 WHERE user_id = ${userId} AND used = 0`;
  await sql`INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (${userId}, ${token}, ${expiresAt})`;
}

export async function getPasswordResetToken(
  token: string
): Promise<PasswordResetToken | undefined> {
  const sql = getSql();
  const [row] = await sql`
    SELECT * FROM password_reset_tokens
    WHERE token = ${token} AND used = 0 AND expires_at::timestamptz > NOW()
  `;
  return row as PasswordResetToken | undefined;
}

export async function markResetTokenUsed(tokenId: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE password_reset_tokens SET used = 1 WHERE id = ${tokenId}`;
}

// ─── Anonymous page view tracking ────────────────────

export async function recordPageView(visitorId: string, pageSlug: string): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO page_views (visitor_id, page_slug) VALUES (${visitorId}, ${pageSlug})
    ON CONFLICT (visitor_id, page_slug) DO NOTHING
  `;
}

export async function getPageViewCount(visitorId: string): Promise<number> {
  const sql = getSql();
  const [row] = await sql`SELECT COUNT(*)::int AS count FROM page_views WHERE visitor_id = ${visitorId}`;
  return (row?.count as number) ?? 0;
}

export async function clearPageViews(visitorId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM page_views WHERE visitor_id = ${visitorId}`;
}

// ─── Progress reset ───────────────────────────────────

export async function resetAllProgress(userId: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM progress WHERE user_id = ${userId}`;
  await sql`DELETE FROM achievements WHERE user_id = ${userId}`;
  await sql`
    UPDATE users
    SET xp = 0, streak_days = 0, longest_streak = 0, streak_last_date = NULL
    WHERE id = ${userId}
  `;
}

// ─── Admin ───────────────────────────────────────────

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

// ─── Email Verification ───────────────────────────────

export async function createEmailVerificationToken(
  userId: number,
  token: string
): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET email_verification_token = ${token} WHERE id = ${userId}`;
}

export async function verifyEmail(token: string): Promise<User | undefined> {
  const sql = getSql();
  const [user] = await sql`
    SELECT * FROM users WHERE email_verification_token = ${token} AND email_verified = 0
  `;
  if (!user) return undefined;
  await sql`
    UPDATE users SET email_verified = 1, email_verification_token = NULL WHERE id = ${(user as User).id}
  `;
  return user as User;
}

// ─── Account Lockout ──────────────────────────────────

export async function incrementLoginFailure(
  userId: number
): Promise<{ attempts: number; locked: boolean }> {
  const sql = getSql();
  await sql`UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ${userId}`;
  const [row] = await sql`SELECT failed_login_attempts FROM users WHERE id = ${userId}`;
  const attempts = (row?.failed_login_attempts as number) ?? 0;

  if (attempts >= 5) {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await sql`UPDATE users SET locked_until = ${lockedUntil} WHERE id = ${userId}`;
    return { attempts, locked: true };
  }
  return { attempts, locked: false };
}

export async function resetLoginFailures(userId: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${userId}`;
}

export async function isUserLocked(userId: number): Promise<boolean> {
  const sql = getSql();
  const [row] = await sql`SELECT locked_until FROM users WHERE id = ${userId}`;
  if (!row?.locked_until) return false;
  return new Date(row.locked_until as string) > new Date();
}

// ─── Token Versioning ─────────────────────────────────

export async function incrementTokenVersion(userId: number): Promise<number> {
  const sql = getSql();
  await sql`UPDATE users SET token_version = token_version + 1 WHERE id = ${userId}`;
  const [row] = await sql`SELECT token_version FROM users WHERE id = ${userId}`;
  return (row?.token_version as number) ?? 0;
}

// ─── Plan / Subscription ──────────────────────────────

export async function getUserPlan(userId: number): Promise<string> {
  const sql = getSql();
  const [row] = await sql`SELECT plan FROM users WHERE id = ${userId}`;
  return (row?.plan as string) ?? "free";
}

export async function getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
  const sql = getSql();
  const [row] = await sql`SELECT * FROM users WHERE stripe_customer_id = ${customerId}`;
  return row as User | undefined;
}

export async function updateUserPlan(
  userId: number,
  plan: string,
  stripeCustomerId?: string
): Promise<void> {
  const sql = getSql();
  if (stripeCustomerId) {
    await sql`UPDATE users SET plan = ${plan}, stripe_customer_id = ${stripeCustomerId} WHERE id = ${userId}`;
  } else {
    await sql`UPDATE users SET plan = ${plan} WHERE id = ${userId}`;
  }
}

// ─── Leaderboard ─────────────────────────────────────

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.name, u.avatar, u.xp, u.streak_days,
      (SELECT COUNT(*)::int FROM progress WHERE user_id = u.id) AS completed_count
    FROM users u
    ORDER BY u.xp DESC
    LIMIT ${limit}
  `;
  return rows as LeaderboardEntry[];
}

// ─── Tutorial Ratings ─────────────────────────────────

export async function rateTutorial(
  userId: number,
  tutorialSlug: string,
  value: 1 | -1
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO ratings (user_id, tutorial_slug, value) VALUES (${userId}, ${tutorialSlug}, ${value})
    ON CONFLICT (user_id, tutorial_slug) DO UPDATE SET value = EXCLUDED.value
  `;
}

export async function getTutorialRating(
  tutorialSlug: string,
  userId?: number
): Promise<Rating> {
  const sql = getSql();
  const [agg] = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0)::int AS thumbs_up,
      COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0)::int AS thumbs_down
    FROM ratings WHERE tutorial_slug = ${tutorialSlug}
  `;

  let userVote: number | null = null;
  if (userId) {
    const [row] = await sql`
      SELECT value FROM ratings WHERE user_id = ${userId} AND tutorial_slug = ${tutorialSlug}
    `;
    userVote = (row?.value as number) ?? null;
  }

  return {
    tutorial_slug: tutorialSlug,
    thumbs_up: (agg?.thumbs_up as number) ?? 0,
    thumbs_down: (agg?.thumbs_down as number) ?? 0,
    user_vote: userVote,
  };
}

// ─── Playground Snippets ──────────────────────────────

export async function savePlaygroundSnippet(
  shareId: string,
  code: string,
  userId?: number
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO playground_snippets (share_id, code, user_id)
    VALUES (${shareId}, ${code}, ${userId ?? null})
  `;
}

export async function getPlaygroundSnippet(
  shareId: string
): Promise<PlaygroundSnippet | undefined> {
  const sql = getSql();
  const [row] = await sql`
    SELECT share_id, code, created_at FROM playground_snippets WHERE share_id = ${shareId}
  `;
  return row as PlaygroundSnippet | undefined;
}

export async function getUserByPaddleCustomerId(paddleCustomerId: string): Promise<User | undefined> {
  const sql = getSql();
  const [row] = await sql`SELECT * FROM users WHERE stripe_customer_id = ${paddleCustomerId}`;
  return row as User | undefined;
}

export async function getUsersAtRiskOfLosingStreak(): Promise<Pick<User, "id" | "email" | "name" | "streak_days">[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, name, streak_days FROM users
    WHERE streak_last_date = CURRENT_DATE - INTERVAL '1 day'
      AND streak_days > 0
      AND email IS NOT NULL
      AND email_verified = 1
  `;
  return rows as Pick<User, "id" | "email" | "name" | "streak_days">[];
}

// ─── Tutorial Chat Messages ───────────────────────────

export interface TutorialMessage {
  id: number;
  tutorial_slug: string;
  user_id: number | null;
  user_name: string;
  is_ai: boolean;
  content: string;
  created_at: string;
}

let _chatReady = false;
async function ensureChatTable(): Promise<void> {
  if (_chatReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS tutorial_messages (
      id            SERIAL PRIMARY KEY,
      tutorial_slug TEXT NOT NULL,
      user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
      user_name     TEXT NOT NULL,
      is_ai         BOOLEAN NOT NULL DEFAULT FALSE,
      content       TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_tutorial_messages_slug ON tutorial_messages(tutorial_slug, created_at)`;
  _chatReady = true;
}

export async function getChatMessages(tutorialSlug: string, limit = 50): Promise<TutorialMessage[]> {
  await ensureChatTable();
  const sql = getSql();
  const rows = await sql`
    SELECT id, tutorial_slug, user_id, user_name, is_ai, content, created_at
    FROM tutorial_messages
    WHERE tutorial_slug = ${tutorialSlug}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ ...r, is_ai: !!r.is_ai })) as TutorialMessage[];
}

export async function saveChatMessage(
  tutorialSlug: string,
  userId: number | null,
  userName: string,
  content: string,
  isAi: boolean
): Promise<TutorialMessage> {
  await ensureChatTable();
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO tutorial_messages (tutorial_slug, user_id, user_name, is_ai, content)
    VALUES (${tutorialSlug}, ${userId}, ${userName}, ${isAi}, ${content})
    RETURNING *
  `;
  return { ...row, is_ai: !!row.is_ai } as TutorialMessage;
}

// ─── Code Drafts ─────────────────────────────────────

// Lazily create the table once per process — CREATE TABLE IF NOT EXISTS is a no-op when it exists
let _codeDraftsReady = false;
async function ensureCodeDraftsTable(): Promise<void> {
  if (_codeDraftsReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS code_drafts (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug       TEXT NOT NULL,
      editor_key TEXT NOT NULL,
      code       TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, slug, editor_key)
    )
  `;
  _codeDraftsReady = true;
}

export async function getCodeDraft(
  userId: number,
  slug: string,
  editorKey: string
): Promise<string | null> {
  await ensureCodeDraftsTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT code FROM code_drafts
    WHERE user_id = ${userId} AND slug = ${slug} AND editor_key = ${editorKey}
  `;
  return (row?.code as string) ?? null;
}

export async function upsertCodeDraft(
  userId: number,
  slug: string,
  editorKey: string,
  code: string
): Promise<void> {
  await ensureCodeDraftsTable();
  const sql = getSql();
  await sql`
    INSERT INTO code_drafts (user_id, slug, editor_key, code, updated_at)
    VALUES (${userId}, ${slug}, ${editorKey}, ${code}, NOW())
    ON CONFLICT (user_id, slug, editor_key)
    DO UPDATE SET code = EXCLUDED.code, updated_at = NOW()
  `;
}

export async function deleteCodeDraft(
  userId: number,
  slug: string,
  editorKey: string
): Promise<void> {
  await ensureCodeDraftsTable();
  const sql = getSql();
  await sql`
    DELETE FROM code_drafts
    WHERE user_id = ${userId} AND slug = ${slug} AND editor_key = ${editorKey}
  `;
}

// ─── Rate Limiting ────────────────────────────────────

export async function dbCheckRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ limited: boolean; retryAfter: number }> {
  const sql = getSql();
  const now = Date.now();
  const windowStart = now - windowMs;

  await sql`DELETE FROM rate_limits WHERE key = ${key} AND hit_at < ${windowStart}`;

  const [row] = await sql`
    SELECT COUNT(*)::int AS c, MIN(hit_at) AS oldest
    FROM rate_limits WHERE key = ${key} AND hit_at >= ${windowStart}
  `;

  const count = (row?.c as number) ?? 0;
  if (count >= maxRequests) {
    const oldest = row?.oldest as number | null;
    const retryAfter = oldest
      ? Math.ceil((oldest + windowMs - now) / 1000)
      : 1;
    return { limited: true, retryAfter: Math.max(1, retryAfter) };
  }

  await sql`INSERT INTO rate_limits (key, hit_at) VALUES (${key}, ${now})`;
  return { limited: false, retryAfter: 0 };
}
