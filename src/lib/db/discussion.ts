import { getSql } from "./client";

export interface DiscussionPost {
  id: number;
  slug: string;
  user_id: number | null;
  parent_id: number | null;
  body: string;
  deleted: boolean;
  created_at: string;
  author_name: string | null;
  reply_count: number;
}

/** Top-level posts for a problem slug, oldest-first, with reply counts. */
export async function getPostsForSlug(
  slug: string,
  limit = 100,
  offset = 0,
): Promise<DiscussionPost[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      p.id, p.slug, p.user_id, p.parent_id, p.body, p.deleted, p.created_at,
      u.name AS author_name,
      COUNT(r.id)::int AS reply_count
    FROM discussion_posts p
    LEFT JOIN users u ON u.id = p.user_id
    LEFT JOIN discussion_posts r ON r.parent_id = p.id AND r.deleted = false
    WHERE p.slug = ${slug} AND p.parent_id IS NULL AND p.deleted = false
    GROUP BY p.id, u.name
    ORDER BY p.created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as DiscussionPost[];
}

/** Direct replies to a parent post, oldest-first. */
export async function getReplies(parentId: number): Promise<DiscussionPost[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      p.id, p.slug, p.user_id, p.parent_id, p.body, p.deleted, p.created_at,
      u.name AS author_name,
      0::int AS reply_count
    FROM discussion_posts p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.parent_id = ${parentId} AND p.deleted = false
    ORDER BY p.created_at ASC
  `;
  return rows as DiscussionPost[];
}

/** Create a post or reply. Returns the new row including author_name. */
export async function createPost(
  userId: number,
  slug: string,
  body: string,
  parentId: number | null,
): Promise<DiscussionPost> {
  const sql = getSql();
  const rows = await sql`
    WITH ins AS (
      INSERT INTO discussion_posts (slug, user_id, parent_id, body)
      VALUES (${slug}, ${userId}, ${parentId}, ${body})
      RETURNING *
    )
    SELECT ins.*, u.name AS author_name, 0::int AS reply_count
    FROM ins LEFT JOIN users u ON u.id = ins.user_id
  `;
  return rows[0] as DiscussionPost;
}

/** Fetch a single post (for building notifications). */
export async function getPostById(id: number): Promise<DiscussionPost | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.*, u.name AS author_name, 0::int AS reply_count
    FROM discussion_posts p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.id = ${id}
  `;
  return (rows[0] ?? null) as DiscussionPost | null;
}

/** Soft-delete. Only the post author or an admin can delete. Returns true if deleted. */
export async function softDeletePost(
  id: number,
  requesterId: number,
  isAdmin: boolean,
): Promise<boolean> {
  const sql = getSql();
  const rows = isAdmin
    ? await sql`UPDATE discussion_posts SET deleted = true WHERE id = ${id} RETURNING id`
    : await sql`UPDATE discussion_posts SET deleted = true WHERE id = ${id} AND user_id = ${requesterId} RETURNING id`;
  return rows.length > 0;
}

/** Find users by name for @mention notifications (case-insensitive). */
export async function findUsersByNames(
  names: string[],
): Promise<{ id: number; name: string }[]> {
  if (names.length === 0) return [];
  const sql = getSql();
  const lower = names.map((n) => n.toLowerCase());
  const rows = await sql`
    SELECT id, name FROM users
    WHERE lower(name) = ANY(${lower}::text[])
    LIMIT 20
  `;
  return rows as { id: number; name: string }[];
}
