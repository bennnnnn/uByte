/**
 * Profile stats API — /api/profile/stats
 *
 * ─── PROGRESS MODEL ────────────────────────────────────────────────────────
 * A "lesson" = one individual STEP inside a tutorial chapter.
 * Go has ~20 chapters (tutorial slugs) but 101 lessons (steps).
 *
 * TWO tables, two purposes:
 *   step_progress  — one row per (user, lang, tutorial_slug, step_index)
 *                    Written every time a user passes a single step.
 *                    Source of truth for ALL progress bars and counts.
 *                    skipped=TRUE rows are NOT counted in progress.
 *
 *   progress       — one row per (user, lang, tutorial_slug)
 *                    Written only when a user finishes ALL steps in a chapter.
 *                    Used only for: green checkmarks on tutorial cards,
 *                    badges, streak/XP rewards.
 *
 * DO NOT count progress from the `progress` table for display numbers —
 * partial chapters would show as zero. Always use step_progress counts.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Response fields:
 *   completed_count  = total non-skipped steps across all languages
 *   total_tutorials  = total available steps across all languages
 *   byLanguage[]     = per-language breakdown (same lesson-based counts)
 */
import { NextResponse } from "next/server";
import { getUserById, getAchievements, getActivityCount } from "@/lib/db";
import { getCompletedStepCountByLanguage } from "@/lib/db/step-progress";
import { BADGES } from "@/lib/badges";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

// Derive icons/names from the shared registry so adding a language here is automatic.
import { LANG_ICONS } from "@/lib/languages/icons";
import { LANGUAGES } from "@/lib/languages/registry";

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

    const meta = { icon: LANG_ICONS[lang] ?? "📝", name: LANGUAGES[lang]?.name ?? lang };
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
