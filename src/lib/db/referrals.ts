/**
 * Referral system DB layer.
 *
 * Tables (auto-created on first use):
 *   referral_codes        — one unique invite code per user
 *   referral_conversions  — tracks who signed up via whose link
 *
 * Reward logic (Phase 1 — tracking only):
 *   When a referred user subscribes via Paddle, call recordReferralSubscription().
 *   For now this just stamps subscribed_at. Future phase: auto-extend referrer's Pro.
 */
import { getSql } from "./client";

let _ready = false;
async function ensureTables(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS referral_codes (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      code       TEXT    NOT NULL UNIQUE,
      created_at TEXT    DEFAULT (NOW()::text)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS referral_conversions (
      id               SERIAL PRIMARY KEY,
      referrer_id      INTEGER NOT NULL REFERENCES users(id),
      referred_user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      signed_up_at     TEXT    DEFAULT (NOW()::text),
      subscribed_at    TEXT
    )
  `;
  _ready = true;
}

/** Returns the existing invite code for userId, or creates one. */
export async function getOrCreateReferralCode(userId: number): Promise<string> {
  await ensureTables();
  const sql = getSql();
  const rows = await sql`SELECT code FROM referral_codes WHERE user_id = ${userId} LIMIT 1`;
  if (rows.length > 0) return rows[0].code as string;

  // Generate an 8-char hex code using Web Crypto (works in Node.js + Edge runtimes)
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  const code = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  await sql`
    INSERT INTO referral_codes (user_id, code) VALUES (${userId}, ${code})
    ON CONFLICT (user_id) DO NOTHING
  `;
  // Re-fetch in case of a race (another request won the insert)
  const final = await sql`SELECT code FROM referral_codes WHERE user_id = ${userId} LIMIT 1`;
  return final[0].code as string;
}

/** Returns signup + subscription counts for a given user's referral code. */
export async function getReferralStats(userId: number): Promise<{
  code: string;
  signups: number;
  subscribed: number;
}> {
  await ensureTables();
  const sql = getSql();
  const code = await getOrCreateReferralCode(userId);
  const stats = await sql`
    SELECT
      COUNT(*) FILTER (WHERE subscribed_at IS NULL) AS signups,
      COUNT(*) FILTER (WHERE subscribed_at IS NOT NULL) AS subscribed
    FROM referral_conversions
    WHERE referrer_id = ${userId}
  `;
  return {
    code,
    signups:    Number(stats[0]?.signups    ?? 0),
    subscribed: Number(stats[0]?.subscribed ?? 0),
  };
}

/** Looks up who owns a given invite code. Returns referrerId or null. */
export async function getReferrerByCode(code: string): Promise<number | null> {
  await ensureTables();
  const sql = getSql();
  const rows = await sql`SELECT user_id FROM referral_codes WHERE code = ${code} LIMIT 1`;
  return rows.length > 0 ? (rows[0].user_id as number) : null;
}

/** Called during signup to link a new user to their referrer. */
export async function recordReferralSignup(
  referrerId: number,
  referredUserId: number
): Promise<void> {
  await ensureTables();
  const sql = getSql();
  await sql`
    INSERT INTO referral_conversions (referrer_id, referred_user_id)
    VALUES (${referrerId}, ${referredUserId})
    ON CONFLICT (referred_user_id) DO NOTHING
  `;
}

/**
 * Called from the Paddle webhook when a referred user subscribes.
 * Stamps subscribed_at so the referrer can be rewarded.
 */
export async function recordReferralSubscription(referredUserId: number): Promise<void> {
  await ensureTables();
  const sql = getSql();
  await sql`
    UPDATE referral_conversions
    SET subscribed_at = NOW()::text
    WHERE referred_user_id = ${referredUserId} AND subscribed_at IS NULL
  `;
}

/**
 * Rewards the referrer when a referred user subscribes for the first time.
 * Extends the referrer's subscription by 30 days (or grants 30 days from today if free).
 * Only fires once per referred user (idempotent via rewarded_at column).
 */
export async function rewardReferrer(referredUserId: number): Promise<void> {
  await ensureTables();
  const sql = getSql();

  // Add rewarded_at column if it doesn't exist (schema migration-lite approach)
  await sql`
    ALTER TABLE referral_conversions
    ADD COLUMN IF NOT EXISTS rewarded_at TEXT
  `.catch(() => {});

  // Find the referrer for this user (only if not already rewarded)
  const rows = await sql`
    SELECT referrer_id FROM referral_conversions
    WHERE referred_user_id = ${referredUserId}
      AND subscribed_at IS NOT NULL
      AND rewarded_at IS NULL
    LIMIT 1
  `;
  if (rows.length === 0) return;

  const referrerId = rows[0].referrer_id as number;

  // Extend the referrer's subscription by 30 days
  await sql`
    UPDATE users
    SET subscription_expires_at = (
      CASE
        WHEN subscription_expires_at IS NOT NULL AND subscription_expires_at::timestamptz > NOW()
          THEN (subscription_expires_at::timestamptz + INTERVAL '30 days')::text
        ELSE (NOW() + INTERVAL '30 days')::text
      END
    ),
    plan = CASE WHEN plan = 'free' THEN 'pro' ELSE plan END
    WHERE id = ${referrerId}
  `;

  // Mark as rewarded
  await sql`
    UPDATE referral_conversions
    SET rewarded_at = NOW()::text
    WHERE referred_user_id = ${referredUserId}
  `;

  console.log(`[referrals] Rewarded referrer ${referrerId} +30 days for referred user ${referredUserId}`);
}
