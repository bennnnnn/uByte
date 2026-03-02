import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { saveChallengeRun, getTopChallengeRuns, getUserBestTime } from "@/lib/db";

export const GET = withErrorHandling("GET /api/challenge", async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const topRuns = await getTopChallengeRuns(slug, 10);

  // Check if the current user has a best time
  let personalBest: number | null = null;
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const tokenUser = await getCurrentUser();
    if (tokenUser) {
      personalBest = await getUserBestTime(tokenUser.userId, slug);
    }
  } catch { /* ignore */ }

  return NextResponse.json({ topRuns, personalBest });
});

export const POST = withErrorHandling("POST /api/challenge", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const { slug, totalMs, stepsCount } = await request.json();
  if (!slug || typeof totalMs !== "number" || typeof stepsCount !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (totalMs <= 0 || totalMs > 3_600_000) {
    return NextResponse.json({ error: "Invalid time" }, { status: 400 });
  }

  await saveChallengeRun(user.userId, slug, totalMs, stepsCount);

  const personalBest = await getUserBestTime(user.userId, slug);
  return NextResponse.json({ ok: true, personalBest });
});
