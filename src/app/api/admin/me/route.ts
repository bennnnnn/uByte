/**
 * GET /api/admin/me
 *
 * Returns the current admin's identity and effective permission set.
 * The client (hooks.ts) uses this to drive the sidebar rather than
 * deriving the role from the full user list (which is inaccessible to limited admins).
 *
 * Response:
 *   {
 *     id: number,
 *     name: string,
 *     email: string,
 *     isSuperAdmin: boolean,
 *     permissions: string[],   // effective list from admin_permissions or role fallback
 *   }
 */
import { NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { ALL_PERMISSIONS, DEFAULT_LIMITED_PERMISSIONS } from "@/app/admin/permission-constants";

export const GET = withErrorHandling("GET /api/admin/me", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  // Super admin: admin_role === 'super' OR admin_role === null (legacy backfill)
  const isSuperAdmin = admin.admin_role === "super" || admin.admin_role === null;

  let permissions: string[];
  if (isSuperAdmin) {
    permissions = [...ALL_PERMISSIONS];
  } else if (admin.admin_permissions) {
    try {
      const parsed = JSON.parse(admin.admin_permissions) as unknown;
      permissions = Array.isArray(parsed)
        ? (parsed as string[]).filter((p) => ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number]))
        : [...DEFAULT_LIMITED_PERMISSIONS];
    } catch {
      permissions = [...DEFAULT_LIMITED_PERMISSIONS];
    }
  } else {
    permissions = [...DEFAULT_LIMITED_PERMISSIONS];
  }

  return NextResponse.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    isSuperAdmin,
    permissions,
  });
});
