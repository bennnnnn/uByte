import { NextRequest, NextResponse } from "next/server";
import { getAdminRevenueStats, getAdminRecentSubscriptionEvents } from "@/lib/db";
import { requireAdmin } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const { searchParams } = new URL(request.url);
  if (searchParams.get("view") === "subscription-events") {
    const events = await getAdminRecentSubscriptionEvents(50);
    return NextResponse.json({ events });
  }

  const stats = await getAdminRevenueStats();
  return NextResponse.json(stats);
}
