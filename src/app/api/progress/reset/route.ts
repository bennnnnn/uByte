import { NextRequest, NextResponse } from "next/server";
import { resetAllProgress } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

export const DELETE = withErrorHandling("DELETE /api/progress/reset", async (request: NextRequest) => {
  const csrfError = await verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { user, response } = await requireAuth();
  if (!user) return response;

  await resetAllProgress(user.userId);

  return NextResponse.json({ ok: true });
});
