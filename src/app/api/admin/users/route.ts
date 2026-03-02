import { NextRequest, NextResponse } from "next/server";
import {
  getAdminUsers,
  adminResetUserProgress,
  adminDeleteUser,
  adminBanUser,
  adminUnbanUser,
  setAdminStatus,
  getAdminTutorialAnalytics,
  logAdminAction,
} from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/admin/users", async (request: NextRequest) => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const { searchParams } = new URL(request.url);
  if (searchParams.get("view") === "analytics") {
    const analytics = await getAdminTutorialAnalytics();
    return NextResponse.json({ analytics });
  }

  const users = await getAdminUsers();
  return NextResponse.json({ users });
});

export const POST = withErrorHandling("POST /api/admin/users", async (request: NextRequest) => {
  const csrfError = await verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const { action, userId } = await request.json() as { action: string; userId: number };

  // Prevent acting on self for destructive actions
  if (userId === admin.id && ["delete_user", "remove_admin"].includes(action)) {
    return NextResponse.json({ error: "Cannot perform this action on yourself" }, { status: 400 });
  }

  if (action === "reset_progress") {
    await adminResetUserProgress(userId);
    await logAdminAction(admin.id, "reset_progress", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "delete_user") {
    await adminDeleteUser(userId);
    await logAdminAction(admin.id, "delete_user", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "ban_user") {
    await adminBanUser(userId);
    await logAdminAction(admin.id, "ban_user", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "unban_user") {
    await adminUnbanUser(userId);
    await logAdminAction(admin.id, "unban_user", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "set_admin") {
    await setAdminStatus(userId, true);
    await logAdminAction(admin.id, "set_admin", userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "remove_admin") {
    await setAdminStatus(userId, false);
    await logAdminAction(admin.id, "remove_admin", userId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
});
