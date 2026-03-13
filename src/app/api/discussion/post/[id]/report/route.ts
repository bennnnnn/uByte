/**
 * POST /api/discussion/post/[id]/report
 * Report a discussion post for bad behaviour. Requires authentication.
 * One report per user per post (unique constraint).
 */
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth";
import { getSql } from "@/lib/db/client";

const VALID_REASONS = ["spam", "harassment", "inappropriate", "other"] as const;
type Reason = (typeof VALID_REASONS)[number];

async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS discussion_reports (
      id          SERIAL PRIMARY KEY,
      post_id     INTEGER NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
      reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reason      TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (post_id, reporter_id)
    )
  `;
}

export const POST = withErrorHandling(
  "POST /api/discussion/post/[id]/report",
  async (req: NextRequest, ctx: unknown) => {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to report a post." }, { status: 401 });
    }

    const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
    const postId = parseInt(id, 10);
    if (!postId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json() as { reason?: string };
    const reason = body.reason as Reason;
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason." }, { status: 400 });
    }

    await ensureTable();
    const sql = getSql();

    // Check the post exists
    const [post] = await sql`SELECT id FROM discussion_posts WHERE id = ${postId} AND deleted = false`;
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    // Insert (ignore duplicate — one report per user per post)
    await sql`
      INSERT INTO discussion_reports (post_id, reporter_id, reason)
      VALUES (${postId}, ${user.userId}, ${reason})
      ON CONFLICT (post_id, reporter_id) DO NOTHING
    `;

    return NextResponse.json({ ok: true });
  },
);
