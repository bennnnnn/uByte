/**
 * Server-side checkout sessions — nonce-based user resolution for Paddle webhooks.
 *
 * When a user opens the Paddle checkout, the server generates a short-lived opaque
 * nonce tied to their authenticated userId. The client passes this nonce as
 * `customData.checkoutNonce`. The webhook resolves userId from the nonce, never
 * trusting a client-supplied userId directly.
 *
 * Nonces expire after 2 hours to prevent stale sessions from being replayed.
 */
import { getSql } from "./client";

let _ready = false;
async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS checkout_sessions (
      nonce      TEXT    PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan       TEXT    NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  _ready = true;
}

/** Creates a new checkout session and returns the opaque nonce. */
export async function createCheckoutSession(userId: number, plan: string): Promise<string> {
  await ensureTable();
  const sql = getSql();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  const nonce = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  await sql`
    INSERT INTO checkout_sessions (nonce, user_id, plan)
    VALUES (${nonce}, ${userId}, ${plan})
  `;
  return nonce;
}

/**
 * Resolves a userId from a nonce. Returns null if not found or expired.
 * Also cleans up expired sessions (> 2 hours old) opportunistically.
 */
export async function resolveCheckoutNonce(nonce: string): Promise<number | null> {
  if (!nonce || nonce.length !== 32) return null;
  await ensureTable();
  const sql = getSql();
  // Clean up expired sessions opportunistically (non-blocking)
  sql`DELETE FROM checkout_sessions WHERE created_at < NOW() - INTERVAL '2 hours'`.catch(() => {});
  const rows = await sql`
    SELECT user_id FROM checkout_sessions
    WHERE nonce = ${nonce}
      AND created_at > NOW() - INTERVAL '2 hours'
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  // Consume nonce (one-time use)
  sql`DELETE FROM checkout_sessions WHERE nonce = ${nonce}`.catch(() => {});
  return rows[0].user_id as number;
}
