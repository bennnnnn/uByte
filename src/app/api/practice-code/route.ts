import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getPracticeCodeDraft, upsertPracticeCodeDraft, deletePracticeCodeDraft } from "@/lib/db";
import { verifyCsrf } from "@/lib/csrf";

const MAX_CODE_LENGTH = 64 * 1024; // 64 KB — same limit as /api/submit

/** GET /api/practice-code?slug=&lang= — load saved draft for logged-in user */
export const GET = withErrorHandling("GET /api/practice-code", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const lang = searchParams.get("lang") ?? "";
  if (!slug || !lang) return NextResponse.json({ error: "slug and lang required" }, { status: 400 });

  const code = await getPracticeCodeDraft(user.userId, slug, lang);
  return NextResponse.json({ code });
});

/** POST /api/practice-code — upsert draft */
export const POST = withErrorHandling("POST /api/practice-code", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`practice-code:${ip}:${user.userId}`, 60, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const { slug, lang, code } = body ?? {};

  if (!slug || !lang || typeof code !== "string") {
    return NextResponse.json({ error: "slug, lang, and code required" }, { status: 400 });
  }
  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json({ error: "Code too long" }, { status: 400 });
  }

  await upsertPracticeCodeDraft(user.userId, slug, lang, code);
  return NextResponse.json({ ok: true });
});

/** DELETE /api/practice-code — remove draft (on Reset) */
export const DELETE = withErrorHandling("DELETE /api/practice-code", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

  const body = await request.json();
  const { slug, lang } = body ?? {};
  if (!slug || !lang) return NextResponse.json({ error: "slug and lang required" }, { status: 400 });

  await deletePracticeCodeDraft(user.userId, slug, lang);
  return NextResponse.json({ ok: true });
});
