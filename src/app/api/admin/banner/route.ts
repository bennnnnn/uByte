import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdminPermission } from "@/lib/api-utils";
import { getSiteBanner, setSiteBanner } from "@/lib/db/site-banner";
import type { BannerType } from "@/lib/db/site-banner";
import { verifyCsrf } from "@/lib/csrf";

export const GET = withErrorHandling("GET /api/admin/banner", async () => {
  const { admin, response } = await requireAdminPermission("banner");
  if (!admin) return response;
  const banner = await getSiteBanner();
  return NextResponse.json(banner);
});

export const PATCH = withErrorHandling("PATCH /api/admin/banner", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdminPermission("banner");
  if (!admin) return response;

  let body: {
    enabled?: boolean;
    message?: string;
    linkUrl?: string;
    linkText?: string;
    bannerType?: BannerType;
    bannerIcon?: string;
  } = {};
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
    bannerType: body.bannerType,
    bannerIcon: body.bannerIcon,
  });
  const banner = await getSiteBanner();
  return NextResponse.json(banner);
});
