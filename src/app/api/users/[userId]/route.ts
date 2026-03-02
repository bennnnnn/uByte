import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getPublicProfile } from "@/lib/db";

export const GET = withErrorHandling("GET /api/users/[userId]", async (
  _request: NextRequest,
  context: unknown
) => {
  const { userId } = (context as { params: { userId: string } }).params;
  const id = parseInt(userId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

  const profile = await getPublicProfile(id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ profile });
});
