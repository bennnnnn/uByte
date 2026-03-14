/**
 * GET  /api/admin/admins — list all admin users
 * POST /api/admin/admins — promote, demote, or change role of an admin
 *
 * Only super admins can manage the admin list.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getAdminList,
  setAdminStatus,
  setAdminRole,
  logAdminAction,
} from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import type { AdminRole } from "@/lib/db/admin";

export const GET = withErrorHandling("GET /api/admin/admins", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  // Only super admins can view the admin management page
  if (admin.admin_role !== "super") {
    return NextResponse.json({ error: "Forbidden — requires super admin" }, { status: 403 });
  }

  const admins = await getAdminList();
  return NextResponse.json({ admins });
});

export const POST = withErrorHandling("POST /api/admin/admins", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  // Only super admins can manage admins
  if (admin.admin_role !== "super") {
    return NextResponse.json({ error: "Forbidden — requires super admin" }, { status: 403 });
  }

  const body = (await req.json()) as {
    action: "promote" | "demote" | "set_role";
    userId: number;
    role?: AdminRole;
  };

  const { action, userId, role } = body;

  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  if (userId === admin.id && action === "demote") {
    return NextResponse.json({ error: "Cannot remove your own admin access" }, { status: 400 });
  }

  if (action === "promote") {
    const assignedRole: AdminRole = role === "super" ? "super" : "limited";
    await setAdminStatus(userId, true, assignedRole);
    await logAdminAction(admin.id, `promote_admin:${assignedRole}`, userId);
    return NextResponse.json({ ok: true });
  }

  if (action === "demote") {
    await setAdminStatus(userId, false);
    await logAdminAction(admin.id, "demote_admin", userId);
    return NextResponse.json({ ok: true });
  }

  if (action === "set_role") {
    if (role !== "super" && role !== "limited") {
      return NextResponse.json({ error: "role must be 'super' or 'limited'" }, { status: 400 });
    }
    await setAdminRole(userId, role);
    await logAdminAction(admin.id, `set_admin_role:${role}`, userId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
});
