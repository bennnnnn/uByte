import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling("GET /api/leaderboard", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`leaderboard:${ip}`, 30, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const period = (request.nextUrl.searchParams.get("period") === "week" ? "week" : "all") as "all" | "week";
  const users = await getLeaderboard(20, period);
  return NextResponse.json({ users });
});
