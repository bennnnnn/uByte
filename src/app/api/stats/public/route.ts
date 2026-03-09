/**
 * Public stats endpoint — used by the pricing page for social proof.
 * Returns user count, rounded to nearest hundred for a cleaner display.
 * No auth required; cached for 10 minutes on the CDN.
 */
import { NextResponse } from "next/server";
import { getTotalUserCount } from "@/lib/db";

export const revalidate = 600; // 10-min CDN cache

export async function GET() {
  try {
    const count = await getTotalUserCount();
    // Round down to nearest 100 so the number never oversells
    const rounded = Math.max(Math.floor(count / 100) * 100, 100);
    return NextResponse.json({ userCount: rounded }, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ userCount: 0 });
  }
}
