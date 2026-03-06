import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getSitePricing, getExamPassPercent } from "@/lib/db/site-settings";

export const GET = withErrorHandling("GET /api/site-settings", async () => {
  const [pricing, passPercent] = await Promise.all([
    getSitePricing(),
    getExamPassPercent(),
  ]);
  return NextResponse.json({ ...pricing, examPassPercent: passPercent });
});
