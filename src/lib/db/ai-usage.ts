import { getSql } from "./client";

const TABLE_MISSING = "42P01";

async function ensureAiUsageTables(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS ai_usage_daily (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day        DATE NOT NULL DEFAULT CURRENT_DATE,
      count      INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ai_cooldown (
      user_id        INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      last_called_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

const MAX_AI_CALLS_PER_DAY = 10;
const COOLDOWN_SECONDS = 10;

export const AI_QUOTA_DAILY = MAX_AI_CALLS_PER_DAY;
export const AI_COOLDOWN_SECONDS = COOLDOWN_SECONDS;

/** Get today's usage count for user. Returns 0 if no row or table missing. */
export async function getTodayAiUsageCount(userId: number): Promise<number> {
  const sql = getSql();
  try {
    const [row] = await sql`
      SELECT count FROM ai_usage_daily
      WHERE user_id = ${userId} AND day = CURRENT_DATE
    `;
    return (row?.count as number) ?? 0;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureAiUsageTables();
      return 0;
    }
    throw err;
  }
}

/** Increment today's usage by 1. Call after a successful AI feedback request. */
export async function incrementTodayAiUsage(userId: number): Promise<void> {
  const sql = getSql();
  async function doInsert() {
    await sql`
      INSERT INTO ai_usage_daily (user_id, day, count)
      VALUES (${userId}, CURRENT_DATE, 1)
      ON CONFLICT (user_id, day) DO UPDATE SET count = ai_usage_daily.count + 1
    `;
  }
  try {
    await doInsert();
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureAiUsageTables();
      await doInsert();
    }
  }
}

/** Check if user can make an AI call (under quota). */
export async function canMakeAiCall(userId: number): Promise<{ allowed: boolean; used: number; limit: number }> {
  const used = await getTodayAiUsageCount(userId);
  return { allowed: used < MAX_AI_CALLS_PER_DAY, used, limit: MAX_AI_CALLS_PER_DAY };
}

/** Get last AI call time for cooldown. Returns null if never or table missing. */
export async function getLastAiCallAt(userId: number): Promise<Date | null> {
  const sql = getSql();
  try {
    const [row] = await sql`
      SELECT last_called_at FROM ai_cooldown WHERE user_id = ${userId}
    `;
    const at = row?.last_called_at;
    return at ? new Date(at as string) : null;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureAiUsageTables();
      return null;
    }
    throw err;
  }
}

/** Set last AI call time (call after successful AI feedback). */
export async function setLastAiCallAt(userId: number): Promise<void> {
  const sql = getSql();
  async function doUpsert() {
    await sql`
      INSERT INTO ai_cooldown (user_id, last_called_at)
      VALUES (${userId}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET last_called_at = NOW()
    `;
  }
  try {
    await doUpsert();
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === TABLE_MISSING) {
      await ensureAiUsageTables();
      await doUpsert();
    }
  }
}

/** Check if user is in cooldown (must wait COOLDOWN_SECONDS since last call). */
export async function isInCooldown(userId: number): Promise<boolean> {
  const last = await getLastAiCallAt(userId);
  if (!last) return false;
  return (Date.now() - last.getTime()) / 1000 < COOLDOWN_SECONDS;
}
