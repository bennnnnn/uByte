import { getSql } from "./client";

export async function dbCheckRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ limited: boolean; retryAfter: number }> {
  const sql = getSql();
  const now = Date.now();
  const windowStart = now - windowMs;

  // Serialize per-key updates so the DB fallback cannot overshoot the limit
  // when multiple requests arrive concurrently.
  const [row] = await sql`
    WITH lock AS (
      SELECT pg_advisory_xact_lock(hashtext(${key}))
    ),
    pruned AS (
      DELETE FROM rate_limits
      WHERE key = ${key} AND hit_at < ${windowStart}
      RETURNING 1
    ),
    counted AS (
      SELECT COUNT(*)::int AS c, MIN(hit_at)::bigint AS oldest
      FROM rate_limits, lock
      WHERE key = ${key} AND hit_at >= ${windowStart}
    ),
    inserted AS (
      INSERT INTO rate_limits (key, hit_at)
      SELECT ${key}, ${now}
      FROM counted
      WHERE counted.c < ${maxRequests}
      RETURNING hit_at
    )
    SELECT
      EXISTS(SELECT 1 FROM inserted) AS inserted,
      counted.oldest AS oldest
    FROM counted
  `;

  if (row?.inserted) {
    return { limited: false, retryAfter: 0 };
  }

  const oldest = row?.oldest as number | null;
  const retryAfter = oldest
    ? Math.ceil((oldest + windowMs - now) / 1000)
    : 1;
  return { limited: true, retryAfter: Math.max(1, retryAfter) };
}
