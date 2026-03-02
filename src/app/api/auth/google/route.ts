import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { withErrorHandling } from "@/lib/api-utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export const GET = withErrorHandling("GET /api/auth/google", async () => {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google OAuth is not configured" }, { status: 503 });
  }

  const state = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${BASE_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );

  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return res;
});
