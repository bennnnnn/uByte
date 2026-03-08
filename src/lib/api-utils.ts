import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, type TokenPayload } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import type { User } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function getRequestId(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

type Handler = (request: NextRequest, context?: unknown) => Promise<NextResponse>;

export function withErrorHandling(routeName: string, handler: Handler): Handler {
  return async (request: NextRequest, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (err) {
      const requestId = getRequestId();
      console.error(`[${requestId}] ${routeName} error:`, err);
      return NextResponse.json(
        { error: "Internal server error", requestId },
        { status: 500 }
      );
    }
  };
}

export async function requireAuth(): Promise<
  { user: TokenPayload; response: null } | { user: null; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  return { user, response: null };
}

export async function requireAdmin(): Promise<
  { admin: User; response: null } | { admin: null; response: NextResponse }
> {
  const tokenUser = await getCurrentUser();
  if (!tokenUser) {
    return { admin: null, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  const user = await getUserById(tokenUser.userId);
  if (!user || !user.is_admin) {
    return { admin: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { admin: user, response: null };
}

// ─── Protected-route middleware ─────────────────────

export interface ProtectedRouteOptions {
  /** Rate-limit key prefix (e.g. "chat", "progress:post"). IP and userId are appended automatically. */
  rateLimitKey?: string;
  /** Max requests in the window. Default: 30 */
  rateLimitMax?: number;
  /** Window duration in ms. Default: 60_000 */
  rateLimitWindowMs?: number;
  /** Skip CSRF check (for GET-like handlers that still need auth). Default: false */
  skipCsrf?: boolean;
}

type ProtectedHandler = (
  request: NextRequest,
  user: TokenPayload,
) => Promise<NextResponse>;

/**
 * Wraps a route handler with CSRF verification, authentication, and rate limiting.
 * Eliminates the repeated boilerplate across 25+ mutation routes.
 *
 * Usage:
 *   export const POST = withErrorHandling("POST /api/foo",
 *     protectedRoute({ rateLimitKey: "foo", rateLimitMax: 10 }, async (req, user) => { ... })
 *   );
 */
export function protectedRoute(
  opts: ProtectedRouteOptions,
  handler: ProtectedHandler
): Handler {
  return async (request: NextRequest, context?: unknown) => {
    void context;

    if (!opts.skipCsrf) {
      const csrfError = verifyCsrf(request);
      if (csrfError) {
        return NextResponse.json({ error: csrfError }, { status: 403 });
      }
    }

    const { user, response } = await requireAuth();
    if (!user) return response;

    if (opts.rateLimitKey) {
      const ip = getClientIp(request.headers);
      const key = `${opts.rateLimitKey}:${ip}:${user.userId}`;
      const { limited, retryAfter } = await checkRateLimit(
        key,
        opts.rateLimitMax ?? 30,
        opts.rateLimitWindowMs ?? 60_000
      );
      if (limited) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": String(retryAfter) } }
        );
      }
    }

    return handler(request, user);
  };
}
