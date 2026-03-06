import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getExamPassPercent } from "@/lib/db/site-settings";

export const GET = withErrorHandling("GET /api/site-settings", async () => {
  const examPassPercent = await getExamPassPercent();
  return NextResponse.json({ examPassPercent });
});
