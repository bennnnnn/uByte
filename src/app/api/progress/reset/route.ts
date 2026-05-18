import { NextResponse } from "next/server";
import { resetAllProgress } from "@/lib/db";
import { withErrorHandling, protectedRoute } from "@/lib/api-utils";

export const DELETE = withErrorHandling(
  "DELETE /api/progress/reset",
  protectedRoute(
    { rateLimitKey: "progress-reset", rateLimitMax: 5, rateLimitWindowMs: 3_600_000 },
    async (_request, user) => {
      await resetAllProgress(user.userId);
      return NextResponse.json({ ok: true });
    },
  ),
);
