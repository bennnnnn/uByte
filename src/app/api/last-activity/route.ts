import { NextResponse } from "next/server";
import { saveLastActivity } from "@/lib/db";
import { withErrorHandling, protectedRoute, parseJsonBody } from "@/lib/api-utils";
import { lastActivityBodySchema } from "@/lib/api-schemas";

export const POST = withErrorHandling(
  "POST /api/last-activity",
  protectedRoute({ rateLimitKey: "last-activity", rateLimitMax: 60 }, async (request, user) => {
    const parsed = await parseJsonBody(request, lastActivityBodySchema);
    if (parsed.error) return parsed.error;

    const { lang, slug, step } = parsed.data;
    const stepNum =
      step != null
        ? typeof step === "number"
          ? step
          : parseInt(String(step), 10)
        : null;
    const stepIndex = stepNum !== null && !Number.isNaN(stepNum) ? stepNum : null;

    await saveLastActivity(user.userId, {
      type: "tutorial",
      lang,
      slug: slug ?? null,
      step: stepIndex,
    });
    return NextResponse.json({ ok: true });
  }),
);
