import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { withErrorHandling } from "@/lib/api-utils";
import { getSafeNextPath, type AuthPageMode } from "@/lib/auth-redirect";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export const GET = withErrorHandling("GET /api/auth/google", async (request: NextRequest) => {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google OAuth is not configured" }, { status: 503 });
  }

  const origin = request.nextUrl.origin;
  const state = randomBytes(16).toString("hex");
  const mode = request.nextUrl.searchParams.get("mode") === "signup" ? "signup" : "login";
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${origin}/api/auth/google/callback`,
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
  setOauthFlowCookie(res, "oauth_mode", mode);
  setOauthFlowCookie(res, "oauth_next", nextPath);

  return res;
});

function setOauthFlowCookie(
  response: NextResponse,
  name: string,
  value: AuthPageMode | string
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
}
