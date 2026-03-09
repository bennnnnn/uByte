import { NextRequest, NextResponse } from "next/server";
import { getBookmarks, getBookmarkTotal, addBookmark, deleteBookmark } from "@/lib/db";
import { checkBadges } from "@/lib/badges";
import { withErrorHandling, requireAuth, protectedRoute } from "@/lib/api-utils";

const PAGE_SIZE = 10;

export const GET = withErrorHandling("GET /api/bookmarks", async (request: NextRequest) => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);
  // Omit language filter when lang param is absent — returns all languages (profile view).
  // Pass a specific lang when the IDE needs to check if the current problem is bookmarked.
  const langParam = searchParams.get("lang") ?? undefined;
  const [bookmarks, total] = await Promise.all([
    getBookmarks(tokenUser.userId, PAGE_SIZE, offset, langParam),
    getBookmarkTotal(tokenUser.userId, langParam),
  ]);
  return NextResponse.json({ bookmarks, total, hasMore: offset + PAGE_SIZE < total });
});

export const POST = withErrorHandling("POST /api/bookmarks",
  protectedRoute({ rateLimitKey: "bookmarks:post", rateLimitMax: 30 }, async (request, user) => {
    const body = await request.json();
    const { tutorialSlug, snippet, note, lang = "go" } = body;
    if (!tutorialSlug || typeof tutorialSlug !== "string" || !snippet || typeof snippet !== "string") {
      return NextResponse.json({ error: "tutorialSlug and snippet are required" }, { status: 400 });
    }
    const bookmark = await addBookmark(user.userId, tutorialSlug, snippet, note || "", typeof lang === "string" ? lang : "go");
    await checkBadges(user.userId);
    return NextResponse.json({ bookmark });
  })
);

export const DELETE = withErrorHandling("DELETE /api/bookmarks",
  protectedRoute({ rateLimitKey: "bookmarks:delete", rateLimitMax: 30 }, async (request, user) => {
    const body = await request.json();
    const id = body?.id;
    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteBookmark(user.userId, id);
    return NextResponse.json({ success: true });
  })
);
