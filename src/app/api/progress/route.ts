import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProgress, markComplete, markIncomplete, addXp, logActivity, updateStreak, getUserById, addStreakFreeze } from "@/lib/db";
import { createNotification } from "@/lib/db/notifications";
import { checkBadges, BADGE_MAP } from "@/lib/badges";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { getAllTutorials } from "@/lib/tutorials";
import { getAllStepsForLanguage } from "@/lib/tutorial-steps";
import { resolveLanguage } from "@/lib/languages/registry";

/**
 * Returns true when the given slug corresponds to a real tutorial for the language.
 *
 * Tries MDX file scan first (getAllTutorials). If that returns empty — e.g. because
 * content/ is not accessible in this serverless invocation — falls back to the
 * TS-defined step map so legitimate saves are never silently blocked.
 */
function isKnownTutorial(slug: string, language: string): boolean {
  const mdxTutorials = getAllTutorials(language as Parameters<typeof getAllTutorials>[0]);
  if (mdxTutorials.length > 0) {
    return mdxTutorials.some((t) => t.slug === slug);
  }
  // MDX scan returned nothing — fall back to TS step definitions
  const stepsMap = getAllStepsForLanguage(language as Parameters<typeof getAllStepsForLanguage>[0]);
  return slug in stepsMap;
}

export const GET = withErrorHandling("GET /api/progress", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ progress: [] });
  }
  const lang = request.nextUrl.searchParams.get("lang") ?? "go";
  const progress = await getProgress(user.userId, lang);
  return NextResponse.json({ progress });
});

export const POST = withErrorHandling("POST /api/progress", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`progress:post:${ip}:${user.userId}`, 60, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { slug, completed, lang = "go" } = body;
  if (!slug || typeof slug !== "string" || slug.length > 200) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }
  const language = resolveLanguage(lang);

  // Validate that the slug corresponds to a real tutorial.
  // Falls back to TS step definitions when MDX files aren't accessible (serverless cold start).
  if (!isKnownTutorial(slug, language)) {
    return NextResponse.json({ error: "Unknown tutorial" }, { status: 400 });
  }

  const events: { type: string; message: string }[] = [];

  if (completed) {
    // markComplete uses ON CONFLICT DO NOTHING, so only the first insert succeeds.
    // We use the DB as the source of truth for first-completion to prevent race conditions.
    const existingBefore = await getProgress(user.userId, language);
    const alreadyComplete = existingBefore.includes(slug);

    await markComplete(user.userId, slug, language);

    if (!alreadyComplete) {
      const today = new Date().toISOString().slice(0, 10);
      const [, , dbUserBefore, streakResult] = await Promise.all([
        addXp(user.userId, 10),
        logActivity(user.userId, "complete", slug),
        getUserById(user.userId),
        updateStreak(user.userId),
      ]);
      const { streak_days, freeze_used } = streakResult;
      const isSpeedster = dbUserBefore?.created_at?.startsWith(today) ?? false;

      if (freeze_used) {
        events.push({ type: "freeze_used", message: "Streak freeze used — your streak is safe! 🛡️" });
        createNotification(user.userId, "info", "Streak Freeze Used 🛡️", "You missed a day but your streak freeze saved you! Keep going.").catch(() => {});
      }

      const newBadges = await checkBadges(user.userId, {
        streakDays: streak_days,
        justCompletedSlug: slug,
        speedster: isSpeedster,
        language,
      });
      for (const key of newBadges) {
        const badge = BADGE_MAP[key];
        if (badge) await addXp(user.userId, badge.xpReward);
      }

      if (streak_days > 0 && streak_days % 7 === 0) {
        await addStreakFreeze(user.userId);
        events.push({ type: "freeze_earned", message: `🛡️ Streak freeze earned! ${streak_days}-day streak milestone reached.` });
        createNotification(user.userId, "success", `Streak Freeze Earned! 🛡️`, `You hit a ${streak_days}-day streak — a freeze shield has been added to your account.`).catch(() => {});
      }
    }
  } else {
    await markIncomplete(user.userId, slug, language);
  }

  const progress = await getProgress(user.userId, language);
  return NextResponse.json({ progress, events });
});
