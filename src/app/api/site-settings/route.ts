import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";

/**
 * Public site metadata. Kept for backward compatibility; response is minimal (tutorials-only product).
 */
export const GET = withErrorHandling("GET /api/site-settings", async () => {
  return NextResponse.json(
    {},
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
});
