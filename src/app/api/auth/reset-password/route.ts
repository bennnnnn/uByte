import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPasswordResetToken, markResetTokenUsed, updateUserPassword } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { MIN_PASSWORD_LENGTH, PASSWORD_MIN_ERROR } from "@/lib/password-policy";

export const POST = withErrorHandling("POST /api/auth/reset-password", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited, retryAfter } = await checkRateLimit(`reset-password:${ip}`, 5, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await request.json();
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: PASSWORD_MIN_ERROR }, { status: 400 });
  }

  const resetToken = await getPasswordResetToken(token);
  if (!resetToken) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(resetToken.user_id, passwordHash);
  await markResetTokenUsed(resetToken.id);

  return NextResponse.json({ ok: true });
});
