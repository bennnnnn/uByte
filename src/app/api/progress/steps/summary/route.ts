import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStepProgressSummaryByLanguage } from "@/lib/db/step-progress";
import { getSteps, getAllStepsForLanguage } from "@/lib/tutorial-steps";
import { getAllTutorials } from "@/lib/tutorials";
import { resolveLanguage } from "@/lib/languages/registry";
import { withErrorHandling } from "@/lib/api-utils";

/**
 * GET /api/progress/steps/summary?lang=rust
 *
 * Returns a per-tutorial step breakdown for the profile progress tab.
 * Each item shows how many steps the user completed out of the total.
 *
 * Only tutorials with at least one completed step are returned.
 * Results are sorted: fully completed first, then by completedSteps desc.
 *
 * Response: {
 *   tutorials: [
 *     { slug: string, title: string, completedSteps: number, totalSteps: number }
 *   ]
 * }
 */
export const GET = withErrorHandling("GET /api/progress/steps/summary", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ tutorials: [] });

  const lang = resolveLanguage(request.nextUrl.searchParams.get("lang"));

  const [completedMap, allTutorials] = await Promise.all([
    getStepProgressSummaryByLanguage(user.userId, lang),
    Promise.resolve(getAllTutorials(lang)),
  ]);

  // Build a slug→title map from MDX metadata; fall back to TS step keys
  const titleMap = new Map<string, string>(
    allTutorials.map((t) => [t.slug, t.title])
  );
  if (titleMap.size === 0) {
    // Serverless cold-start fallback: derive titles from TS step map keys
    const stepsMap = getAllStepsForLanguage(lang);
    for (const slug of Object.keys(stepsMap)) {
      titleMap.set(slug, slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "));
    }
  }

  // Build total-steps map using the same resolution order as getTotalLessonCount
  const totalMap = new Map<string, number>();
  for (const [slug] of completedMap) {
    const total = getSteps(lang, slug).length;
    totalMap.set(slug, total);
  }

  const tutorials = [...completedMap.entries()]
    .map(([slug, completedSteps]) => ({
      slug,
      title: titleMap.get(slug) ?? slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
      completedSteps,
      totalSteps: totalMap.get(slug) ?? 0,
    }))
    // Sort: fully completed first, then by most progress
    .sort((a, b) => {
      const aDone = a.completedSteps >= a.totalSteps && a.totalSteps > 0 ? 1 : 0;
      const bDone = b.completedSteps >= b.totalSteps && b.totalSteps > 0 ? 1 : 0;
      if (bDone !== aDone) return bDone - aDone;
      return b.completedSteps - a.completedSteps;
    });

  return NextResponse.json({ tutorials });
});
