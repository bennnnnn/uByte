import { getSql } from "./client";

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
