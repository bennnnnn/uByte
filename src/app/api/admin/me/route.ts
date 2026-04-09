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
import { getEffectiveAdminPermissions } from "@/app/admin/permission-constants";
import { getAdminSlug } from "@/lib/db/admin";

export const GET = withErrorHandling("GET /api/admin/me", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const isSuperAdmin = admin.admin_role === "super" || admin.admin_role === null;
  const permissions = getEffectiveAdminPermissions(admin);

  const adminSlug = await getAdminSlug(admin.id).catch(() => null);

  return NextResponse.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    isSuperAdmin,
    permissions,
    adminSlug,
  });
});
