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

/** POST: sign in or sign up with a Google ID token (from One Tap or Sign in with Google button). */
export const POST = withErrorHandling("POST /api/auth/google-id-token", async (request: NextRequest) => {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  let body: { credential?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const credential = body.credential?.trim();
  if (!credential) {
    return NextResponse.json({ error: "Missing credential" }, { status: 400 });
  }

  const tokenRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Invalid or expired Google sign-in. Try again." }, { status: 401 });
  }

  let payload: { aud?: string; sub?: string; email?: string; name?: string; email_verified?: string };
  try {
    payload = (await tokenRes.json()) as { aud?: string; sub?: string; email?: string; name?: string; email_verified?: string };
  } catch {
    return NextResponse.json({ error: "Invalid Google response" }, { status: 401 });
  }

  if (payload.aud !== GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Invalid client" }, { status: 401 });
  }

  if (payload.email_verified !== "true") {
    return NextResponse.json({ error: "Google email is not verified. Please verify your Google account email first." }, { status: 400 });
  }

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name ?? email?.split("@")[0] ?? "User";

  if (!googleId || !email) {
    return NextResponse.json({ error: "Google did not provide email. Try again." }, { status: 400 });
  }

  let user = await getUserByGoogleId(googleId);
  if (!user) {
    const existing = await getUserByEmail(email);
    if (existing) {
      await linkGoogleId(existing.id, googleId);
      user = existing;
      sendGoogleLinkedEmail(user.email, user.name).catch(() => {});
    } else {
      user = await createUserWithGoogle(name, email, googleId);
    }
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

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  setCsrfCookie(res);
  return res;
});
