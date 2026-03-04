import { NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { getAdminExamStats } from "@/lib/db";

export const GET = withErrorHandling("GET /api/admin/exam-stats", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  const stats = await getAdminExamStats();
  return NextResponse.json(stats);
});
