/**
 * GET  /api/admin/blog  — list all blog posts (admin only, includes unpublished)
 * POST /api/admin/blog  — create a new blog post
 */
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { getAllDbBlogPosts, createDbBlogPost } from "@/lib/db/blog-posts";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export const GET = withErrorHandling("GET /api/admin/blog", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const posts = await getAllDbBlogPosts();
  return NextResponse.json({ posts });
});

export const POST = withErrorHandling("POST /api/admin/blog", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const body = await request.json() as {
    title?: string;
    description?: string;
    content?: string;
    category?: string;
    tags?: string[];
    read_time?: string;
    author?: string;
    published?: boolean;
    slug?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = body.slug?.trim() || slugify(body.title);
  if (!slug) return NextResponse.json({ error: "Could not derive slug from title" }, { status: 400 });

  const post = await createDbBlogPost({
    slug,
    title:       body.title.trim(),
    description: body.description?.trim() ?? "",
    content:     body.content?.trim() ?? "",
    category:    body.category?.trim() ?? "General",
    tags:        body.tags ?? [],
    read_time:   body.read_time?.trim() ?? "5 min read",
    author:      body.author?.trim() ?? "uByte Team",
    published:   body.published ?? true,
  });

  return NextResponse.json({ post }, { status: 201 });
});
