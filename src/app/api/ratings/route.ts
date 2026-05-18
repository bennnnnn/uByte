import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rateTutorial, getTutorialRating } from "@/lib/db";
import { withErrorHandling, protectedRoute, parseJsonBody } from "@/lib/api-utils";
import { ratingsBodySchema } from "@/lib/api-schemas";

export const GET = withErrorHandling("GET /api/ratings", async (request: NextRequest) => {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  const lang = request.nextUrl.searchParams.get("lang") ?? "go";
  const user = await getCurrentUser();
  const rating = await getTutorialRating(slug, user?.userId, lang);
  return NextResponse.json(rating);
});

export const POST = withErrorHandling(
  "POST /api/ratings",
  protectedRoute({ rateLimitKey: "ratings", rateLimitMax: 30 }, async (request, user) => {
    const parsed = await parseJsonBody(request, ratingsBodySchema);
    if (parsed.error) return parsed.error;
    const { slug, value, lang = "go" } = parsed.data;
    await rateTutorial(user.userId, slug, value, lang ?? "go");
    const rating = await getTutorialRating(slug, user.userId, lang ?? "go");
    return NextResponse.json(rating);
  }),
);
