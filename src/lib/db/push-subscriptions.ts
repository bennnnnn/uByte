/**
 * Push subscription storage.
 *
 * Table: push_subscriptions — one row per (user, endpoint) pair.
 * A user can have multiple subscriptions (phone + laptop + desktop).
 */
import { getSql } from "./client";

let _ready = false;
async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint   TEXT    NOT NULL,
      keys_json  TEXT    NOT NULL,
      created_at TEXT    DEFAULT (NOW()::text),
      UNIQUE (user_id, endpoint)
    )
  `;
  _ready = true;
}

export async function savePushSubscription(
  userId: number,
  endpoint: string,
  keys: { p256dh: string; auth: string }
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, keys_json)
    VALUES (${userId}, ${endpoint}, ${JSON.stringify(keys)})
    ON CONFLICT (user_id, endpoint) DO UPDATE SET keys_json = EXCLUDED.keys_json
  `;
}

export async function deletePushSubscription(
  userId: number,
  endpoint: string
): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM push_subscriptions WHERE user_id = ${userId} AND endpoint = ${endpoint}`;
}

export interface PushSubscriptionRow {
  userId: number;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Returns all subscriptions for a user (multi-device). */
export async function getPushSubscriptionsForUser(
  userId: number
): Promise<PushSubscriptionRow[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT user_id, endpoint, keys_json FROM push_subscriptions WHERE user_id = ${userId}
  `;
  return rows.map((r) => ({
    userId: r.user_id as number,
    endpoint: r.endpoint as string,
    keys: JSON.parse(r.keys_json as string) as { p256dh: string; auth: string },
  }));
}

/** Deletes push subscriptions older than the given number of days. Returns count deleted. */
export async function deleteOldPushSubscriptions(olderThanDays: number): Promise<number> {
  await ensureTable();
  const sql = getSql();
  const [row] = await sql`
    WITH deleted AS (
      DELETE FROM push_subscriptions
      WHERE created_at::timestamptz < NOW() - (${olderThanDays} || ' days')::interval
      RETURNING id
    )
    SELECT COUNT(*)::int AS count FROM deleted
  `;
  return (row?.count as number) ?? 0;
}

/** Returns all subscriptions for a list of user IDs (used by cron). */
export async function getPushSubscriptionsForUsers(
  userIds: number[]
): Promise<PushSubscriptionRow[]> {
  if (userIds.length === 0) return [];
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT user_id, endpoint, keys_json FROM push_subscriptions WHERE user_id = ANY(${userIds})
  `;
  return rows.map((r) => ({
    userId: r.user_id as number,
    endpoint: r.endpoint as string,
    keys: JSON.parse(r.keys_json as string) as { p256dh: string; auth: string },
  }));
}
