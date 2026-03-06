import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { recordPageView, getPageViewCount, clearPageViews } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const VISITOR_COOKIE = "visitor_id";
const FREE_PAGE_LIMIT = 20;

function getVisitorId(request: NextRequest): string | null {
  return request.cookies.get(VISITOR_COOKIE)?.value ?? null;
}

// GET — return current view count and whether the wall should show
export const GET = withErrorHandling("GET /api/views", async (request: NextRequest) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      return NextResponse.json({ viewCount: 0, limited: false });
    }

    const visitorId = getVisitorId(request);
    if (!visitorId) {
      return NextResponse.json({ viewCount: 0, limited: false });
    }

    const viewCount = await getPageViewCount(visitorId);
    return NextResponse.json({
      viewCount,
      limited: viewCount >= FREE_PAGE_LIMIT,
    });
  } catch (err) {
    console.error("GET /api/views error:", err);
    return NextResponse.json({ viewCount: 0, limited: false });
  }
});

// POST — record a page view, return updated count
export const POST = withErrorHandling("POST /api/views", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited: rateLimited } = await checkRateLimit(`views:${ip}`, 60, 60_000);
  if (rateLimited) {
    return NextResponse.json({ viewCount: 0, limited: false });
  }

  try {
    const user = await getCurrentUser();
    if (user) {
      const visitorId = getVisitorId(request);
      if (visitorId) await clearPageViews(visitorId);
      return NextResponse.json({ viewCount: 0, limited: false });
    }

    const body = await request.json();
    const slug = body?.slug;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    let visitorId = getVisitorId(request);
    let isNew = false;
    if (!visitorId) {
      visitorId = randomUUID();
      isNew = true;
    }

    await recordPageView(visitorId, slug);
    const viewCount = await getPageViewCount(visitorId);

    const res = NextResponse.json({
      viewCount,
      limited: viewCount >= FREE_PAGE_LIMIT,
    });

    if (isNew) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return res;
  } catch (err) {
    console.error("POST /api/views error:", err);
    return NextResponse.json({ viewCount: 0, limited: false });
  }
});
