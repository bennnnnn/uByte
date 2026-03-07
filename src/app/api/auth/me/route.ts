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
    // Backfill CSRF cookie for older sessions created before CSRF rollout.
    if (!request.cookies.get("csrf_token")?.value) {
      setCsrfCookie(response);
    }
    return response;
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ user: null });
  }
});
