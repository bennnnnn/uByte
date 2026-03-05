import { NextResponse } from "next/server";
import { getSiteBanner } from "@/lib/db/site-banner";

/** Public: get current site banner (enabled + message + link). */
export async function GET() {
  try {
    const banner = await getSiteBanner();
    return NextResponse.json(banner);
  } catch (e) {
    return NextResponse.json(
      { enabled: false, message: "", linkUrl: "/", linkText: "Sign up" },
      { status: 200 }
    );
  }
}
