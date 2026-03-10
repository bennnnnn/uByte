import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllProgressByUser } from "@/lib/db/progress";
import { getCompletedStepCountByLanguage } from "@/lib/db/step-progress";
import { withErrorHandling } from "@/lib/api-utils";

/**
 * GET /api/progress/all
 *
 * Returns two things in one round-trip:
 *   progress     — completed tutorial slugs per language (for checkmarks / "tutorial done" UI)
 *   stepCounts   — individual non-skipped step completions per language (for progress bars)
 *
 * Response: {
 *   progress:   { go: string[], rust: string[], ... },
 *   stepCounts: { go: number,   rust: number,   ... }
 * }
 */
export const GET = withErrorHandling("GET /api/progress/all", async () => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ progress: {}, stepCounts: {} });
  }

  const [byLang, stepCountMap] = await Promise.all([
    getAllProgressByUser(user.userId),
    getCompletedStepCountByLanguage(user.userId),
  ]);

  const progress: Record<string, string[]> = {};
  for (const [lang, slugs] of byLang) {
    progress[lang] = slugs;
  }

  const stepCounts: Record<string, number> = {};
  for (const [lang, cnt] of stepCountMap) {
    stepCounts[lang] = cnt;
  }

  return NextResponse.json({ progress, stepCounts });
});
