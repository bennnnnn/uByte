import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, createEmailVerificationToken, getReferrerByCode, recordReferralSignup } from "@/lib/db";
import { createNotification } from "@/lib/db/notifications";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { setCsrfCookie, verifyCsrf } from "@/lib/csrf";
import * as Sentry from "@sentry/nextjs";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { withErrorHandling } from "@/lib/api-utils";
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";
import { isFeatureEnabled } from "@/lib/db/site-settings";

export const POST = withErrorHandling("POST /api/auth/signup", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`signup:${ip}`, 3, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  if (!await isFeatureEnabled("registration_open")) {
    return NextResponse.json({ error: "Registration is currently closed" }, { status: 503 });
  }

  const { name, email: rawEmail, password, referralCode } = await request.json();
  if (!name || !rawEmail || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (typeof name !== "string" || name.length > 100 || typeof rawEmail !== "string" || rawEmail.length > 254 || typeof password !== "string" || password.length > 256) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Normalize email: trim and lowercase so "User@Example.com" and "user@example.com"
  // are treated as the same account across all entry points.
  const email = rawEmail.trim().toLowerCase();

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
  // Send verification first — simple transactional email that reliably hits inbox.
  // Welcome email is sent separately; if it lands in Promotions that's acceptable,
  // but the verify link must arrive in the primary inbox.
  try {
    await sendVerificationEmail(email, name, verifyToken);
  } catch (err) {
    console.error("[signup] Verification email failed:", err);
    Sentry.captureException(err, { tags: { route: "signup" }, extra: { kind: "signup-verify-email" } });
  }
  try {
    await sendWelcomeEmail(email, name);
  } catch (err) {
    console.error("[signup] Welcome email failed:", err);
  }
  // In-app welcome notification
  createNotification(
    user.id,
    "success",
    "Welcome to uByte! 🎉",
    "Your account is ready. Pick a language, start your first tutorial, and save your progress as you learn.",
    "/dashboard"
  ).catch(() => {});

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

  // Do not set a session cookie — the client shows a success step and the user signs in explicitly.
  const res = NextResponse.json({ ok: true as const, email: user.email, name: user.name });
  setCsrfCookie(res);
  return res;
});
