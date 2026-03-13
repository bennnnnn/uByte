import { NextResponse } from "next/server";
import { deleteNotification } from "@/lib/db";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

export const DELETE = withErrorHandling(
  "DELETE /api/notifications/[id]",
  async (_req, ctx: unknown) => {
    const { user: tokenUser, response } = await requireAuth();
    if (!tokenUser) return response;

    const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
    const notifId = parseInt(id, 10);
    if (!notifId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const deleted = await deleteNotification(tokenUser.userId, notifId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  },
);
