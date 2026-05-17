import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { incrementTokenVersion } from "@/lib/db";
import { withErrorHandling, protectedRoute } from "@/lib/api-utils";

export const POST = withErrorHandling(
  "POST /api/auth/logout-all",
  protectedRoute({ rateLimitKey: "logout-all", rateLimitMax: 5 }, async (_request, user) => {

    await incrementTokenVersion(user.userId);
    await clearAuthCookie();

    return NextResponse.json({ ok: true });
  }),
);
