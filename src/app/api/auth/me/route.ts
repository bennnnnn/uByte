import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-utils";
import { setCsrfCookie } from "@/lib/csrf";
import type { NextRequest } from "next/server";

export const GET = withErrorHandling("GET /api/auth/me", async (request: NextRequest) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    const response = NextResponse.json({ user: { id: user.userId, name: user.name, email: user.email } });
    // Always refresh the CSRF cookie so it stays in sync with the auth session.
    setCsrfCookie(response);
    return response;
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ user: null });
  }
});
