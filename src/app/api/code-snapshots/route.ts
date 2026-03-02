import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { saveSnapshot, getSnapshots } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";

export const GET = withErrorHandling("GET /api/code-snapshots", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const stepIndex = parseInt(searchParams.get("stepIndex") ?? "0", 10);
  const lang = searchParams.get("lang") ?? "go";

  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const snapshots = await getSnapshots(user.userId, slug, stepIndex, lang);
  return NextResponse.json({ snapshots });
});

export const POST = withErrorHandling("POST /api/code-snapshots", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const { user, response } = await requireAuth();
  if (!user) return response;

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`snapshots:${ip}:${user.userId}`, 30, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const { slug, stepIndex, code, lang = "go" } = body;
  if (!slug || typeof stepIndex !== "number" || !code) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await saveSnapshot(user.userId, slug, stepIndex, code, typeof lang === "string" ? lang : "go");
  return NextResponse.json({ ok: true });
});
