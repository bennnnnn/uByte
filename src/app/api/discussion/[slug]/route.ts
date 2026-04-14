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
  getThreadParticipants,
} from "@/lib/db/discussion";
import { createNotification } from "@/lib/db/notifications";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { tutorialUrl } from "@/lib/urls";

function getDiscussionLink(slug: string): string | null {
  if (!slug.startsWith("tutorial:")) return null;

  const [, lang, tutorialSlug, rawStep] = slug.split(":");
  if (!lang || !tutorialSlug) return null;

  if (rawStep == null) return tutorialUrl(lang, tutorialSlug);

  const step = Number.parseInt(rawStep, 10);
  return Number.isFinite(step) ? tutorialUrl(lang, tutorialSlug, step) : tutorialUrl(lang, tutorialSlug);
}

function getDiscussionTitle(slug: string): string {
  if (slug.startsWith("tutorial:")) {
    const [, lang, tutorialSlug, rawStep] = slug.split(":");
    if (lang && tutorialSlug) {
      const base = `${tutorialSlug.replace(/-/g, " ")} (${lang})`;
      const step = Number.parseInt(rawStep ?? "", 10);
      return Number.isFinite(step) ? `${base} · step ${step + 1}` : base;
    }
  }

  return getPracticeProblemBySlug(slug)?.title ?? slug;
}

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
    const csrfError = verifyCsrf(req);
    if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

    const { slug } = await (ctx as { params: Promise<{ slug: string }> }).params;

    // Auth required
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to ask a question." }, { status: 401 });
    }

    // Rate limit: 10 posts per minute per user
    const ip = getClientIp(req.headers);
    const { limited } = await checkRateLimit(`discuss:${user.userId}:${ip}`, 10, 60_000);
    if (limited) {
      return NextResponse.json({ error: "Slow down — too many posts." }, { status: 429 });
    }

    const body = await req.json() as { body?: string; parentId?: number; replyToPostId?: number | null };
    const text = body.body?.trim() ?? "";
    if (!text) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Message too long (max 2000 chars)." }, { status: 400 });

    const parentId = typeof body.parentId === "number" ? body.parentId : null;
    const replyToPostId = typeof body.replyToPostId === "number" ? body.replyToPostId : null;
    const pageUrl = getDiscussionLink(slug);

    const post = await createPost(user.userId, slug, text, parentId);

    // ── Notifications ────────────────────────────────────────────────
    const problemTitle = getDiscussionTitle(slug);
    const preview = text.length > 120 ? text.slice(0, 120) + "…" : text;
    const authorName = user.name || "Someone";
    // Track who already got a notification so we don't double-notify
    const alreadyNotified = new Set<number>();

    // 1. Reply notification — derive the target from trusted post records instead of
    //    accepting a raw user id from the client.
    let replyTargetUserId: number | null = null;
    if (replyToPostId) {
      const replyTargetPost = await getPostById(replyToPostId);
      const isValidReplyTarget =
        replyTargetPost?.slug === slug &&
        replyTargetPost.user_id != null &&
        (replyTargetPost.id === parentId || replyTargetPost.parent_id === parentId);
      if (isValidReplyTarget && replyTargetPost.user_id !== user.userId) {
        replyTargetUserId = replyTargetPost.user_id;
      }
    }

    if (replyTargetUserId != null) {
      await createNotification(
        replyTargetUserId,
        "reply",
        `${authorName} replied to your comment`,
        `On "${problemTitle}": "${preview}"`,
        pageUrl,
      );
      alreadyNotified.add(replyTargetUserId);
    } else if (parentId) {
      // Fallback: notify the root post author for direct replies.
      const parent = await getPostById(parentId);
      if (parent?.slug === slug && parent.user_id && parent.user_id !== user.userId) {
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
      await Promise.all(
        mentioned
          .filter((m) => m.id !== user.userId && !alreadyNotified.has(m.id))
          .map((m) => {
            alreadyNotified.add(m.id);
            return createNotification(
              m.id,
              "mention",
              `${authorName} mentioned you`,
              `On "${problemTitle}": "${preview}"`,
              pageUrl,
            );
          })
      );
    }

    // 3. Thread participant notifications — anyone else who posted/replied in the same thread
    if (parentId) {
      const participants = await getThreadParticipants(parentId, user.userId);
      await Promise.all(
        participants
          .filter((p) => !alreadyNotified.has(p.id))
          .map((p) => {
            alreadyNotified.add(p.id);
            return createNotification(
              p.id,
              "reply",
              `${authorName} also replied in a thread you're in`,
              `On "${problemTitle}": "${preview}"`,
              pageUrl,
            );
          })
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  },
);
