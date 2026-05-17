import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getMaintenanceModeStatus } from "@/lib/db/site-settings";
import { TUTORIAL_LANG_SET } from "@/lib/languages/tutorial-lang-ids";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(secret);
}

function redirectLegacyProductRoute(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // Tutorials-only product: old interview simulator, interviews hub, and practice IDE → tutorial hub
  if (pathname === "/daily" || pathname.startsWith("/interview") || pathname.startsWith("/interviews")) {
    return NextResponse.redirect(new URL("/tutorial", request.url), 308);
  }

  if (pathname === "/practice" || pathname.startsWith("/practice/")) {
    const lang = segments[1];
    const destination = lang && TUTORIAL_LANG_SET.has(lang) ? `/tutorial/${lang}` : "/tutorial";
    return NextResponse.redirect(new URL(destination, request.url), 308);
  }

  if (pathname === "/certifications" || pathname.startsWith("/certifications/")) {
    const lang = segments[1];
    const destination = lang && TUTORIAL_LANG_SET.has(lang) ? `/tutorial/${lang}` : "/tutorial";
    return NextResponse.redirect(new URL(destination, request.url), 308);
  }

  return null;
}

/**
 * Edge middleware:
 * 1. Ensures every visitor has a csrf_token cookie (needed for mutation requests).
 * 2. Fast-fails unauthenticated requests to admin routes.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyRedirect = redirectLegacyProductRoute(request);
  if (legacyRedirect) return legacyRedirect;

  const bypassMaintenance =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/a/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/maintenance");

  if (!bypassMaintenance) {
    const inMaintenance = await getMaintenanceModeStatus();
    if (inMaintenance) {
      const token = request.cookies.get("auth_token")?.value;
      if (!token) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }

      try {
        const { payload } = await jwtVerify(token, getSecret());
        if (!payload.isAdmin) {
          return NextResponse.redirect(new URL("/maintenance", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  }

  // ── Admin route protection ──────────────────────────────────────────────────
  // Covers both the default /admin route and personal slug routes /a/<slug>
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/admin") || pathname.startsWith("/a/")) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, getSecret());
      // Reject non-admins at the edge — no DB call needed since isAdmin is in the JWT
      if (!payload.isAdmin) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── CSRF cookie: set on every page navigation if missing ────────────────────
  const response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });

  if (!request.cookies.get("csrf_token")?.value) {
    response.cookies.set("csrf_token", crypto.randomUUID(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/admin/:path*",
    "/admin",
    "/a/:path*",
    // Match all page navigations (not static files or _next assets)
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.).*)",
  ],
};
