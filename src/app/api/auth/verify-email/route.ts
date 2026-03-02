import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/auth/verify-email", async (request: NextRequest) => {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const user = await verifyEmail(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid or already-used token" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
});
