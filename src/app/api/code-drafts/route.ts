import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCodeDraft, upsertCodeDraft, deleteCodeDraft } from "@/lib/db";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const GET = withErrorHandling("GET /api/code-drafts", async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ code: null });

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const key = searchParams.get("key") ?? "";
  const lang = searchParams.get("lang") ?? "go";
  if (!slug || !key) return NextResponse.json({ code: null });

  const code = await getCodeDraft(user.userId, slug, key, lang);
  return NextResponse.json({ code });
});

export const PUT = withErrorHandling("PUT /api/code-drafts", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`code-drafts:${ip}`, 120, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { user, response } = await requireAuth();
  if (!user) return response;

  const body = await request.json();
  const slug: string = body.slug ?? "";
  const key: string = body.key ?? "";
  const code: string = body.code ?? "";
  const lang: string = body.lang ?? "go";

  if (!slug || !key || typeof code !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (code.length > 100_000) {
    return NextResponse.json({ error: "Code too large" }, { status: 413 });
  }

  await upsertCodeDraft(user.userId, slug, key, code, lang);
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling("DELETE /api/code-drafts", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });
  const ip = getClientIp(request.headers);
  const { limited } = await checkRateLimit(`code-drafts:${ip}`, 60, 60_000);
  if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { user, response } = await requireAuth();
  if (!user) return response;

  const body = await request.json();
  const slug: string = body.slug ?? "";
  const key: string = body.key ?? "";
  const lang: string = body.lang ?? "go";

  if (!slug || !key) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await deleteCodeDraft(user.userId, slug, key, lang);
  return NextResponse.json({ ok: true });
});
