import { NextResponse } from "next/server";
import { getUserById, getProgressCount, getAchievements, getActivityCount } from "@/lib/db";
import { BADGES } from "@/lib/badges";
import { getAllTutorials } from "@/lib/tutorials";
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

  const [user, totalCompleted, achievements, activityCount, ...perLangCounts] =
    await Promise.all([
      getUserById(tokenUser.userId),
      getProgressCount(tokenUser.userId),
      getAchievements(tokenUser.userId),
      getActivityCount(tokenUser.userId),
      ...langs.map((lang) => getProgressCount(tokenUser.userId, lang)),
    ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let totalTutorials = 0;
  const byLanguage = langs.map((lang, i) => {
    const total = getAllTutorials(lang).length;
    totalTutorials += total;
    const meta = LANG_META[lang] ?? { icon: "📄", name: lang };
    return {
      lang,
      name: meta.name,
      icon: meta.icon,
      completed: perLangCounts[i],
      total,
    };
  });

  return NextResponse.json({
    stats: {
      xp: user.xp,
      streak_days: user.streak_days,
      longest_streak: user.longest_streak,
      streak_freezes: (user as unknown as { streak_freezes?: number }).streak_freezes ?? 1,
      completed_count: totalCompleted,
      total_tutorials: totalTutorials,
      activity_count: activityCount,
      created_at: user.created_at,
      last_active_at: user.last_active_at,
      byLanguage,
    },
    achievements,
    all_badges: BADGES,
  });
});
