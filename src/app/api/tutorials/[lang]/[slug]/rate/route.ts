import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { rateTutorial, getUserTutorialRating } from "@/lib/db/tutorial-ratings";
import { tutorialRatingBodySchema } from "@/lib/api-schemas";

type RouteCtx = { params: Promise<{ lang: string; slug: string }> };

export const GET = withErrorHandling(
  "GET /api/tutorials/[lang]/[slug]/rate",
  async (_request: NextRequest, ctx: unknown) => {
    const { user, response } = await requireAuth();
    if (!user) return response;
    const { lang, slug } = await (ctx as RouteCtx).params;
    const rating = await getUserTutorialRating(String(user.userId), lang, slug);
    return NextResponse.json({ rating });
  },
);

export const POST = withErrorHandling(
  "POST /api/tutorials/[lang]/[slug]/rate",
  async (request: NextRequest, ctx: unknown) => {
    const csrfError = verifyCsrf(request);
    if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

    const { user, response } = await requireAuth();
    if (!user) return response;

    const ip = getClientIp(request.headers);
    const { limited, retryAfter } = await checkRateLimit(
      `tutorial-rate:${ip}:${user.userId}`,
      30,
      60_000,
    );
    if (limited) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const { lang, slug } = await (ctx as RouteCtx).params;
    if (!lang || !slug) {
      return NextResponse.json({ error: "lang and slug required" }, { status: 400 });
    }

    const parsed = tutorialRatingBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "rating must be 1 or -1" }, { status: 400 });
    }

    await rateTutorial(String(user.userId), lang, slug, parsed.data.rating);
    return NextResponse.json({ ok: true });
  },
);
