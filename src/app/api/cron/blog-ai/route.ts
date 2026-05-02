/**
 * Automated AI blog posts — GET /api/cron/blog-ai
 *
 * Vercel Cron (see vercel.json): runs daily; generates several Markdown articles
 * via the same AI gateway as hints/chat (Gemini by default), inserts into blog_posts.
 *
 * Posts are generated in parallel (up to 3 at a time) to stay within Vercel function
 * timeouts. Each AI call uses a 120-second timeout.
 *
 * Security: requires Authorization: Bearer *** (same as other crons).
 *
 * Env (optional):
 *   BLOG_AI_CRON_ENABLED     — must be "1" or "true" or the handler no-ops (safe default).
 *   BLOG_AI_POSTS_PER_RUN    — posts to create this run (default 3, max 6).
 *   BLOG_AI_MAX_POSTS_PER_DAY— cap for author BLOG_AI_AUTHOR per UTC day (default 6).
 *   BLOG_AI_MODEL            — defaults to gemini-2.5-flash.
 *   BLOG_AI_AUTHOR           — defaults to "uByte AI".
 *   BLOG_AI_PUBLISHED        — set "false" or "0" to insert drafts for admin review.
 *
 * SEO note: high-volume AI publishing can trigger quality issues; monitor Search Console
 * and tone down BLOG_AI_POSTS_PER_RUN if needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { countDbBlogPostsByAuthorSince } from "@/lib/db/blog-posts";
import { getAllBlogSlugs } from "@/lib/blog";
import { pickBlogAiTopics } from "@/lib/blog/ai-topics";
import { generateAndInsertAiBlogPost } from "@/lib/blog/ai-generate";

export const maxDuration = 300;

export const GET = withErrorHandling("GET /api/cron/blog-ai", async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enabled =
    process.env.BLOG_AI_CRON_ENABLED === "1" || process.env.BLOG_AI_CRON_ENABLED?.toLowerCase() === "true";
  if (!enabled) {
    return NextResponse.json({ ok: true, skipped: true, reason: "BLOG_AI_CRON_ENABLED not set" });
  }

  const author = process.env.BLOG_AI_AUTHOR?.trim() || "uByte AI";
  const maxPerDay = Math.min(24, Math.max(1, parseInt(process.env.BLOG_AI_MAX_POSTS_PER_DAY || "6", 10) || 6));
  const wantPerRun = Math.min(6, Math.max(1, parseInt(process.env.BLOG_AI_POSTS_PER_RUN || "3", 10) || 3));

  const startUtc = new Date();
  startUtc.setUTCHours(0, 0, 0, 0);
  const alreadyToday = await countDbBlogPostsByAuthorSince(author, startUtc.toISOString());
  const remainingToday = maxPerDay - alreadyToday;
  if (remainingToday <= 0) {
    console.log(`[cron/blog-ai] Daily cap reached for ${author} (${alreadyToday}/${maxPerDay})`);
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "daily_cap",
      alreadyToday,
      maxPerDay,
    });
  }

  const n = Math.min(wantPerRun, remainingToday);
  const topics = pickBlogAiTopics(n);
  const takenSlugs = await getAllBlogSlugs();

  // Run generations in parallel (all at once) to complete before Vercel timeout
  const results: { slug?: string; title?: string; error?: string; topic?: string }[] = await Promise.all(
    topics.map((topic) =>
      generateAndInsertAiBlogPost(topic, takenSlugs).then((r) => {
        if (r.ok) {
          console.log(`[cron/blog-ai] created slug=${r.slug} title=${r.title.slice(0, 60)}…`);
          return { slug: r.slug, title: r.title };
        } else {
          console.warn(`[cron/blog-ai] failed: ${r.error} topic=${topic.slice(0, 40)}…`);
          return { error: r.error, topic };
        }
      })
    )
  );

  const created = results.filter((x) => x.slug);
  const failed = results.filter((x) => x.error);

  return NextResponse.json({
    ok: true,
    author,
    requested: n,
    created: created.length,
    failed: failed.length,
    results,
  });
});
