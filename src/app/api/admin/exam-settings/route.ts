import { NextResponse } from "next/server";
import { withErrorHandling, requireAdmin } from "@/lib/api-utils";
import { getExamConfig, setExamSettings } from "@/lib/db";

export const GET = withErrorHandling("GET /api/admin/exam-settings", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  const config = await getExamConfig();
  return NextResponse.json(config);
});

export const PUT = withErrorHandling("PUT /api/admin/exam-settings", async (req: Request) => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;
  let body: { examSize?: number; examDurationMinutes?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  await setExamSettings({
    examSize: body.examSize,
    examDurationMinutes: body.examDurationMinutes,
  });
  const config = await getExamConfig();
  return NextResponse.json(config);
});
