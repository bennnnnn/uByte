/**
 * GET  /api/discussion/[slug]              — list top-level posts + optional replies
 * POST /api/discussion/[slug]              — create post or reply
 *
 * Query params for GET:
 *   ?parent=[id]   — return replies for a specific post instead of top-level posts
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getPostsForSlug,
  getReplies,
  createPost,
  getPostById,
  findUsersByNames,
} from "@/lib/db/discussion";
import { createNotification } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";

export const GET = withErrorHandling(
  "GET /api/discussion/[slug]",
  async (req: NextRequest, ctx: unknown) => {
    const { slug } = await (ctx as { params: Promise<{ slug: string }> }).params;
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parent");

    if (parentId) {
      const id = parseInt(parentId, 10);
      if (!id) return NextResponse.json({ replies: [] });
      const replies = await getReplies(id);
      return NextResponse.json({ replies });
    }

    const posts = await getPostsForSlug(slug);
    return NextResponse.json({ posts });
  },
);

export const POST = withErrorHandling(
  "POST /api/discussion/[slug]",
  async (req: NextRequest, ctx: unknown) => {
    const { slug } = await (ctx as { params: Promise<{ slug: string }> }).params;

    // Auth required
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to join the discussion." }, { status: 401 });
    }

    // Rate limit: 10 posts per minute per user
    const ip = getClientIp(req.headers);
    const { limited } = await checkRateLimit(`discuss:${user.userId}:${ip}`, 10, 60_000);
    if (limited) {
      return NextResponse.json({ error: "Slow down — too many posts." }, { status: 429 });
    }

    const body = await req.json() as { body?: string; parentId?: number; pageUrl?: string };
    const text = body.body?.trim() ?? "";
    if (!text) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Message too long (max 2000 chars)." }, { status: 400 });

    const parentId = typeof body.parentId === "number" ? body.parentId : null;
    const pageUrl  = typeof body.pageUrl === "string" ? body.pageUrl : null;

    const post = await createPost(user.userId, slug, text, parentId);

    // ── Notifications ────────────────────────────────────────────────
    const problem = getPracticeProblemBySlug(slug);
    const problemTitle = problem?.title ?? slug;
    const preview = text.length > 120 ? text.slice(0, 120) + "…" : text;
    const authorName = user.name || "Someone";
    // Track who already got a reply notification so we don't double-notify via @mention
    const alreadyNotified = new Set<number>();

    // 1. Reply notification — tell the parent post's author
    if (parentId) {
      const parent = await getPostById(parentId);
      if (parent?.user_id && parent.user_id !== user.userId) {
        await createNotification(
          parent.user_id,
          "reply",
          `${authorName} replied to your comment`,
          `On "${problemTitle}": "${preview}"`,
          pageUrl,
        );
        alreadyNotified.add(parent.user_id);
      }
    }

    // 2. @mention notifications — skip anyone who already got a reply notification
    const mentionTokens = [...text.matchAll(/@([\w.-]+)/g)].map((m) => m[1]);
    if (mentionTokens.length > 0) {
      const mentioned = await findUsersByNames(mentionTokens);
      for (const m of mentioned) {
        if (m.id === user.userId) continue; // don't self-notify
        if (alreadyNotified.has(m.id)) continue; // already notified via reply
        await createNotification(
          m.id,
          "mention",
          `${authorName} mentioned you`,
          `On "${problemTitle}": "${preview}"`,
          pageUrl,
        );
      }
    }

    return NextResponse.json({ post }, { status: 201 });
  },
);
