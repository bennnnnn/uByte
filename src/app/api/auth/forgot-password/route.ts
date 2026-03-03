import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { getUserByEmail, createPasswordResetToken } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";

import { BASE_URL } from "@/lib/constants";

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

  // Always return 200 — don't reveal whether email exists
  const user = await getUserByEmail(email);
  if (user && !user.google_id) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    await createPasswordResetToken(user.id, token, expiresAt);

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@resend.dev";
    if (resendKey) {
      const resend = new Resend(resendKey);
      const resetLink = `${BASE_URL}/reset-password?token=${token}`;
      await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: "Reset your password — uByte",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2 style="color:#0891b2">Reset your password</h2>
            <p>Hi ${user.name},</p>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0891b2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a>
            <p style="color:#6b7280;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
            <p style="color:#6b7280;font-size:12px">Or copy this link: ${resetLink}</p>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ ok: true });
});
