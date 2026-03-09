import { getSql } from "./client";
import type { User } from "./types";
import { hashToken } from "@/lib/token-security";

const EMAIL_VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

let _emailVerifyExpiryReady = false;
async function ensureEmailVerificationExpiryColumn(): Promise<void> {
  if (_emailVerifyExpiryReady) return;
  const sql = getSql();
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TEXT`;
  } catch {
    // Ignore migration races and continue.
  }
  _emailVerifyExpiryReady = true;
}

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
    if (!ALLOWED_PROFILE_FIELDS.has(key)) continue;
    if (val !== undefined) {
      vals.push(val);
      sets.push(`${key} = $${vals.length}`);
    }
  }
  if (sets.length === 0) return;
  vals.push(userId);
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
): Promise<{ streak_days: number; longest_streak: number; freeze_used?: boolean }> {
  const sql = getSql();
  // Ensure streak_freezes column exists (idempotent migration)
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freezes INTEGER NOT NULL DEFAULT 1`;
  } catch { /* ignore */ }

  const user = await getUserById(userId);
  if (!user) return { streak_days: 0, longest_streak: 0 };

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let streak = user.streak_days;
  let longest = user.longest_streak;
  let freeze_used = false;
  const freezes: number = user.streak_freezes ?? 1;

  if (user.streak_last_date === today) {
    return { streak_days: streak, longest_streak: longest };
  } else if (user.streak_last_date === yesterday) {
    streak += 1;
  } else {
    // Missed a day — try freeze
    if (freezes > 0) {
      freeze_used = true;
      await sql`UPDATE users SET streak_freezes = streak_freezes - 1 WHERE id = ${userId}`;
      // keep streak, just update last date
    } else {
      streak = 1;
    }
  }

  if (streak > longest) longest = streak;

  await sql`
    UPDATE users
    SET streak_days = ${streak}, longest_streak = ${longest},
        streak_last_date = ${today}, last_active_at = NOW()::text
    WHERE id = ${userId}
  `;
  return { streak_days: streak, longest_streak: longest, freeze_used };
}

export async function addStreakFreeze(userId: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE users SET streak_freezes = LEAST(streak_freezes + 1, 3) WHERE id = ${userId}`;
}

export async function incrementLoginFailure(
  userId: number
): Promise<{ attempts: number; locked: boolean }> {
  const sql = getSql();
  const [row] = await sql`UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ${userId} RETURNING failed_login_attempts`;
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

export async function incrementTokenVersion(userId: number): Promise<number> {
  const sql = getSql();
  const [row] = await sql`UPDATE users SET token_version = token_version + 1 WHERE id = ${userId} RETURNING token_version`;
  return (row?.token_version as number) ?? 0;
}

export async function getUserPlan(userId: number): Promise<string> {
  const sql = getSql();
  const [row] = await sql`SELECT plan FROM users WHERE id = ${userId}`;
  return (row?.plan as string) ?? "free";
}

/**
 * Update user plan. The DB column `stripe_customer_id` is a legacy name —
 * it actually stores the Paddle customer ID. A future migration will rename
 * the column to `paddle_customer_id`.
 */
export async function updateUserPlan(
  userId: number,
  plan: string,
  paddleCustomerId?: string
): Promise<void> {
  const sql = getSql();
  if (paddleCustomerId) {
    await sql`UPDATE users SET plan = ${plan}, stripe_customer_id = ${paddleCustomerId} WHERE id = ${userId}`;
  } else {
    await sql`UPDATE users SET plan = ${plan} WHERE id = ${userId}`;
  }
}

/** Ensure the subscription_expires_at column exists. Called lazily from cancellation paths only. */
async function ensureSubscriptionExpiresAtColumn(): Promise<void> {
  const sql = getSql();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TEXT`;
}

/**
 * Marks a subscription as cancelled but keeps the plan active until the
 * billing period ends. Called from the Paddle webhook on subscription.canceled.
 *
 * plan becomes "canceling" — hasPaidAccess() treats this as paid until expiry.
 * A daily cron (see /api/cron/cleanup) downgrades expired "canceling" users.
 */
export async function cancelUserPlanGracefully(
  userId: number,
  expiresAt: string // ISO-8601 from Paddle current_billing_period.ends_at
): Promise<void> {
  const sql = getSql();
  await ensureSubscriptionExpiresAtColumn();
  await sql`
    UPDATE users
    SET plan = 'canceling', subscription_expires_at = ${expiresAt}
    WHERE id = ${userId}
  `;
}

/** Downgrade all "canceling" users whose billing period has now ended. */
export async function downgradeExpiredCancelingUsers(): Promise<number> {
  const sql = getSql();
  await ensureSubscriptionExpiresAtColumn();
  const result = await sql`
    UPDATE users
    SET plan = 'free', subscription_expires_at = NULL
    WHERE plan = 'canceling'
      AND subscription_expires_at IS NOT NULL
      AND subscription_expires_at::timestamptz < NOW()
    RETURNING id
  `;
  return result.length;
}

/** Look up user by Paddle customer ID (stored in legacy `stripe_customer_id` column). */
export async function getUserByPaddleCustomerId(paddleCustomerId: string): Promise<User | undefined> {
  const sql = getSql();
  const [row] = await sql`SELECT * FROM users WHERE stripe_customer_id = ${paddleCustomerId}`;
  return row as User | undefined;
}

export async function getPublicProfile(userId: number): Promise<{
  id: number; name: string; avatar: string; bio: string;
  xp: number; streak_days: number; longest_streak: number;
  created_at: string; completed_count: number;
} | null> {
  const sql = getSql();
  const [row] = await sql`
    SELECT
      u.id, u.name, u.avatar, u.bio, u.xp, u.streak_days, u.longest_streak, u.created_at,
      COUNT(p.tutorial_slug)::int AS completed_count
    FROM users u
    LEFT JOIN progress p ON p.user_id = u.id
    WHERE u.id = ${userId}
    GROUP BY u.id
  `;
  if (!row) return null;
  return row as {
    id: number; name: string; avatar: string; bio: string;
    xp: number; streak_days: number; longest_streak: number;
    created_at: string; completed_count: number;
  };
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

export async function createEmailVerificationToken(
  userId: number,
  token: string
): Promise<void> {
  await ensureEmailVerificationExpiryColumn();
  const sql = getSql();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TOKEN_TTL_MS).toISOString();
  await sql`
    UPDATE users
    SET email_verification_token = ${tokenHash}, email_verification_expires_at = ${expiresAt}
    WHERE id = ${userId}
  `;
}

export async function verifyEmail(token: string): Promise<User | undefined> {
  await ensureEmailVerificationExpiryColumn();
  const sql = getSql();
  const tokenHash = await hashToken(token);
  const [user] = await sql`
    SELECT * FROM users
    WHERE (email_verification_token = ${tokenHash} OR email_verification_token = ${token})
      AND email_verified = 0
      AND (
        email_verification_expires_at IS NULL
        OR email_verification_expires_at::timestamptz > NOW()
      )
  `;
  if (!user) return undefined;
  await sql`
    UPDATE users
    SET email_verified = 1, email_verification_token = NULL, email_verification_expires_at = NULL
    WHERE id = ${(user as User).id}
  `;
  return user as User;
}

/** Returns the total number of registered users (for social proof on pricing page). */
export async function getTotalUserCount(): Promise<number> {
  const sql = getSql();
  const rows = await sql`SELECT COUNT(*) AS cnt FROM users`;
  return Number(rows[0]?.cnt ?? 0);
}
