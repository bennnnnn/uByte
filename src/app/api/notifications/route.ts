import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications, getUnreadNotificationCount, markNotificationsRead } from "@/lib/db";

export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(tokenUser.userId),
      getUnreadNotificationCount(tokenUser.userId),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    await markNotificationsRead(tokenUser.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
