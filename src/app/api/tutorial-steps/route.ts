import { NextRequest, NextResponse } from "next/server";
import { getSteps } from "@/lib/tutorial-steps";
import { isSupportedLanguage } from "@/lib/languages/registry";
import { withErrorHandling } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling("GET /api/tutorial-steps", async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang")?.trim();
  const slug = searchParams.get("slug")?.trim();
  if (!lang || !slug) {
    return NextResponse.json({ error: "lang and slug required" }, { status: 400 });
  }
  if (!isSupportedLanguage(lang)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }
  const steps = getSteps(lang, slug);
  return NextResponse.json({ steps });
});
