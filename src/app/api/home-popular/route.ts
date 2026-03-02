import { NextResponse } from "next/server";
import {
  getPopularLanguages,
  getPopularTutorials,
  getPopularPracticeProblems,
  getFallbackPopularLanguages,
  getFallbackPopularPracticeProblems,
} from "@/lib/db/home-popular";
import { withErrorHandling } from "@/lib/api-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling("GET /api/home-popular", async () => {
  const [popularLanguages, popularTutorials, popularPracticeProblems] = await Promise.all([
    getPopularLanguages(),
    getPopularTutorials(),
    getPopularPracticeProblems(),
  ]);

  return NextResponse.json({
    popularLanguages:
      popularLanguages.length > 0 ? popularLanguages : getFallbackPopularLanguages(),
    popularTutorials,
    popularPracticeProblems:
      popularPracticeProblems.length > 0
        ? popularPracticeProblems
        : getFallbackPopularPracticeProblems(),
  });
});
