import { dbCheckRateLimit } from "@/lib/db";

/**
 * Check if a request should be rate-limited.
 * Uses the DB for persistence across deploys and restarts.
 *
 * ─── SCALING NOTE ────────────────────────────────────────────────────────────
 * The current implementation uses Neon PostgreSQL for rate-limit counters and
 * site_settings caching. Under Vercel's serverless model each function instance
 * maintains its own in-process cache, which means cache invalidation is
 * per-instance only.
 *
 * When traffic grows beyond ~10 req/s or the platform runs in multiple regions,
 * consider migrating to a shared KV store:
 *
 *   Option A — Vercel KV (Redis-compatible, native Vercel integration):
 *     npm install @vercel/kv
 *     Add KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN to env
 *
 *   Option B — Upstash Redis (serverless-native, global replication):
 *     npm install @upstash/redis
 *     Add UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN to env
 *
 * Both options provide atomic INCR/EXPIRE operations suitable for sliding-window
 * rate limiting and sub-millisecond reads for settings cache.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ limited: boolean; retryAfter: number }> {
  try {
    return await dbCheckRateLimit(key, maxRequests, windowMs);
  } catch (err) {
    // If DB is unavailable, fail closed — deny the request rather than bypass rate limiting
    console.error("[rate-limit] DB unavailable, failing closed:", err);
    return { limited: true, retryAfter: 60 };
  }
}

const IP_REGEX = /^[\d.a-fA-F:]{3,45}$/;

/**
 * Get client IP from request headers (sanitized).
 *
 * On Vercel, `x-vercel-forwarded-for` is set by Vercel's infrastructure and
 * cannot be spoofed by the client, unlike `x-forwarded-for` and `x-real-ip`.
 * We prefer it when present to prevent rate-limit bypass via header spoofing.
 */
export function getClientIp(headers: Headers): string {
  const raw =
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  return IP_REGEX.test(raw) ? raw : "unknown";
}
