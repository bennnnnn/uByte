import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin, requireSuperAdmin } from "@/lib/api-utils";
import { getAllSiteSettings, setSiteSettings } from "@/lib/db/site-settings";
import { verifyCsrf } from "@/lib/csrf";

const ALLOWED_KEYS = new Set(["exam_pass_percent"]);

export const GET = withErrorHandling("GET /api/admin/site-settings", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  const settings = await getAllSiteSettings();
  return NextResponse.json(settings);
});

export const PUT = withErrorHandling("PUT /api/admin/site-settings", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireSuperAdmin();
  if (!admin) return response;

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected object" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    const num = parseInt(String(value), 10);
    if (isNaN(num)) continue;

    if (key === "exam_pass_percent" && (num < 1 || num > 100)) {
      return NextResponse.json({ error: "Pass percent must be 1–100" }, { status: 400 });
    }

    updates[key] = String(num);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid settings to update" }, { status: 400 });
  }

  await setSiteSettings(updates);
  const all = await getAllSiteSettings();
  return NextResponse.json(all);
});
