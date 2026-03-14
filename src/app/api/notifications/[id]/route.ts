import { NextRequest, NextResponse } from "next/server";
import { deleteNotification } from "@/lib/db";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const DELETE = withErrorHandling(
  "DELETE /api/notifications/[id]",
  async (req: NextRequest, ctx: unknown) => {
    const ip = getClientIp(req.headers);
    const { limited } = await checkRateLimit(`notif-delete:${ip}`, 60, 60_000);
    if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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
