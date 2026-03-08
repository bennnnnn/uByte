import { NextResponse } from "next/server";
import { getNotifications, getUnreadNotificationCount, markNotificationsRead } from "@/lib/db";
import { withErrorHandling, requireAuth, protectedRoute } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/notifications", async () => {
  const { user: tokenUser, response } = await requireAuth();
  if (!tokenUser) return response;

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(tokenUser.userId),
    getUnreadNotificationCount(tokenUser.userId),
  ]);

  return NextResponse.json({ notifications, unreadCount });
});

export const PATCH = withErrorHandling("PATCH /api/notifications",
  protectedRoute({}, async (_request, user) => {
    await markNotificationsRead(user.userId);
    return NextResponse.json({ ok: true });
  })
);
