import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/auth/me", async () => {
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
