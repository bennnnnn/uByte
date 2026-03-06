import { NextRequest, NextResponse } from "next/server";
import { recordPracticeView } from "@/lib/db/home-popular";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { withErrorHandling } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const POST = withErrorHandling("POST /api/practice-view", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`practice-view:${ip}`, 60, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

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
