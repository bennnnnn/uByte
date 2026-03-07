import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, createEmailVerificationToken } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { setCsrfCookie } from "@/lib/csrf";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { withErrorHandling } from "@/lib/api-utils";
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";

export const POST = withErrorHandling("POST /api/auth/signup", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`signup:${ip}`, 3, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { name, email, password } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(name, email, passwordHash);

  const verifyToken = crypto.randomBytes(32).toString("hex");
  await createEmailVerificationToken(user.id, verifyToken);
  sendVerificationEmail(email, name, verifyToken).catch((err) => {
    console.error("Failed to send verification email:", err);
  });

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    tokenVersion: 0,
  });
  await setAuthCookie(token);

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  setCsrfCookie(res);
  return res;
});
