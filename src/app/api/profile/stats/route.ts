/**
 * Profile stats API.
 *
 * Progress is measured in LESSONS (steps within tutorials), not tutorials (MDX files).
 * This matches the homepage display ("X lessons" on tutorial cards).
 *
 * - total_tutorials  = sum of getTotalLessonCount(lang) across all languages
 * - completed_count  = for each completed tutorial, sum its step count
 * - byLanguage[]     = per-language breakdown with the same lesson-based counts
 *
 * Lesson counts are dynamic — adding new tutorials/steps updates automatically.
 * See src/lib/tutorial-steps/index.ts for the resolution order and how to add tutorials.
 */
import { NextResponse } from "next/server";
import { getUserById, getAchievements, getActivityCount } from "@/lib/db";
import { getCompletedStepCountByLanguage } from "@/lib/db/step-progress";
import { BADGES } from "@/lib/badges";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

const LANG_META: Record<string, { icon: string; name: string }> = {
  go:         { icon: "🐹", name: "Go" },
  python:     { icon: "🐍", name: "Python" },
  javascript: { icon: "🟨", name: "JavaScript" },
  java:       { icon: "☕", name: "Java" },
  rust:       { icon: "🦀", name: "Rust" },
  cpp:        { icon: "⚙️", name: "C++" },
};

export const GET = withErrorHandling("GET /api/profile/stats", async () => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const langs = ALL_LANGUAGE_KEYS as SupportedLanguage[];

  const [user, achievements, activityCount, stepCountMap] =
    await Promise.all([
      getUserById(tokenUser.userId),
      getAchievements(tokenUser.userId),
      getActivityCount(tokenUser.userId),
      // Count individual completed steps (not whole tutorials) so partial progress counts.
      getCompletedStepCountByLanguage(tokenUser.userId),
    ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let totalLessons = 0;
  let completedLessons = 0;

  const byLanguage = langs.map((lang) => {
    const total = getTotalLessonCount(lang);
    totalLessons += total;

    const completed = stepCountMap.get(lang) ?? 0;
    completedLessons += completed;

    const meta = LANG_META[lang] ?? { icon: "📄", name: lang };
    return {
      lang,
      name: meta.name,
      icon: meta.icon,
      completed,
      total,
    };
  });

  return NextResponse.json({
    stats: {
      xp: user.xp,
      streak_days: user.streak_days,
      longest_streak: user.longest_streak,
      streak_freezes: user.streak_freezes ?? 1,
      completed_count: completedLessons,
      total_tutorials: totalLessons,
      activity_count: activityCount,
      created_at: user.created_at,
      last_active_at: user.last_active_at,
      byLanguage,
    },
    achievements,
    all_badges: BADGES,
  });
});
