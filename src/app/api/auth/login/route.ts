import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  getUserByEmail,
  logActivity,
  updateStreak,
  incrementLoginFailure,
  resetLoginFailures,
  isUserLocked,
} from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { setCsrfCookie, verifyCsrf } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/api-utils";

export const POST = withErrorHandling("POST /api/auth/login", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`login:${ip}`, 5, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || password.length > 256) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (await isUserLocked(user.id)) {
    return NextResponse.json(
      { error: "Account temporarily locked due to too many failed attempts. Try again in 15 minutes." },
      { status: 423 }
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    await incrementLoginFailure(user.id);
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await resetLoginFailures(user.id);

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    tokenVersion: user.token_version ?? 0,
    isAdmin: user.is_admin === 1,
  });
  await setAuthCookie(token);

  await Promise.all([logActivity(user.id, "login"), updateStreak(user.id)]);

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  setCsrfCookie(res);
  return res;
});
