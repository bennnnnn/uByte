import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { incrementTokenVersion } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

export const POST = withErrorHandling("POST /api/auth/logout-all", async (request: NextRequest) => {
  const csrfError = await verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { user, response } = await requireAuth();
  if (!user) return response;

  await incrementTokenVersion(user.userId);
  await clearAuthCookie();

  return NextResponse.json({ ok: true });
});
