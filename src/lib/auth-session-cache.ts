/**
 * Short-lived in-process cache for auth DB lookups (token_version, lock status).
 * Cuts repeated getUserById calls within the same serverless isolate (~30s TTL).
 */
const TTL_MS = 30_000;

interface CachedUserAuth {
  tokenVersion: number;
  lockedUntil: string | null;
  expiresAt: number;
}

const cache = new Map<number, CachedUserAuth>();

export function getCachedUserAuth(userId: number): CachedUserAuth | null {
  const hit = cache.get(userId);
  if (!hit || hit.expiresAt < Date.now()) {
    if (hit) cache.delete(userId);
    return null;
  }
  return hit;
}

export function setCachedUserAuth(
  userId: number,
  tokenVersion: number,
  lockedUntil: string | null,
): void {
  cache.set(userId, {
    tokenVersion,
    lockedUntil,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function invalidateCachedUserAuth(userId: number): void {
  cache.delete(userId);
}
