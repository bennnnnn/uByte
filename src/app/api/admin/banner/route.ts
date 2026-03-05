import { NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { getSiteBanner, setSiteBanner } from "@/lib/db/site-banner";

export const GET = withErrorHandling("GET /api/admin/banner", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  const banner = await getSiteBanner();
  return NextResponse.json(banner);
});

export const PATCH = withErrorHandling("PATCH /api/admin/banner", async (req: Request) => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  let body: { enabled?: boolean; message?: string; linkUrl?: string; linkText?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  await setSiteBanner({
    enabled: body.enabled,
    message: body.message,
    linkUrl: body.linkUrl,
    linkText: body.linkText,
  });
  const banner = await getSiteBanner();
  return NextResponse.json(banner);
});
