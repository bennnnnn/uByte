import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPasswordResetToken, incrementTokenVersion, markResetTokenUsed, updateUserPassword } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";

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
  if (!isValidPassword(newPassword)) {
    return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 });
  }

  const resetToken = await getPasswordResetToken(token);
  if (!resetToken) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(resetToken.user_id, passwordHash);
  await incrementTokenVersion(resetToken.user_id);
  await markResetTokenUsed(resetToken.id);

  return NextResponse.json({ ok: true });
});
