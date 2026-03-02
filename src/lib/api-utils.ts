import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, type TokenPayload } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import type { User } from "@/lib/db";

type Handler = (request: NextRequest, context?: unknown) => Promise<NextResponse>;

export function withErrorHandling(routeName: string, handler: Handler): Handler {
  return async (request: NextRequest, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (err) {
      console.error(`${routeName} error:`, err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
