/**
 * GET  /api/admin/admins  — list all admin users
 * POST /api/admin/admins  — promote, demote, or update permissions of an admin
 *
 * Only super admins can manage the admin list.
 * Uses requireSuperAdmin() which correctly treats NULL admin_role as super (legacy).
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getAdminList,
  setAdminStatus,
  setAdminRole,
  setAdminPermissions,
  logAdminAction,
} from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { withErrorHandling, requireSuperAdmin } from "@/lib/api-utils";
import { ALL_PERMISSIONS } from "@/app/admin/permission-constants";
import type { AdminRole } from "@/lib/db/admin";

export const GET = withErrorHandling("GET /api/admin/admins", async () => {
  const { admin, response } = await requireSuperAdmin();
  if (!admin) return response;

  const admins = await getAdminList();
  return NextResponse.json({ admins });
});

export const POST = withErrorHandling("POST /api/admin/admins", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireSuperAdmin();
  if (!admin) return response;

  const body = (await req.json()) as {
    action: "promote" | "demote" | "set_role" | "set_permissions";
    userId: number;
    role?: AdminRole;
    permissions?: string[];
  };

  const { action, userId, role, permissions } = body;

  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  if (userId === admin.id && (action === "demote" || action === "set_role")) {
    return NextResponse.json({ error: "Cannot modify your own admin access" }, { status: 400 });
  }

  if (action === "promote") {
    const assignedRole: AdminRole = role === "super" ? "super" : "limited";
    // Validate permissions if provided
    const validPerms = permissions?.filter((p) => ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number]));
    await setAdminStatus(userId, true, assignedRole, assignedRole === "super" ? undefined : validPerms);
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
    const validPerms = permissions?.filter((p) => ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number]));
    await setAdminRole(userId, role, role === "super" ? undefined : validPerms);
    await logAdminAction(admin.id, `set_admin_role:${role}`, userId);
    return NextResponse.json({ ok: true });
  }

  if (action === "set_permissions") {
    if (!Array.isArray(permissions)) {
      return NextResponse.json({ error: "permissions must be an array" }, { status: 400 });
    }
    const valid = permissions.filter((p) => ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number]));
    await setAdminPermissions(userId, valid);
    await logAdminAction(admin.id, "set_admin_permissions", userId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
});
