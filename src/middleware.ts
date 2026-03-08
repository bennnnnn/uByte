import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(secret);
}

/**
 * Edge middleware:
 * 1. Ensures every visitor has a csrf_token cookie (needed for mutation requests).
 * 2. Fast-fails unauthenticated requests to admin routes.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route protection ──────────────────────────────────────────────────
  if (pathname.startsWith("/api/admin") || pathname === "/admin") {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      await jwtVerify(token, getSecret());
    } catch {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── CSRF cookie: set on every page navigation if missing ────────────────────
  const response = NextResponse.next();
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
    "/admin",
    // Match all page navigations (not static files or _next assets)
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.).*)",
  ],
};
