import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { recordStepCheck } from "@/lib/db";
import { getSteps } from "@/lib/tutorial-steps";
import { isSupportedLanguage } from "@/lib/languages/registry";

export const POST = withErrorHandling("POST /api/step-check", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`step-check:${ip}`, 60, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { lang = "go", tutorialSlug, stepIndex, passed } = body;

  if (typeof tutorialSlug !== "string" || typeof stepIndex !== "number" || typeof passed !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const language = typeof lang === "string" && isSupportedLanguage(lang) ? lang : "go";
  const steps = getSteps(language, tutorialSlug);
  if (steps.length === 0 || stepIndex < 0 || stepIndex >= steps.length) {
    return NextResponse.json({ error: "Unknown tutorial or step" }, { status: 400 });
  }

  await recordStepCheck(tutorialSlug, stepIndex, passed);
  return NextResponse.json({ ok: true });
});
