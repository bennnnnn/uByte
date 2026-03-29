import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-utils";
import { updateUserCountry } from "@/lib/db/users";
import type { NextRequest } from "next/server";

// NOTE: We intentionally do NOT rotate the CSRF cookie here.
// Rotating on every /me poll creates a race condition across parallel tabs:
// one response's Set-Cookie can overwrite the token a concurrent mutation is
// still using, causing spurious 403s. CSRF is set once at login/signup.
export const GET = withErrorHandling("GET /api/auth/me", async (request: NextRequest) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Capture country from Vercel's IP geolocation header (free on all plans).
    // Fire-and-forget — never block the auth response.
    const country = request.headers.get("x-vercel-ip-country");
    if (country && /^[A-Z]{2}$/.test(country)) {
      updateUserCountry(user.userId, country).catch(() => {});
    }

    return NextResponse.json({ user: { id: user.userId, name: user.name, email: user.email } });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ user: null });
  }
});
