import { NextResponse } from "next/server";
import { getAdminRevenueStats } from "@/lib/db";
import { requireAdmin } from "@/lib/api-utils";

export async function GET() {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const stats = await getAdminRevenueStats();
  return NextResponse.json(stats);
}
