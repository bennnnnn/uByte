import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, type TokenPayload } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import type { User } from "@/lib/db";

function getRequestId(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

type Handler = (request: NextRequest, context?: unknown) => Promise<NextResponse>;

export function withErrorHandling(routeName: string, handler: Handler): Handler {
  return async (request: NextRequest, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (err) {
      const requestId = getRequestId();
      console.error(`[${requestId}] ${routeName} error:`, err);
      return NextResponse.json(
        { error: "Internal server error", requestId },
        { status: 500 }
      );
    }
  };
}

export async function requireAuth(): Promise<
  { user: TokenPayload; response: null } | { user: null; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  return { user, response: null };
}

export async function requireAdmin(): Promise<
  { admin: User; response: null } | { admin: null; response: NextResponse }
> {
  const tokenUser = await getCurrentUser();
  if (!tokenUser) {
    return { admin: null, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  const user = await getUserById(tokenUser.userId);
  if (!user || !user.is_admin) {
    return { admin: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { admin: user, response: null };
}
