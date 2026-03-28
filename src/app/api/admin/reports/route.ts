/**
 * GET  /api/admin/reports          — list all reported discussion posts
 * PATCH /api/admin/reports         — dismiss reports or delete the post
 *   body: { postId, action: "dismiss" | "delete" }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, withErrorHandling } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";
import { getSql } from "@/lib/db/client";

export const GET = withErrorHandling("GET /api/admin/reports", async () => {
  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const sql = getSql();

  // Create table if it doesn't exist yet (same guard as the report route)
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

  const rows = await sql`
    SELECT
      dp.id          AS post_id,
      dp.body        AS post_content,
      dp.created_at  AS post_created_at,
      dp.deleted     AS post_deleted,
      u.name         AS author_name,
      u.email        AS author_email,
      dp.slug        AS problem_slug,
      NULL::text     AS lang,
      COUNT(dr.id)::int              AS report_count,
      array_agg(DISTINCT dr.reason)  AS reasons,
      MIN(dr.created_at)             AS first_reported_at,
      MAX(dr.created_at)             AS last_reported_at
    FROM discussion_reports dr
    JOIN discussion_posts dp ON dp.id = dr.post_id
    LEFT JOIN users u ON u.id = dp.user_id
    WHERE dp.deleted = false
    GROUP BY dp.id, u.name, u.email
    ORDER BY report_count DESC, last_reported_at DESC
  `;

  return NextResponse.json({ reports: rows });
});

export const PATCH = withErrorHandling("PATCH /api/admin/reports", async (req: NextRequest) => {
  const csrfError = verifyCsrf(req);
  if (csrfError) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });

  const { admin, response } = await requireAdmin();
  if (!admin) return response;

  const body = await req.json() as { postId?: number; action?: string };
  const { postId, action } = body;

  if (!postId || !["dismiss", "delete"].includes(action ?? "")) {
    return NextResponse.json({ error: "postId and action ('dismiss' or 'delete') required" }, { status: 400 });
  }

  const sql = getSql();

  if (action === "delete") {
    // Soft-delete the post — reports cascade away via ON DELETE CASCADE
    await sql`UPDATE discussion_posts SET deleted = true WHERE id = ${postId}`;
  } else {
    // Dismiss — remove all reports for this post without deleting the post
    await sql`DELETE FROM discussion_reports WHERE post_id = ${postId}`;
  }

  return NextResponse.json({ ok: true });
});
