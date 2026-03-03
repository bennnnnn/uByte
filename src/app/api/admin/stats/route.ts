import { NextRequest, NextResponse } from "next/server";
import { getAdminRevenueStats, getAdminRecentSubscriptionEvents, getAdminRevenueByPeriod } from "@/lib/db";
import type { RevenuePeriod } from "@/lib/db";
import { requireAdmin } from "@/lib/api-utils";

const PERIODS: RevenuePeriod[] = ["7days", "month", "year"];

export async function GET(request: NextRequest) {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const { searchParams } = new URL(request.url);
  if (searchParams.get("view") === "subscription-events") {
    const events = await getAdminRecentSubscriptionEvents(50);
    return NextResponse.json({ events });
  }

  const stats = await getAdminRevenueStats();
  const period = searchParams.get("period") as RevenuePeriod | null;
  if (period && PERIODS.includes(period)) {
    stats.revenueByPeriod = await getAdminRevenueByPeriod(period);
  }
  return NextResponse.json(stats);
}
