/**
 * Returns the in-app onboarding checklist status for the current user.
 * Used by the OnboardingChecklist widget.
 *
 * Step:
 *   1. completedTutorialStep — has any tutorial step marked correct
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSql } from "@/lib/db/client";
import { withErrorHandling } from "@/lib/api-utils";

const SHOW_FOR_DAYS = 21; // show checklist for first 3 weeks

export const GET = withErrorHandling("GET /api/onboarding-status", async () => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ show: false });

  const sql = getSql();

  const [stepRow, userRow] = await Promise.all([
    // Any completed tutorial step stored via step_progress or progress
    sql`SELECT 1 FROM step_progress WHERE user_id = ${user.userId} LIMIT 1`,
    // User creation date
    sql`SELECT created_at FROM users WHERE id = ${user.userId} LIMIT 1`,
  ]);

  const createdAt = userRow[0]?.created_at ? new Date(userRow[0].created_at) : new Date();
  const daysSinceSignup = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const isNewUser = daysSinceSignup <= SHOW_FOR_DAYS;

  const completedTutorialStep = stepRow.length > 0;

  return NextResponse.json({
    show: isNewUser && !completedTutorialStep,
    completedTutorialStep,
  });
});
