import { NextResponse } from "next/server";
import { getExamConfigForAllLangs, getExamPublicStatsByLang } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";

/** GET /api/certifications/stats — public exam configs + community stats for all languages. */
export const GET = withErrorHandling(
  "GET /api/certifications/stats",
  async () => {
    const [examConfigByLang, publicStats] = await Promise.all([
      getExamConfigForAllLangs(),
      getExamPublicStatsByLang(),
    ]);

    const publicStatsByLang = Object.fromEntries(publicStats.map((s) => [s.lang, s]));

    return NextResponse.json({ examConfigByLang, publicStatsByLang });
  }
);
