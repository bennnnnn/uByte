import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCodeDraft, upsertCodeDraft, deleteCodeDraft } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ code: null });

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const key = searchParams.get("key") ?? "";
  if (!slug || !key) return NextResponse.json({ code: null });

  const code = await getCodeDraft(user.userId, slug, key);
  return NextResponse.json({ code });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const slug: string = body.slug ?? "";
  const key: string = body.key ?? "";
  const code: string = body.code ?? "";

  if (!slug || !key || typeof code !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (code.length > 100_000) {
    return NextResponse.json({ error: "Code too large" }, { status: 413 });
  }

  await upsertCodeDraft(user.userId, slug, key, code);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const slug: string = body.slug ?? "";
  const key: string = body.key ?? "";

  if (!slug || !key) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await deleteCodeDraft(user.userId, slug, key);
  return NextResponse.json({ ok: true });
}
