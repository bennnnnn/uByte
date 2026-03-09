import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, createEmailVerificationToken, getReferrerByCode, recordReferralSignup } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { setCsrfCookie } from "@/lib/csrf";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
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

  const { name, email, password, referralCode } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (typeof name !== "string" || name.length > 100 || typeof email !== "string" || email.length > 254 || typeof password !== "string" || password.length > 256) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Unable to create account. Please try a different email or sign in." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(name, email, passwordHash);

  const verifyToken = crypto.randomBytes(32).toString("hex");
  await createEmailVerificationToken(user.id, verifyToken);
  sendVerificationEmail(email, name, verifyToken).catch((err) => {
    console.error("Failed to send verification email:", err);
  });
  // Day-0 welcome email — fire-and-forget, never blocks signup
  sendWelcomeEmail(email, name).catch(() => {});

  // Attribute referral if the new user came via an invite link
  if (typeof referralCode === "string" && /^[a-z0-9]{6,16}$/i.test(referralCode)) {
    getReferrerByCode(referralCode)
      .then((referrerId) => {
        if (referrerId && referrerId !== user.id) {
          return recordReferralSignup(referrerId, user.id);
        }
      })
      .catch(() => {}); // non-critical — never fail signup
  }

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
