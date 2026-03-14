/**
 * DELETE /api/discussion/[id] — soft-delete a discussion post
 *
 * Only the post's author or an admin can delete.
 */
import { NextRequest, NextResponse } from "next/server";
import { softDeletePost } from "@/lib/db/discussion";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";

export const DELETE = withErrorHandling(
  "DELETE /api/discussion/[id]",
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
