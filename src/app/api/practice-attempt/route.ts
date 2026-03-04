import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { savePracticeAttempt, getPracticeAttempts, addXp, getUserById } from "@/lib/db";
import { hasPaidAccess, isPracticeProblemFree } from "@/lib/plans";
import { withErrorHandling } from "@/lib/api-utils";
import { PRACTICE_PROBLEMS } from "@/lib/practice/problems";

/** XP awarded per difficulty on first solve. */
const XP_BY_DIFFICULTY: Record<string, number> = {
  easy: 10,
  medium: 20,
  hard: 40,
};

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

  const body = await request.json();
  const { slug, status } = body ?? {};

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const profile = await getUserById(user.userId);
  if (!hasPaidAccess(profile?.plan) && !isPracticeProblemFree(slug)) {
    return NextResponse.json({ error: "Upgrade to Pro to save practice progress" }, { status: 403 });
  }

  if (status !== "solved" && status !== "failed") {
    return NextResponse.json({ error: "status must be 'solved' or 'failed'" }, { status: 400 });
  }

  const { wasFirstSolve } = await savePracticeAttempt(user.userId, slug, status);

  if (wasFirstSolve) {
    const problem = PRACTICE_PROBLEMS.find((p) => p.slug === slug);
    const xp = problem ? (XP_BY_DIFFICULTY[problem.difficulty] ?? 10) : 10;
    await addXp(user.userId, xp);
    return NextResponse.json({ ok: true, xpAwarded: xp });
  }

  return NextResponse.json({ ok: true, xpAwarded: 0 });
});
