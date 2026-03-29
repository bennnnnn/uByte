import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getUserByEmail, createPasswordResetToken } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { sendPasswordResetEmail } from "@/lib/email";

// No CSRF check: unauthenticated users sending their email address have no
// session cookie and therefore no CSRF token. Rate limiting (3/min) is the
// abuse guard; the endpoint never reveals whether an account exists.
export const POST = withErrorHandling("POST /api/auth/forgot-password", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`forgot-password:${ip}`, 3, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Always return 200 — never reveal whether the email exists in our DB.
  const user = await getUserByEmail(email);
  if (user && !user.google_id) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    await createPasswordResetToken(user.id, token, expiresAt);
    // Wrap in try/catch: a Resend failure must not change the HTTP status and
    // must not reveal that this email address exists in our DB.
    sendPasswordResetEmail(user.email, user.name, token).catch((err) => {
      console.error("[forgot-password] Failed to send password reset email:", err);
    });
  }

  return NextResponse.json({ ok: true });
});
