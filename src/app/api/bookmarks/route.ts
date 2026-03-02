import { NextRequest, NextResponse } from "next/server";
import { getBookmarks, getBookmarkTotal, addBookmark, deleteBookmark } from "@/lib/db";
import { checkBadges } from "@/lib/badges";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

const PAGE_SIZE = 10;

export const GET = withErrorHandling("GET /api/bookmarks", async (request: NextRequest) => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);
  const [bookmarks, total] = await Promise.all([
    getBookmarks(tokenUser.userId, PAGE_SIZE, offset),
    getBookmarkTotal(tokenUser.userId),
  ]);
  return NextResponse.json({ bookmarks, total, hasMore: offset + PAGE_SIZE < total });
});

export const POST = withErrorHandling("POST /api/bookmarks", async (request: NextRequest) => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`bookmarks:post:${ip}:${tokenUser.userId}`, 30, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { tutorialSlug, snippet, note } = await request.json();
  if (!tutorialSlug || typeof tutorialSlug !== "string" || !snippet || typeof snippet !== "string") {
    return NextResponse.json({ error: "tutorialSlug and snippet are required" }, { status: 400 });
  }

  const bookmark = await addBookmark(tokenUser.userId, tutorialSlug, snippet, note || "");
  await checkBadges(tokenUser.userId);

  return NextResponse.json({ bookmark });
});

export const DELETE = withErrorHandling("DELETE /api/bookmarks", async (request: NextRequest) => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`bookmarks:delete:${ip}:${tokenUser.userId}`, 30, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const id = body?.id;
  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await deleteBookmark(tokenUser.userId, id);
  return NextResponse.json({ success: true });
});
