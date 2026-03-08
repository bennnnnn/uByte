import { NextRequest, NextResponse } from "next/server";
import { resetAllProgress } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { checkRateLimit } from "@/lib/rate-limit";

export const DELETE = withErrorHandling("DELETE /api/progress/reset", async (request: NextRequest) => {
  const csrfError = await verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { user, response } = await requireAuth();
  if (!user) return response;

  const { limited, retryAfter } = await checkRateLimit(`reset:${user.userId}`, 5, 3_600_000);
  if (limited) {
    return NextResponse.json(
      { error: "Too many reset requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  await resetAllProgress(user.userId);

  return NextResponse.json({ ok: true });
});
