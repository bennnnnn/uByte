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

  const users = await getLeaderboard(20);
  return NextResponse.json({ users });
});
