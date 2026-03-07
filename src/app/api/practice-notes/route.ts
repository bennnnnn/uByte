import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getPracticeNote, upsertPracticeNote } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";

export const GET = withErrorHandling("GET /api/practice-notes", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const note = await getPracticeNote(user.userId, slug);
  return NextResponse.json({ note });
});

export const POST = withErrorHandling("POST /api/practice-notes", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`practice-notes:${ip}:${user.userId}`, 30, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { slug, note } = await request.json();
  if (!slug || typeof note !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (note.length > 5000) return NextResponse.json({ error: "Note too long" }, { status: 400 });

  await upsertPracticeNote(user.userId, slug, note);
  return NextResponse.json({ ok: true });
});
