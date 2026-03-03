import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { withErrorHandling } from "@/lib/api-utils";

export const POST = withErrorHandling("POST /api/auth/logout", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }
  await clearAuthCookie();
  return NextResponse.json({ success: true });
});
