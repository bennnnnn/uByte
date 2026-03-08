import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

/** Set a CSRF token cookie on the response (call after login/signup) */
export function setCsrfCookie(res: NextResponse): string {
  const token = crypto.randomUUID();
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // JS needs to read this
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return token;
}

/** Verify the CSRF token header matches the cookie. Returns error string or null. */
export function verifyCsrf(request: NextRequest): string | null {
  const cookie = request.cookies.get(CSRF_COOKIE)?.value;
  const header = request.headers.get(CSRF_HEADER);

  if (!cookie || !header) {
    return "Missing CSRF token";
  }
  if (cookie !== header) {
    return "Invalid CSRF token";
  }
  return null;
}
