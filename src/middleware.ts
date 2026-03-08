import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(secret);
}

/**
 * Edge middleware — fast-fails unauthenticated requests to admin routes.
 * Covers both API endpoints (/api/admin/*) and the admin page (/admin).
 * Full is_admin DB check still happens inside each handler / page hook.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin"],
};
