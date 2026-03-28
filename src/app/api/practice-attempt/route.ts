import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { savePracticeAttempt, getPracticeAttempts, addXp, updateStreak } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { PRACTICE_PROBLEMS } from "@/lib/practice/problems";
import { XP_BY_DIFFICULTY } from "@/lib/constants";

/** GET /api/practice-attempt — returns { attempts: Record<slug, "solved"|"failed"> } */
export const GET = withErrorHandling("GET /api/practice-attempt", async () => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ attempts: {} });
  const attempts = await getPracticeAttempts(user.userId);
  return NextResponse.json({ attempts });
});

/** POST /api/practice-attempt — body: { slug, status: "solved"|"failed" } — paid or free-tier problem */
export const POST = withErrorHandling("POST /api/practice-attempt", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const body = await request.json();
  const { slug, status } = body ?? {};

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  // All problems are free for signed-in users — no access check needed.
  if (status !== "solved" && status !== "failed") {
    return NextResponse.json({ error: "status must be 'solved' or 'failed'" }, { status: 400 });
  }

  const { wasFirstSolve } = await savePracticeAttempt(user.userId, slug, status);

  if (status === "solved") {
    updateStreak(user.userId).catch(() => {});
  }

  if (wasFirstSolve) {
    const problem = PRACTICE_PROBLEMS.find((p) => p.slug === slug);
    const xp = problem ? (XP_BY_DIFFICULTY[problem.difficulty] ?? 10) : 10;
    await addXp(user.userId, xp);
    return NextResponse.json({ ok: true, xpAwarded: xp });
  }

  return NextResponse.json({ ok: true, xpAwarded: 0 });
});
