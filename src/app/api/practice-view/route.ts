import { NextRequest, NextResponse } from "next/server";
import { recordPracticeView } from "@/lib/db/home-popular";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { withErrorHandling } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth";

export const POST = withErrorHandling("POST /api/practice-view", async (request: NextRequest) => {
  const body = await request.json();
  const slug = body?.slug;
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  if (!getPracticeProblemBySlug(slug)) {
    return NextResponse.json({ error: "unknown problem" }, { status: 400 });
  }

  const user = await getCurrentUser();
  const viewerId = user ? `user:${user.userId}` : request.cookies.get("visitor_id")?.value ?? crypto.randomUUID();
  await recordPracticeView(viewerId, slug);
  return NextResponse.json({ ok: true });
});
