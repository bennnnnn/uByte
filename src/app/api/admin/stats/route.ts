import { NextRequest, NextResponse } from "next/server";
import {
  getAdminRevenueStats,
  getAdminRecentSubscriptionEvents,
  getAdminRevenueByPeriod,
  getAdminGrowthSnapshot,
} from "@/lib/db";
import type { RevenuePeriod } from "@/lib/db";
import { withErrorHandling, requireAdminPermission } from "@/lib/api-utils";

const PERIODS: RevenuePeriod[] = ["7days", "month", "year"];

export const GET = withErrorHandling("GET /api/admin/stats", async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "growth") {
    const { admin, response } = await requireAdminPermission("growth");
    if (!admin) return response;
    const snapshot = await getAdminGrowthSnapshot();
    return NextResponse.json(snapshot);
  }

  const { admin, response } = await requireAdminPermission("revenue");
  if (!admin) return response;

  if (view === "subscription-events") {
    const events = await getAdminRecentSubscriptionEvents(50);
    return NextResponse.json({ events });
  }

  const stats = await getAdminRevenueStats();
  const period = searchParams.get("period") as RevenuePeriod | null;
  if (period && PERIODS.includes(period)) {
    stats.revenueByPeriod = await getAdminRevenueByPeriod(period);
  }
  return NextResponse.json(stats);
});
