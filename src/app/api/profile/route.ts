import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import { User, getUserById, updateUserProfile, updateUserPassword, deleteUser, incrementTokenVersion } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { isValidPassword, PASSWORD_POLICY_MESSAGE, MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

const VALID_AVATARS = ["gopher", "cool", "ninja", "party", "robot", "wizard", "astro", "pirate"];
const VALID_THEMES = ["light", "dark", "system"];

function buildProfile(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    theme: user.theme,
    xp: user.xp,
    streak_days: user.streak_days,
    longest_streak: user.longest_streak,
    created_at: user.created_at,
    last_active_at: user.last_active_at,
    is_google: !!user.google_id,
    is_admin: user.is_admin,
    email_verified: user.email_verified,
    plan: user.plan ?? "free",
    subscription_expires_at: user.subscription_expires_at ?? null,
    email_marketing: user.email_marketing !== 0,
  };
}

// GET — return full profile
export const GET = withErrorHandling("GET /api/profile", async () => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const user = await getUserById(tokenUser.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ profile: buildProfile(user) });
});

// PUT — update profile fields OR change password
export const PUT = withErrorHandling("PUT /api/profile", async (request: NextRequest) => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`profile:put:${ip}:${tokenUser.userId}`, 10, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();

  // Password change
  if (body.currentPassword && body.newPassword) {
    const user = await getUserById(tokenUser.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.google_id) {
      return NextResponse.json(
        { error: "Google accounts don't use a password. Manage your password through Google." },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(body.currentPassword, user.password_hash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    if (typeof body.newPassword !== "string" || body.newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 });
    }
    if (!isValidPassword(body.newPassword)) {
      return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 });
    }

    const hash = await bcrypt.hash(body.newPassword, 10);
    await updateUserPassword(tokenUser.userId, hash);

    // Invalidate all existing sessions, then re-sign for the current session
    const newVersion = await incrementTokenVersion(tokenUser.userId);
    const newToken = await signToken({
      userId: tokenUser.userId,
      email: tokenUser.email,
      name: tokenUser.name,
      tokenVersion: newVersion,
    });
    await setAuthCookie(newToken);
    return NextResponse.json({ success: true });
  }

  // Email marketing preference toggle (standalone — doesn't require other fields)
  if (typeof body.email_marketing === "boolean") {
    const { setEmailMarketingPreference } = await import("@/lib/db/users");
    await setEmailMarketingPreference(tokenUser.userId, body.email_marketing);
    return NextResponse.json({ success: true });
  }

  // Profile update
  const updates: { name?: string; bio?: string; avatar?: string; theme?: string } = {};
  if (body.name && typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.bio === "string") updates.bio = body.bio.slice(0, 200);
  if (body.avatar && VALID_AVATARS.includes(body.avatar)) updates.avatar = body.avatar;
  if (body.theme && VALID_THEMES.includes(body.theme)) updates.theme = body.theme;

  await updateUserProfile(tokenUser.userId, updates);

  // Re-sign token if name changed (preserve tokenVersion)
  if (updates.name) {
    const token = await signToken({
      userId: tokenUser.userId,
      email: tokenUser.email,
      name: updates.name,
      tokenVersion: tokenUser.tokenVersion ?? 0,
    });
    await setAuthCookie(token);
  }

  const user = await getUserById(tokenUser.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ profile: buildProfile(user) });
});

// DELETE — delete account
export const DELETE = withErrorHandling("DELETE /api/profile", async (request: NextRequest) => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  await deleteUser(tokenUser.userId);
  await clearAuthCookie();
  return NextResponse.json({ success: true });
});
