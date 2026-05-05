/**
 * POST /api/admin/blog/ai-generate — admins with the "blog" permission: generate 1–3 AI posts into DB.
 *
 * Use this to verify AI + DB without waiting for Vercel Cron. Scheduled auto-posts still require
 * BLOG_AI_CRON_ENABLED=1 on the cron handler (see /api/cron/blog-ai).
 */
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdminPermission } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { getAllBlogSlugs } from "@/lib/blog";
import { pickBlogAiTopics } from "@/lib/blog/ai-topics";
import { generateAndInsertAiBlogPost } from "@/lib/blog/ai-generate";

export const maxDuration = 300;

export const POST = withErrorHandling("POST /api/admin/blog/ai-generate", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdminPermission("blog");
  if (!admin) return response;

  let body: { count?: number; published?: boolean };
  try {
    body = (await request.json()) as { count?: number; published?: boolean };
  } catch {
    body = {};
  }

  const count = Math.min(3, Math.max(1, parseInt(String(body.count ?? 1), 10) || 1));
  const published = body.published === true;

  const takenSlugs = await getAllBlogSlugs();
  const topics = pickBlogAiTopics(count);
  const results: { slug?: string; title?: string; error?: string; topic?: string }[] = [];

  for (const topic of topics) {
    const r = await generateAndInsertAiBlogPost(topic, takenSlugs, { published });
    if (r.ok) {
      results.push({ slug: r.slug, title: r.title });
    } else {
      results.push({ error: r.error, topic });
    }
  }

  const created = results.filter((x) => x.slug);
  const failed = results.filter((x) => x.error);

  return NextResponse.json({
    ok: failed.length === 0,
    requested: count,
    created: created.length,
    failed: failed.length,
    results,
    published,
  });
});
