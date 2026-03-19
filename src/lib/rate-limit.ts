import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { dbCheckRateLimit } from "@/lib/db";

/**
 * Rate limiting with Upstash Redis (preferred) falling back to PostgreSQL.
 *
 * Set these env vars to enable Redis-backed rate limiting:
 *   UPSTASH_REDIS_REST_URL   — from Upstash console → REST API → Endpoint
 *   UPSTASH_REDIS_REST_TOKEN — from Upstash console → REST API → Token
 *
 * Without these vars the system transparently falls back to the existing
 * PostgreSQL implementation. No code changes needed on existing callers.
 *
 * Redis advantages over DB:
 *   - Atomic INCR/EXPIRE — no race conditions
 *   - Sub-millisecond reads — no query overhead
 *   - Works correctly across multiple Vercel serverless instances / regions
 */

let redisClient: Redis | null = null;
// Cache Ratelimit instances by key pattern to avoid re-creating them per request.
const rlCache = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redisClient !== null) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisClient = new Redis({ url, token });
  return redisClient;
}

function getRatelimit(maxRequests: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const cacheKey = `${maxRequests}:${windowMs}`;
  if (rlCache.has(cacheKey)) return rlCache.get(cacheKey)!;

  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs}ms`),
    analytics: false,
  });
  rlCache.set(cacheKey, rl);
  return rl;
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ limited: boolean; retryAfter: number }> {
  const rl = getRatelimit(maxRequests, windowMs);

  if (rl) {
    try {
      const { success, reset } = await rl.limit(key);
      const retryAfter = success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return { limited: !success, retryAfter };
    } catch (err) {
      console.warn("[rate-limit] Redis unavailable, falling back to DB:", err);
    }
  }

  // Fallback: PostgreSQL-based sliding window
  try {
    return await dbCheckRateLimit(key, maxRequests, windowMs);
  } catch (err) {
    // If both Redis and DB are unavailable, fail closed
    console.error("[rate-limit] DB also unavailable, failing closed:", err);
    return { limited: true, retryAfter: 60 };
  }
}

const IP_REGEX = /^[\d.a-fA-F:]{3,45}$/;

/**
 * Get client IP from request headers (sanitized).
 *
 * On Vercel, `x-vercel-forwarded-for` is set by Vercel's infrastructure and
 * cannot be spoofed by the client, unlike `x-forwarded-for` and `x-real-ip`.
 */
export function getClientIp(headers: Headers): string {
  const raw =
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  return IP_REGEX.test(raw) ? raw : "unknown";
}
