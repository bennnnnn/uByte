/**
 * PUT    /api/admin/blog/[id]  — update a blog post
 * DELETE /api/admin/blog/[id]  — delete a blog post
 */
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { updateDbBlogPost, deleteDbBlogPost } from "@/lib/db/blog-posts";

interface Props {
  params: Promise<{ id: string }>;
}

export const PUT = withErrorHandling("PUT /api/admin/blog/[id]", async (request: NextRequest, ctx?: unknown) => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const { id: idStr } = await (ctx as Props).params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

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

  const updated = await updateDbBlogPost(id, {
    ...(body.slug        !== undefined && { slug:        body.slug.trim() }),
    ...(body.title       !== undefined && { title:       body.title.trim() }),
    ...(body.description !== undefined && { description: body.description.trim() }),
    ...(body.content     !== undefined && { content:     body.content }),
    ...(body.category    !== undefined && { category:    body.category.trim() }),
    ...(body.tags        !== undefined && { tags:        body.tags }),
    ...(body.read_time   !== undefined && { read_time:   body.read_time.trim() }),
    ...(body.author      !== undefined && { author:      body.author.trim() }),
    ...(body.published   !== undefined && { published:   body.published }),
  });

  if (!updated) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json({ post: updated });
});

export const DELETE = withErrorHandling("DELETE /api/admin/blog/[id]", async (request: NextRequest, ctx?: unknown) => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const { id: idStr } = await (ctx as Props).params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const deleted = await deleteDbBlogPost(id);
  if (!deleted) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
});
