import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { savePracticeAttempt, getPracticeAttempts } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";

/** GET /api/practice-attempt — returns { attempts: Record<slug, "solved"|"failed"> } */
export const GET = withErrorHandling("GET /api/practice-attempt", async () => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ attempts: {} });
  const attempts = await getPracticeAttempts(user.userId);
  return NextResponse.json({ attempts });
});

/** POST /api/practice-attempt — body: { slug, status: "solved"|"failed" } */
export const POST = withErrorHandling("POST /api/practice-attempt", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { slug, status } = body ?? {};

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  if (status !== "solved" && status !== "failed") {
    return NextResponse.json({ error: "status must be 'solved' or 'failed'" }, { status: 400 });
  }

  await savePracticeAttempt(user.userId, slug, status);
  return NextResponse.json({ ok: true });
});
