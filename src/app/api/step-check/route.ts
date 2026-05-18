import { NextResponse } from "next/server";
import { withErrorHandling, publicMutationRoute, parseJsonBody } from "@/lib/api-utils";
import { stepCheckBodySchema } from "@/lib/api-schemas";
import { getCurrentUser } from "@/lib/auth";
import { recordStepCheck, recordUserStepAttempt } from "@/lib/db";
import { getSteps } from "@/lib/tutorial-steps";
import { isSupportedLanguage } from "@/lib/languages/registry";

export const POST = withErrorHandling(
  "POST /api/step-check",
  publicMutationRoute({ rateLimitKey: "step-check", rateLimitMax: 60 }, async (request) => {
    const parsed = await parseJsonBody(request, stepCheckBodySchema);
    if (parsed.error) return parsed.error;

    const { lang = "go", tutorialSlug, stepIndex, passed } = parsed.data;
    const language = isSupportedLanguage(lang) ? lang : "go";
    const steps = getSteps(language, tutorialSlug);
    if (steps.length === 0 || stepIndex < 0 || stepIndex >= steps.length) {
      return NextResponse.json({ error: "Unknown tutorial or step" }, { status: 400 });
    }

    await recordStepCheck(tutorialSlug, stepIndex, passed);

    const authed = await getCurrentUser();
    if (authed) {
      recordUserStepAttempt(authed.userId, language, tutorialSlug, stepIndex, passed).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  }),
);
