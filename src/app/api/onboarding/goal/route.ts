import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setOnboardingGoal } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const VALID_GOALS = new Set(["get-job", "ace-interviews", "learn-language", "level-up"]);

export const POST = withErrorHandling("POST /api/onboarding/goal", async (req: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const { limited } = await checkRateLimit(`onboarding-goal:${getClientIp(req.headers)}:${user.userId}`, 10, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { goal } = (await req.json()) as { goal?: string };
  if (!goal || !VALID_GOALS.has(goal)) {
    return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
  }

  await setOnboardingGoal(user.userId, goal);
  return NextResponse.json({ ok: true });
});
