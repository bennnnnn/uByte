import { NextRequest, NextResponse } from "next/server";
import { getNotifications, getUnreadNotificationCount, markNotificationsRead } from "@/lib/db";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";

export const GET = withErrorHandling("GET /api/notifications", async () => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(tokenUser.userId),
    getUnreadNotificationCount(tokenUser.userId),
  ]);

  return NextResponse.json({ notifications, unreadCount });
});

export const PATCH = withErrorHandling("PATCH /api/notifications", async (request: NextRequest) => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  await markNotificationsRead(tokenUser.userId);
  return NextResponse.json({ ok: true });
});
