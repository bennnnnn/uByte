/**
 * GET /api/unsubscribe?token=<hmac>
 *
 * One-click unsubscribe endpoint. The token is HMAC-SHA256(email, UNSUBSCRIBE_SECRET).
 * Email is passed as a separate query param so we can look up the user.
 *
 * URL shape: /api/unsubscribe?email=<encoded>&token=<hmac>
 *
 * On success: redirects to /unsubscribed (a simple confirmation page).
 * On failure: redirects to / (silent fail — never reveal whether an email exists).
 */
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual as cryptoTimingSafeEqual } from "crypto";
import { unsubscribeByEmail } from "@/lib/db/users";

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    // Hard-fail at request time rather than silently accepting forged tokens.
    throw new Error("UNSUBSCRIBE_SECRET (or JWT_SECRET) env var is not set");
  }
  return secret;
}

function makeToken(email: string): string {
  return createHmac("sha256", getSecret()).update(email.toLowerCase().trim()).digest("hex");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const token = searchParams.get("token") ?? "";

  if (!email || !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let expected: string;
  try {
    expected = makeToken(email);
  } catch {
    // Misconfigured server — redirect silently rather than exposing the error.
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Constant-time comparison
  if (expected.length !== token.length || !timingSafeEqual(expected, token)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await unsubscribeByEmail(email).catch(() => {});
  return NextResponse.redirect(new URL("/unsubscribed", request.url));
}

function timingSafeEqual(a: string, b: string): boolean {
  try {
    return cryptoTimingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}
