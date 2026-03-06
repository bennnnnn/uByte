import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/db";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return new TextEncoder().encode(secret || "go-tutorials-dev-secret-key-local");
}

const COOKIE_NAME = "auth_token";

export interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  tokenVersion: number;
}

/** Session duration: 30 days. Reasonable for a learning platform without requiring frequent re-login. */
const SESSION_DAYS = 30;

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DAYS}d`)
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Verify token version matches DB — invalidates all sessions on logout-all
  const user = await getUserById(payload.userId);
  if (!user) return null;
  if ((user.token_version ?? 0) !== (payload.tokenVersion ?? 0)) return null;

  return payload;
}
