import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-utils";

export const POST = withErrorHandling("POST /api/auth/logout", async () => {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
});
