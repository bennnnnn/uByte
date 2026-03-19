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
import { sendGoogleLinkedEmail, sendWelcomeEmail } from "@/lib/email";
import { createNotification } from "@/lib/db/notifications";
import { buildAuthPageHref, getSafeNextPath, type AuthPageMode } from "@/lib/auth-redirect";
import { getReferrerByCode, recordReferralSignup } from "@/lib/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const GET = withErrorHandling("GET /api/auth/google/callback", async (request: NextRequest) => {
  const origin = request.nextUrl.origin;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;
  const authMode = getOauthMode(request.cookies.get("oauth_mode")?.value);
  const nextPath = getSafeNextPath(request.cookies.get("oauth_next")?.value);
  const referralCode = request.cookies.get("oauth_ref")?.value ?? "";

  if (!state || !storedState || state !== storedState) {
    return createAuthRedirect(origin, authMode, nextPath, "oauth_invalid_state");
  }

  if (!code) {
    return createAuthRedirect(origin, authMode, nextPath, "oauth_no_code");
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return createAuthRedirect(origin, authMode, nextPath, "oauth_not_configured");
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
      return createAuthRedirect(origin, authMode, nextPath, "oauth_token_failed");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      return createAuthRedirect(origin, authMode, nextPath, "oauth_userinfo_failed");
    }

    const googleUser = await userInfoRes.json();
    const { sub: googleId, email, name, email_verified } = googleUser;

    if (!googleId || !email) {
      return createAuthRedirect(origin, authMode, nextPath, "oauth_missing_fields");
    }

    if (!email_verified) {
      return createAuthRedirect(origin, authMode, nextPath, "oauth_email_not_verified");
    }

    let user = await getUserByGoogleId(googleId);
    let isNewUser = false;
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
        isNewUser = true;
      }
    }

    if (isNewUser) {
      // Day-0 welcome email — fire-and-forget
      sendWelcomeEmail(user.email, user.name).catch(() => {});
      // In-app welcome notification
      createNotification(
        user.id,
        "success",
        "Welcome to uByte! 🎉",
        "Your account is ready. Start with a tutorial, tackle an interview problem, or take a free certification exam.",
        "/tutorial/go"
      ).catch(() => {});
      // Track referral if user arrived via an invite link
      if (referralCode && /^[a-z0-9]{6,16}$/i.test(referralCode)) {
        getReferrerByCode(referralCode)
          .then((referrerId) => {
            if (referrerId && referrerId !== user!.id) {
              return recordReferralSignup(referrerId, user!.id);
            }
          })
          .catch(() => {});
      }
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return createAuthRedirect(origin, authMode, nextPath, "account_locked");
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      tokenVersion: user.token_version ?? 0,
      isAdmin: user.is_admin === 1,
    });
    await setAuthCookie(token);
    await logActivity(user.id, "login_google");
    await updateStreak(user.id);

    const destination = isNewUser
      ? `/onboarding${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`
      : nextPath;
    const response = NextResponse.redirect(`${origin}${destination}`);
    clearOauthFlowCookies(response);
    setCsrfCookie(response);
    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return createAuthRedirect(origin, authMode, nextPath, "oauth_failed");
  }
});

function getOauthMode(value: string | undefined): AuthPageMode {
  return value === "signup" ? "signup" : "login";
}

function clearOauthFlowCookies(response: NextResponse) {
  response.cookies.delete("oauth_state");
  response.cookies.delete("oauth_mode");
  response.cookies.delete("oauth_next");
  response.cookies.delete("oauth_ref");
}

function createAuthRedirect(
  origin: string,
  mode: AuthPageMode,
  nextPath: string,
  error: string
) {
  const redirectUrl = new URL(`${origin}${buildAuthPageHref(mode, nextPath)}`);
  redirectUrl.searchParams.set("error", error);
  const response = NextResponse.redirect(redirectUrl);
  clearOauthFlowCookies(response);
  return response;
}
