import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAuth, protectedRoute } from "@/lib/api-utils";
import { getStepNote, upsertStepNote } from "@/lib/db";

export const GET = withErrorHandling("GET /api/notes", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const stepIndex = parseInt(searchParams.get("stepIndex") ?? "0", 10);
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const note = await getStepNote(user.userId, slug, stepIndex);
  return NextResponse.json({ note });
});

export const POST = withErrorHandling("POST /api/notes",
  protectedRoute({ rateLimitKey: "notes", rateLimitMax: 30 }, async (request, user) => {
    const { slug, stepIndex, note } = await request.json();
    if (!slug || typeof stepIndex !== "number" || typeof note !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (note.length > 2000) return NextResponse.json({ error: "Note too long" }, { status: 400 });

    await upsertStepNote(user.userId, slug, stepIndex, note);
    return NextResponse.json({ ok: true });
  })
);
