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

type RedisClient = object;
type RatelimitResult = { success: boolean; reset: number };
type RatelimitInstance = { limit: (key: string) => Promise<RatelimitResult> };
type UpstashModules = {
  Redis: new (args: { url: string; token: string }) => RedisClient;
  Ratelimit: {
    new (args: { redis: RedisClient; limiter: unknown; analytics: boolean }): RatelimitInstance;
    slidingWindow: (maxRequests: number, window: string) => unknown;
  };
};

const dynamicImport = new Function(
  "specifier",
  "return import(specifier)"
) as <T = unknown>(specifier: string) => Promise<T>;

let modulesPromise: Promise<UpstashModules | null> | null = null;
let redisClient: RedisClient | null | undefined;
// Cache Ratelimit instances by key pattern to avoid re-creating them per request.
const rlCache = new Map<string, RatelimitInstance>();

async function loadUpstash(): Promise<UpstashModules | null> {
  if (modulesPromise) return modulesPromise;
  modulesPromise = Promise.all([
    dynamicImport<{ Redis: UpstashModules["Redis"] }>("@upstash/redis"),
    dynamicImport<{ Ratelimit: UpstashModules["Ratelimit"] }>("@upstash/ratelimit"),
  ])
    .then(([redisModule, ratelimitModule]) => ({
      Redis: redisModule.Redis,
      Ratelimit: ratelimitModule.Ratelimit,
    }))
    .catch((err) => {
      console.warn("[rate-limit] Upstash packages unavailable, falling back to DB:", err);
      return null;
    });
  return modulesPromise;
}

async function getRedis(): Promise<RedisClient | null> {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisClient = null;
    return null;
  }

  const modules = await loadUpstash();
  if (!modules) {
    redisClient = null;
    return null;
  }

  redisClient = new modules.Redis({ url, token });
  return redisClient;
}

async function getRatelimit(maxRequests: number, windowMs: number): Promise<RatelimitInstance | null> {
  const redis = await getRedis();
  if (!redis) return null;

  const cacheKey = `${maxRequests}:${windowMs}`;
  if (rlCache.has(cacheKey)) return rlCache.get(cacheKey)!;

  const modules = await loadUpstash();
  if (!modules) return null;

  const rl = new modules.Ratelimit({
    redis,
    limiter: modules.Ratelimit.slidingWindow(maxRequests, `${windowMs}ms`),
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
  const rl = await getRatelimit(maxRequests, windowMs);

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
