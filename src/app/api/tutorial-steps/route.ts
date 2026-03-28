import { NextRequest, NextResponse } from "next/server";
import { getSteps } from "@/lib/tutorial-steps";
import { isSupportedLanguage } from "@/lib/languages/registry";
import { withErrorHandling } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { SupportedLanguage } from "@/lib/languages/types";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling("GET /api/tutorial-steps", async (request: NextRequest) => {
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`tutorial-steps:${ip}`, 60, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang")?.trim();
  const slug = searchParams.get("slug")?.trim();
  if (!lang || !slug) {
    return NextResponse.json({ error: "lang and slug required" }, { status: 400 });
  }
  if (!isSupportedLanguage(lang)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  // All tutorials are free — no access check needed.
  const steps = getSteps(lang as SupportedLanguage, slug);
  return NextResponse.json({ steps });
});
