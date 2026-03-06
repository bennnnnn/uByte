import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getExamConfigForAllLangs } from "@/lib/db/exam-settings";

/**
 * Public endpoint for client components to read per-language exam config
 * (pass percent, question count, duration). No auth required.
 */
export const GET = withErrorHandling("GET /api/site-settings", async () => {
  const configs = await getExamConfigForAllLangs();
  const passPercentByLang: Record<string, number> = {};
  for (const [lang, cfg] of Object.entries(configs)) {
    passPercentByLang[lang] = cfg.passPercent;
  }
  return NextResponse.json({ passPercentByLang });
});
