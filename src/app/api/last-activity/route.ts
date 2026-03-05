import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveLastActivity } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-utils";

export const POST = withErrorHandling("POST /api/last-activity", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const type = body?.type;
  const lang = body?.lang;
  if (type !== "tutorial" && type !== "practice") {
    return NextResponse.json({ error: "type must be 'tutorial' or 'practice'" }, { status: 400 });
  }
  if (!lang || typeof lang !== "string") {
    return NextResponse.json({ error: "lang required" }, { status: 400 });
  }

  const slug = body?.slug != null ? (typeof body.slug === "string" ? body.slug : null) : undefined;
  const step = body?.step != null ? (typeof body.step === "number" ? body.step : parseInt(String(body.step), 10)) : undefined;
  const stepNum = step !== undefined && !isNaN(step) ? step : null;

  await saveLastActivity(user.userId, {
    type,
    lang,
    slug: slug ?? null,
    step: stepNum,
  });
  return NextResponse.json({ ok: true });
});
