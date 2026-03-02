import { NextRequest, NextResponse } from "next/server";
import { getCompletedStepIndices, markStepComplete } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

/** GET — return completed step indices (0-based) for the given tutorial. */
export const GET = withErrorHandling("GET /api/progress/steps", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const lang = request.nextUrl.searchParams.get("lang") ?? "go";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const steps = await getCompletedStepIndices(user.userId, slug, lang);
  return NextResponse.json({ steps });
});

/** POST — mark a step as completed (when user passes the check). */
export const POST = withErrorHandling("POST /api/progress/steps", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`progress:steps:${ip}:${user.userId}`, 120, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const { slug, stepIndex, lang = "go" } = body;
  if (!slug || typeof stepIndex !== "number" || stepIndex < 0) {
    return NextResponse.json({ error: "slug and stepIndex (number >= 0) required" }, { status: 400 });
  }

  const language = typeof lang === "string" ? lang : "go";
  await markStepComplete(user.userId, slug, stepIndex, language);
  return NextResponse.json({ ok: true });
});
