import { NextResponse } from "next/server";
import { setOnboardingGoal, setOnboardingLang } from "@/lib/db";
import { withErrorHandling, protectedRoute, parseJsonBody } from "@/lib/api-utils";
import { onboardingGoalBodySchema } from "@/lib/api-schemas";
import { isSupportedLanguage } from "@/lib/languages/registry";

export const POST = withErrorHandling(
  "POST /api/onboarding/goal",
  protectedRoute({ rateLimitKey: "onboarding-goal", rateLimitMax: 10 }, async (request, user) => {
    const parsed = await parseJsonBody(request, onboardingGoalBodySchema);
    if (parsed.error) return parsed.error;

    const { goal, lang } = parsed.data;
    await setOnboardingGoal(user.userId, goal);

    if (lang && isSupportedLanguage(lang)) {
      await setOnboardingLang(user.userId, lang);
    }

    return NextResponse.json({ ok: true });
  }),
);
