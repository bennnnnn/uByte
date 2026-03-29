import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-utils";
import type { NextRequest } from "next/server";

// NOTE: We intentionally do NOT rotate the CSRF cookie here.
// Rotating on every /me poll creates a race condition across parallel tabs:
// one response's Set-Cookie can overwrite the token a concurrent mutation is
// still using, causing spurious 403s. CSRF is set once at login/signup.
export const GET = withErrorHandling("GET /api/auth/me", async (_request: NextRequest) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: { id: user.userId, name: user.name, email: user.email } });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ user: null });
  }
});
