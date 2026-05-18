import { NextRequest, NextResponse } from "next/server";
import { getCompletedStepIndices, markStepComplete } from "@/lib/db";
import { withErrorHandling, requireAuth, protectedRoute, parseJsonBody } from "@/lib/api-utils";
import { progressStepBodySchema } from "@/lib/api-schemas";

export const GET = withErrorHandling("GET /api/progress/steps", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const lang = request.nextUrl.searchParams.get("lang") ?? "go";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const { completed, skipped } = await getCompletedStepIndices(user.userId, slug, lang);
  return NextResponse.json({ steps: completed, skippedSteps: skipped });
});

export const POST = withErrorHandling(
  "POST /api/progress/steps",
  protectedRoute({ rateLimitKey: "progress:steps", rateLimitMax: 120 }, async (request, user) => {
    const parsed = await parseJsonBody(request, progressStepBodySchema);
    if (parsed.error) return parsed.error;
    const { slug, stepIndex, lang = "go", skipped = false } = parsed.data;
    await markStepComplete(user.userId, slug, stepIndex, lang ?? "go", skipped);
    return NextResponse.json({ ok: true });
  }),
);
