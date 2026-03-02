import { NextRequest, NextResponse } from "next/server";
import { getUserById, getProgressCount } from "@/lib/db";
import { getAllTutorials } from "@/lib/tutorials";
import { withErrorHandling } from "@/lib/api-utils";

const GO_LANG = "go";

export const GET = withErrorHandling(
  "GET /api/certificate/[userId]",
  async (
    _request: NextRequest,
    context?: unknown
  ) => {
    const { userId } = (context as { params: Promise<{ userId: string }> }).params
      ? await (context as { params: Promise<{ userId: string }> }).params
      : { userId: "" };
    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const [user, completedCount] = await Promise.all([
      getUserById(id),
      getProgressCount(id, GO_LANG),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalTutorials = getAllTutorials(GO_LANG).length;
    const isComplete = completedCount >= totalTutorials;

    return NextResponse.json({
      userId: id,
      name: user.name,
      completedCount,
      totalTutorials,
      isComplete,
      issuedAt: isComplete ? user.last_active_at ?? new Date().toISOString() : null,
    });
  }
);
