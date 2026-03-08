import { getSql } from "./client";

/** How many NEW problems a free user can unlock per day. */
export const DAILY_DRIP = 2;

/** Maximum total free problems a user can ever unlock. */
export const MAX_FREE_PROBLEMS = 10;

/** Auto-creates the table on first use. */
export async function ensurePracticeUnlocksTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS practice_unlocks (
      id           SERIAL      PRIMARY KEY,
      user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_slug TEXT        NOT NULL,
      unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, problem_slug)
    )
  `;
}

/** Get the slugs of all problems a user has unlocked. */
export async function getUnlockedSlugs(userId: number): Promise<string[]> {
  await ensurePracticeUnlocksTable();
  const sql = getSql();
  const rows = await sql`
    SELECT problem_slug FROM practice_unlocks
    WHERE user_id = ${userId}
    ORDER BY unlocked_at
  `;
  return rows.map((r) => r.problem_slug as string);
}

/** Count how many problems a user has unlocked. */
export async function getUnlockedCount(userId: number): Promise<number> {
  await ensurePracticeUnlocksTable();
  const sql = getSql();
  const [row] = await sql`
    SELECT COUNT(*)::int AS c FROM practice_unlocks WHERE user_id = ${userId}
  `;
  return (row?.c as number) ?? 0;
}

/**
 * Calculate how many total problems a free user is allowed to have unlocked,
 * based on how many days since they signed up.
 *
 * Day 0 (signup day): 2
 * Day 1: 4
 * Day 2: 6
 * Day 3: 8
 * Day 4+: 10 (capped)
 */
export function calcAllowance(createdAt: string | Date): number {
  const signup = new Date(createdAt);
  signup.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysSinceSignup = Math.floor(
    (now.getTime() - signup.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.min(MAX_FREE_PROBLEMS, (daysSinceSignup + 1) * DAILY_DRIP);
}

/**
 * Try to unlock a problem for a free user.
 * Returns { allowed: true } if already unlocked or newly unlocked.
 * Returns { allowed: false, ... } if user is at their limit.
 */
export async function tryUnlockProblem(
  userId: number,
  problemSlug: string,
  userCreatedAt: string | Date
): Promise<{
  allowed: boolean;
  unlockedCount: number;
  allowance: number;
  isNew: boolean;
}> {
  await ensurePracticeUnlocksTable();
  const sql = getSql();

  const unlocked = await getUnlockedSlugs(userId);
  const allowance = calcAllowance(userCreatedAt);

  if (unlocked.includes(problemSlug)) {
    return { allowed: true, unlockedCount: unlocked.length, allowance, isNew: false };
  }

  if (unlocked.length >= allowance) {
    return { allowed: false, unlockedCount: unlocked.length, allowance, isNew: false };
  }

  await sql`
    INSERT INTO practice_unlocks (user_id, problem_slug)
    VALUES (${userId}, ${problemSlug})
    ON CONFLICT (user_id, problem_slug) DO NOTHING
  `;

  return { allowed: true, unlockedCount: unlocked.length + 1, allowance, isNew: true };
}

/** Full drip status for a user (used by API to send to client). */
export async function getDripStatus(
  userId: number,
  userCreatedAt: string | Date
): Promise<{
  unlockedSlugs: string[];
  unlockedCount: number;
  allowance: number;
  maxFree: number;
  dailyDrip: number;
  isMaxed: boolean;
}> {
  const unlockedSlugs = await getUnlockedSlugs(userId);
  const allowance = calcAllowance(userCreatedAt);
  return {
    unlockedSlugs,
    unlockedCount: unlockedSlugs.length,
    allowance,
    maxFree: MAX_FREE_PROBLEMS,
    dailyDrip: DAILY_DRIP,
    isMaxed: unlockedSlugs.length >= MAX_FREE_PROBLEMS,
  };
}
