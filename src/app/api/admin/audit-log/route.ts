import { NextResponse } from "next/server";
import { withErrorHandling, requireAdminPermission } from "@/lib/api-utils";
import { getAdminAuditLog } from "@/lib/db";

export const GET = withErrorHandling("GET /api/admin/audit-log", async () => {
  const { admin, response } = await requireAdminPermission("audit");
  if (!admin) return response;

  const log = await getAdminAuditLog(100);
  return NextResponse.json({ log });
});
