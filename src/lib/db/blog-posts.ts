/**
 * DB-backed blog posts — allows admins to create and edit posts without
 * touching the filesystem (which is read-only on Vercel at runtime).
 *
 * MDX files in content/blog/ remain the primary source for pre-existing posts.
 * DB posts take precedence when slugs collide (enables editing MDX content via admin).
 */
import { getSql } from "./client";

export interface DbBlogPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  read_time: string;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type DbBlogPostInput = Omit<DbBlogPost, "id" | "created_at" | "updated_at">;

let _ready = false;
async function ensureTable(): Promise<void> {
  if (_ready) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id          SERIAL PRIMARY KEY,
      slug        TEXT    UNIQUE NOT NULL,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      content     TEXT    NOT NULL DEFAULT '',
      category    TEXT    NOT NULL DEFAULT '',
      tags        TEXT    NOT NULL DEFAULT '[]',
      read_time   TEXT    NOT NULL DEFAULT '5 min read',
      author      TEXT    NOT NULL DEFAULT 'uByte Team',
      published   BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  _ready = true;
}

function parse(row: Record<string, unknown>): DbBlogPost {
  let tags: string[] = [];
  try { tags = JSON.parse(row.tags as string); } catch { tags = []; }
  return {
    id:          row.id as number,
    slug:        row.slug as string,
    title:       row.title as string,
    description: row.description as string,
    content:     row.content as string,
    category:    row.category as string,
    tags,
    read_time:   row.read_time as string,
    author:      row.author as string,
    published:   row.published as boolean,
    created_at:  row.created_at as string,
    updated_at:  row.updated_at as string,
  };
}

export async function getAllDbBlogPosts(): Promise<DbBlogPost[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM blog_posts ORDER BY created_at DESC`;
  return rows.map(parse);
}

export async function getDbBlogPost(slug: string): Promise<DbBlogPost | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1`;
  return rows.length ? parse(rows[0]) : null;
}

export async function getDbBlogPostById(id: number): Promise<DbBlogPost | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id} LIMIT 1`;
  return rows.length ? parse(rows[0]) : null;
}

export async function createDbBlogPost(input: DbBlogPostInput): Promise<DbBlogPost> {
  await ensureTable();
  const sql = getSql();
  const tagsJson = JSON.stringify(input.tags ?? []);
  const rows = await sql`
    INSERT INTO blog_posts (slug, title, description, content, category, tags, read_time, author, published)
    VALUES (${input.slug}, ${input.title}, ${input.description}, ${input.content},
            ${input.category}, ${tagsJson}, ${input.read_time}, ${input.author}, ${input.published})
    RETURNING *
  `;
  return parse(rows[0]);
}

export async function updateDbBlogPost(id: number, input: Partial<DbBlogPostInput>): Promise<DbBlogPost | null> {
  await ensureTable();
  const sql = getSql();
  const tagsJson = input.tags !== undefined ? JSON.stringify(input.tags) : undefined;
  const rows = await sql`
    UPDATE blog_posts SET
      slug        = COALESCE(${input.slug ?? null}, slug),
      title       = COALESCE(${input.title ?? null}, title),
      description = COALESCE(${input.description ?? null}, description),
      content     = COALESCE(${input.content ?? null}, content),
      category    = COALESCE(${input.category ?? null}, category),
      tags        = COALESCE(${tagsJson ?? null}, tags),
      read_time   = COALESCE(${input.read_time ?? null}, read_time),
      author      = COALESCE(${input.author ?? null}, author),
      published   = COALESCE(${input.published ?? null}, published),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows.length ? parse(rows[0]) : null;
}

export async function deleteDbBlogPost(id: number): Promise<boolean> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`DELETE FROM blog_posts WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
