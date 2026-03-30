/**
 * PATCH  /api/discussion/post/[id] — edit a discussion post (author only)
 * DELETE /api/discussion/post/[id] — soft-delete (author or admin)
 */
import { NextRequest, NextResponse } from "next/server";
import { softDeletePost, updatePost } from "@/lib/db/discussion";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";

export const PATCH = withErrorHandling(
  "PATCH /api/discussion/post/[id]",
  async (req: NextRequest, ctx: unknown) => {
    const csrfError = verifyCsrf(req);
    if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

    const { id: idStr } = await (ctx as { params: Promise<{ id: string }> }).params;
    const id = parseInt(idStr, 10);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { body?: string };
    const text = body.body?.trim() ?? "";
    if (!text) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Message too long (max 2000 chars)." }, { status: 400 });

    const updated = await updatePost(id, user.userId, text);
    if (!updated) {
      return NextResponse.json({ error: "Not found or not allowed." }, { status: 403 });
    }
    return NextResponse.json({ ok: true, body: text });
  },
);

export const DELETE = withErrorHandling(
  "DELETE /api/discussion/post/[id]",
  async (req: NextRequest, ctx: unknown) => {
    const csrfError = verifyCsrf(req);
    if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

    const { id: idStr } = await (ctx as { params: Promise<{ id: string }> }).params;
    const id = parseInt(idStr, 10);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deleted = await softDeletePost(id, user.userId, !!user.isAdmin);
    if (!deleted) {
      return NextResponse.json({ error: "Not found or not allowed." }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  },
);
