import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserById,
  getAdminUsers,
  adminResetUserProgress,
  adminDeleteUser,
  adminBanUser,
  adminUnbanUser,
  setAdminStatus,
  getAdminTutorialAnalytics,
} from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";

async function requireAdmin() {
  const token = await getCurrentUser();
  if (!token) return null;
  const user = await getUserById(token.userId);
  if (!user || !user.is_admin) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    if (searchParams.get("view") === "analytics") {
      const analytics = await getAdminTutorialAnalytics();
      return NextResponse.json({ analytics });
    }

    const users = await getAdminUsers();
    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = await verifyCsrf(request);
    if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { action, userId } = await request.json() as { action: string; userId: number };

    // Prevent acting on self for destructive actions
    if (userId === admin.id && ["delete_user", "remove_admin"].includes(action)) {
      return NextResponse.json({ error: "Cannot perform this action on yourself" }, { status: 400 });
    }

    if (action === "reset_progress") {
      await adminResetUserProgress(userId);
      return NextResponse.json({ ok: true });
    }
    if (action === "delete_user") {
      await adminDeleteUser(userId);
      return NextResponse.json({ ok: true });
    }
    if (action === "ban_user") {
      await adminBanUser(userId);
      return NextResponse.json({ ok: true });
    }
    if (action === "unban_user") {
      await adminUnbanUser(userId);
      return NextResponse.json({ ok: true });
    }
    if (action === "set_admin") {
      await setAdminStatus(userId, true);
      return NextResponse.json({ ok: true });
    }
    if (action === "remove_admin") {
      await setAdminStatus(userId, false);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
