import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { rateTutorial } from "@/lib/db/tutorial-ratings";

export const POST = withErrorHandling(
  "POST /api/tutorials/[lang]/[slug]/rate",
  async (request: NextRequest, ctx: unknown) => {
    const { user, response } = await requireAuth();
    if (!user) return response;

    const { lang, slug } = await (ctx as { params: Promise<{ lang: string; slug: string }> }).params;
    if (!lang || !slug) {
      return NextResponse.json({ error: "lang and slug required" }, { status: 400 });
    }

    const body = await request.json() as { rating?: unknown };
    const rating = body.rating;
    if (rating !== 1 && rating !== -1) {
      return NextResponse.json({ error: "rating must be 1 or -1" }, { status: 400 });
    }

    await rateTutorial(user.userId, lang, slug, rating);
    return NextResponse.json({ ok: true });
  },
);
