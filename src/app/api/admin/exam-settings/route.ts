import { NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { getExamConfigForAllLangs, setExamSettingsBulk } from "@/lib/db";

export const GET = withErrorHandling("GET /api/admin/exam-settings", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  const settings = await getExamConfigForAllLangs();
  return NextResponse.json(settings);
});

export const PUT = withErrorHandling("PUT /api/admin/exam-settings", async (req: Request) => {
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
  await setExamSettingsBulk(settings);
  const updated = await getExamConfigForAllLangs();
  return NextResponse.json(updated);
});
