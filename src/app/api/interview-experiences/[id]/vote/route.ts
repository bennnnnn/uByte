/**
 * POST /api/interview-experiences/[id]/vote — upvote or downvote an experience
 */
import { NextRequest, NextResponse } from "next/server";
import { voteOnExperience } from "@/lib/db/interview-experiences";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";

export const POST = withErrorHandling(
  "POST /api/interview-experiences/[id]/vote",
  async (req: NextRequest, ctx: unknown) => {
    const csrfError = verifyCsrf(req);
    if (csrfError) return NextResponse.json({ error: csrfError }, { status: 403 });

    const { id: idStr } = await (ctx as { params: Promise<{ id: string }> }).params;
    const id = parseInt(idStr, 10);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const ip = getClientIp(req.headers);
    const { limited } = await checkRateLimit(`interview-vote:${ip}`, 60, 60 * 60 * 1000);
    if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const body = await req.json() as { vote?: number };
    const vote = body.vote;
    if (vote !== 1 && vote !== -1 && vote !== 0) {
      return NextResponse.json({ error: "vote must be 1, -1, or 0" }, { status: 400 });
    }

    const user = await getCurrentUser();

    // Determine visitor id for anonymous voting
    const cookieStore = await cookies();
    let visitorId = cookieStore.get("vid")?.value ?? null;
    const res = NextResponse.json({ ok: true });

    if (!user && !visitorId) {
      visitorId = crypto.randomUUID();
      res.cookies.set("vid", visitorId, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
    }

    await voteOnExperience(id, vote as 1 | -1 | 0, user?.userId ?? null, user ? null : visitorId);
    return res;
  },
);
