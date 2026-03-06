import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  getUserByGoogleId,
  createUserWithGoogle,
  linkGoogleId,
  logActivity,
  updateStreak,
} from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { setCsrfCookie } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/api-utils";
import { sendGoogleLinkedEmail } from "@/lib/email";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const GET = withErrorHandling("GET /api/auth/google/callback", async (request: NextRequest) => {
  const origin = request.nextUrl.origin;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${origin}/?error=oauth_invalid_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=oauth_no_code`);
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${origin}/?error=oauth_not_configured`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${origin}/?error=oauth_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${origin}/?error=oauth_userinfo_failed`);
    }

    const googleUser = await userInfoRes.json();
    const { sub: googleId, email, name, email_verified } = googleUser;

    if (!googleId || !email) {
      return NextResponse.redirect(`${origin}/?error=oauth_missing_fields`);
    }

    if (!email_verified) {
      return NextResponse.redirect(`${origin}/?error=oauth_email_not_verified`);
    }

    let user = await getUserByGoogleId(googleId);
    if (!user) {
      const existing = await getUserByEmail(email);
      if (existing) {
        await linkGoogleId(existing.id, googleId);
        user = existing;
        sendGoogleLinkedEmail(user.email, user.name).catch(() => {});
      } else {
        user = await createUserWithGoogle(
          name ?? email.split("@")[0],
          email,
          googleId
        );
      }
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.redirect(`${origin}/?error=account_locked`);
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      tokenVersion: user.token_version ?? 0,
    });
    await setAuthCookie(token);
    await logActivity(user.id, "login_google");
    await updateStreak(user.id);

    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.delete("oauth_state");
    setCsrfCookie(res);
    return res;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/?error=oauth_failed`);
  }
});
