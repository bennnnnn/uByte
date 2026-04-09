import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin, requireSuperAdmin } from "@/lib/api-utils";
import { getAllSiteSettings, setSiteSettings, SITE_SETTING_DEFAULTS } from "@/lib/db/site-settings";
import { verifyCsrf } from "@/lib/csrf";
import { logAdminAction } from "@/lib/db";

/** Allowed keys with their validation rules. */
const SETTING_RULES: Record<string, { type: "number"; min: number; max: number } | { type: "bool" }> = {
  max_ai_calls_per_day:        { type: "number", min: 1, max: 10_000 },
  registration_open:           { type: "bool" },
  maintenance_mode:            { type: "bool" },
  ai_enabled:                  { type: "bool" },
  referral_enabled:            { type: "bool" },
  pro_features_enabled:        { type: "bool" },
};

export const GET = withErrorHandling("GET /api/admin/site-settings", async () => {
  // All admins can read settings (needed to show current state in their dashboards)
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const settings = await getAllSiteSettings();
  // Merge with defaults so the response always includes every known key
  const full = { ...SITE_SETTING_DEFAULTS, ...settings };
  return NextResponse.json(full);
});

export const PUT = withErrorHandling("PUT /api/admin/site-settings", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireSuperAdmin();
  if (!admin) return response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected object" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  const errors: string[] = [];

  for (const [key, value] of Object.entries(body)) {
    const rule = SETTING_RULES[key];
    if (!rule) continue; // silently skip unknown keys

    if (rule.type === "bool") {
      // Accept boolean true/false or string "1"/"0"
      const boolVal = value === true || value === "1" || value === 1 ? "1" : "0";
      updates[key] = boolVal;
    } else {
      const num = parseInt(String(value), 10);
      if (isNaN(num)) { errors.push(`${key}: not a number`); continue; }
      if (num < rule.min || num > rule.max) { errors.push(`${key}: must be ${rule.min}–${rule.max}`); continue; }
      updates[key] = String(num);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid settings to update" }, { status: 400 });
  }

  await setSiteSettings(updates);
  await logAdminAction(admin.id, `update_site_settings:${Object.keys(updates).join(",")}`, null);

  const all = await getAllSiteSettings();
  return NextResponse.json({ ...SITE_SETTING_DEFAULTS, ...all });
});
