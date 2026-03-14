import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { getExamConfigForAllLangs, setExamSettingsBulk } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";

export const GET = withErrorHandling("GET /api/admin/exam-settings", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  const settings = await getExamConfigForAllLangs();
  return NextResponse.json(settings);
});

export const PUT = withErrorHandling("PUT /api/admin/exam-settings", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  let body: { settings?: Record<string, { examSize?: number; examDurationMinutes?: number; passPercent?: number }> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const settings = body.settings;
  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "Missing settings object" }, { status: 400 });
  }

  for (const [lang, cfg] of Object.entries(settings)) {
    if (typeof lang !== "string" || lang.length > 30) {
      return NextResponse.json({ error: "Invalid language key" }, { status: 400 });
    }
    if (cfg.examSize != null && (!Number.isInteger(cfg.examSize) || cfg.examSize < 1 || cfg.examSize > 200)) {
      return NextResponse.json({ error: `examSize for ${lang} must be 1–200` }, { status: 400 });
    }
    if (cfg.examDurationMinutes != null && (!Number.isInteger(cfg.examDurationMinutes) || cfg.examDurationMinutes < 1 || cfg.examDurationMinutes > 300)) {
      return NextResponse.json({ error: `examDurationMinutes for ${lang} must be 1–300` }, { status: 400 });
    }
    if (cfg.passPercent != null && (typeof cfg.passPercent !== "number" || cfg.passPercent < 1 || cfg.passPercent > 100)) {
      return NextResponse.json({ error: `passPercent for ${lang} must be 1–100` }, { status: 400 });
    }
  }

  await setExamSettingsBulk(settings);
  const updated = await getExamConfigForAllLangs();
  return NextResponse.json(updated);
});
