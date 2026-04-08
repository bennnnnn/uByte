import { NextResponse } from "next/server";
import {
  getPopularLanguages,
  getPopularTutorials,
  getFallbackPopularLanguages,
} from "@/lib/db/home-popular";
import { withErrorHandling } from "@/lib/api-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling("GET /api/home-popular", async () => {
  const [popularLanguages, popularTutorials] = await Promise.all([
    getPopularLanguages(),
    getPopularTutorials(),
  ]);

  return NextResponse.json({
    popularLanguages:
      popularLanguages.length > 0 ? popularLanguages : getFallbackPopularLanguages(),
    popularTutorials,
  }, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
  });
});
