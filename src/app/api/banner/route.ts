import { NextResponse } from "next/server";
import { getSiteBanner } from "@/lib/db/site-banner";
import { withErrorHandling } from "@/lib/api-utils";

/** Public: get current site banner (enabled + message + link). */
export const GET = withErrorHandling("GET /api/banner", async () => {
  const banner = await getSiteBanner();
  return NextResponse.json(banner);
});
