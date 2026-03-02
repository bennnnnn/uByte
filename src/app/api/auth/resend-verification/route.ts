import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserById, createEmailVerificationToken } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

export const POST = withErrorHandling("POST /api/auth/resend-verification", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`resend-verify:${ip}`, 3, 300_000); // 3 per 5 min
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { user: tokenPayload, response } = await requireAuth();
  if (!tokenPayload) return response;

  const user = await getUserById(tokenPayload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.email_verified) {
    return NextResponse.json({ message: "Already verified" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await createEmailVerificationToken(user.id, token);

  sendVerificationEmail(user.email, user.name, token).catch((err) => {
    console.error("Failed to resend verification email:", err);
  });

  return NextResponse.json({ message: "Verification email sent" });
});
