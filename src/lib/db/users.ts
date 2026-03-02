import { getSql } from "./client";
import type { User } from "./types";

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

export async function incrementTokenVersion(userId: number): Promise<number> {
  const sql = getSql();
  await sql`UPDATE users SET token_version = token_version + 1 WHERE id = ${userId}`;
  const [row] = await sql`SELECT token_version FROM users WHERE id = ${userId}`;
  return (row?.token_version as number) ?? 0;
}

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
