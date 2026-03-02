import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rateTutorial, getTutorialRating } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

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

export const POST = withErrorHandling("POST /api/ratings", async (request: NextRequest) => {
  const csrfError = await verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { user, response } = await requireAuth();
  if (!user) return response;

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`ratings:${ip}:${user.userId}`, 30, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = (await request.json()) as { slug?: string; value?: number; lang?: string };
  if (!body.slug || (body.value !== 1 && body.value !== -1)) {
    return NextResponse.json({ error: "slug and value (1 or -1) are required" }, { status: 400 });
  }
  const lang = body.lang ?? "go";
  await rateTutorial(user.userId, body.slug, body.value as 1 | -1, lang);
  const rating = await getTutorialRating(body.slug, user.userId, lang);
  return NextResponse.json(rating);
});
