import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { getCurrentUser, type TokenPayload } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import type { User } from "@/lib/db";
import { getEffectiveAdminPermissions, type AdminPermission } from "@/app/admin/permission-constants";
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

/**
 * Super admins always pass. Limited admins pass only if their effective permissions
 * include `permission` (matches sidebar tab visibility in the admin UI).
 */
export async function requireAdminPermission(
  permission: AdminPermission,
): Promise<{ admin: User; response: null } | { admin: null; response: NextResponse }> {
  const { admin, response } = await requireAdmin();
  if (!admin) return { admin: null, response: response! };
  const perms = getEffectiveAdminPermissions(admin);
  if (perms.includes(permission)) {
    return { admin, response: null };
  }
  return {
    admin: null,
    response: NextResponse.json(
      { error: `Forbidden — ${permission} permission required` },
      { status: 403 },
    ),
  };
}

/** Same as requireAdmin but rejects limited admins — use for routes that must stay super-only. */
export async function requireSuperAdmin(): Promise<
  { admin: User; response: null } | { admin: null; response: NextResponse }
> {
  const { admin, response } = await requireAdmin();
  if (!admin) return { admin: null, response: response! };
  // NULL admin_role means the user was promoted before roles existed — treat as super
  if (admin.admin_role !== null && admin.admin_role !== "super") {
    return { admin: null, response: NextResponse.json({ error: "Forbidden — requires super admin" }, { status: 403 }) };
  }
  return { admin, response: null };
}

/**
 * Super admins, or limited admins whose effective permissions include "users"
 * (ban, delete, change plan, etc.). Matches the Users tab visibility.
 */
export async function requireAdminUsersManagement(): Promise<
  { admin: User; response: null } | { admin: null; response: NextResponse }
> {
  const { admin, response } = await requireAdmin();
  if (!admin) return { admin: null, response: response! };
  if (!getEffectiveAdminPermissions(admin).includes("users")) {
    return {
      admin: null,
      response: NextResponse.json(
        { error: "Forbidden — users management permission required" },
        { status: 403 },
      ),
    };
  }
  return { admin, response: null };
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
export async function parseJsonBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
): Promise<
  | { data: z.infer<T>; error: null }
  | { data: null; error: NextResponse }
> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { data: null, error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      error: NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      ),
    };
  }
  return { data: parsed.data, error: null };
}

type AdminHandler = (request: NextRequest, admin: User) => Promise<NextResponse>;

export interface AdminRouteOptions extends ProtectedRouteOptions {
  permission?: AdminPermission;
  superOnly?: boolean;
}

/** CSRF + admin auth (+ optional permission) + rate limit. */
export function adminRoute(opts: AdminRouteOptions, handler: AdminHandler): Handler {
  return async (request: NextRequest, context?: unknown) => {
    void context;

    const csrfError = verifyCsrf(request);
    if (csrfError) {
      return NextResponse.json({ error: csrfError }, { status: 403 });
    }

    const gate = opts.superOnly
      ? await requireSuperAdmin()
      : opts.permission
        ? await requireAdminPermission(opts.permission)
        : await requireAdmin();
    if (!gate.admin) return gate.response!;

    if (opts.rateLimitKey) {
      const ip = getClientIp(request.headers);
      const key = `${opts.rateLimitKey}:${ip}:${gate.admin.id}`;
      const { limited, retryAfter } = await checkRateLimit(
        key,
        opts.rateLimitMax ?? 30,
        opts.rateLimitWindowMs ?? 60_000,
      );
      if (limited) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": String(retryAfter) } },
        );
      }
    }

    return handler(request, gate.admin);
  };
}

type PublicMutationHandler = (request: NextRequest) => Promise<NextResponse>;

/** CSRF + IP rate limit for unauthenticated mutations (run-code, step-check). */
export function publicMutationRoute(
  opts: { rateLimitKey: string; rateLimitMax: number; rateLimitWindowMs?: number },
  handler: PublicMutationHandler,
): Handler {
  return async (request: NextRequest, context?: unknown) => {
    void context;
    const csrfError = verifyCsrf(request);
    if (csrfError) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }
    const ip = getClientIp(request.headers);
    const { limited, retryAfter } = await checkRateLimit(
      `${opts.rateLimitKey}:${ip}`,
      opts.rateLimitMax,
      opts.rateLimitWindowMs ?? 60_000,
    );
    if (limited) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
    return handler(request);
  };
}

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
