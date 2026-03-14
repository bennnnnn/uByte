/**
 * Blog utilities — merges two sources:
 *  1. MDX files from content/blog/ (static, in-repo)
 *  2. DB posts from the blog_posts table (admin-created, editable at runtime)
 *
 * DB posts take precedence when slugs collide, allowing admins to override
 * or replace MDX content without touching the filesystem.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllDbBlogPosts, getDbBlogPost } from "@/lib/db/blog-posts";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  readTime: string;
  category: string;
  tags: string[];
  ogImage?: string;
  /** true = from database (admin-created), false = MDX file */
  fromDb?: boolean;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

// ─── MDX helpers (synchronous) ──────────────────────────────────────────────

function getMdxBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8"));
      return {
        slug,
        title:       (data.title as string) ?? "",
        description: (data.description as string) ?? "",
        date:        (data.date as string) ?? "",
        readTime:    (data.readTime as string) ?? "5 min read",
        category:    (data.category as string) ?? "",
        tags:        (data.tags as string[]) ?? [],
        fromDb:      false,
      };
    });
}

function getMdxBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  return {
    slug,
    title:       (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    date:        (data.date as string) ?? "",
    readTime:    (data.readTime as string) ?? "5 min read",
    category:    (data.category as string) ?? "",
    tags:        (data.tags as string[]) ?? [],
    content,
    fromDb:      false,
  };
}

// ─── Public API (async — needed for DB access) ───────────────────────────────

/**
 * Returns all blog posts (MDX + DB), sorted by date descending.
 * DB posts override MDX posts with the same slug.
 */
export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const mdxPosts = getMdxBlogPosts();
  let dbPosts: BlogPostMeta[] = [];
  try {
    const rows = await getAllDbBlogPosts();
    dbPosts = rows
      .filter((r) => r.published)
      .map((r) => ({
        slug:        r.slug,
        title:       r.title,
        description: r.description,
        date:        r.created_at.slice(0, 10),
        updatedAt:   r.updated_at.slice(0, 10),
        readTime:    r.read_time,
        category:    r.category,
        tags:        r.tags,
        ogImage:     r.og_image || undefined,
        fromDb:      true,
      }));
  } catch { /* DB unavailable — fall back to MDX only */ }

  // Build merged list: DB takes precedence over MDX for same slug
  const dbSlugs = new Set(dbPosts.map((p) => p.slug));
  const merged = [
    ...dbPosts,
    ...mdxPosts.filter((p) => !dbSlugs.has(p.slug)),
  ];

  return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Returns a single blog post. Checks DB first, then MDX.
 * Pass `allowDraft = true` to return unpublished DB posts (admin preview).
 */
export async function getBlogPost(slug: string, allowDraft = false): Promise<BlogPost | null> {
  try {
    const dbPost = await getDbBlogPost(slug);
    if (dbPost && (dbPost.published || allowDraft)) {
      return {
        slug:        dbPost.slug,
        title:       dbPost.title,
        description: dbPost.description,
        date:        dbPost.created_at.slice(0, 10),
        updatedAt:   dbPost.updated_at.slice(0, 10),
        readTime:    dbPost.read_time,
        category:    dbPost.category,
        tags:        dbPost.tags,
        ogImage:     dbPost.og_image || undefined,
        content:     dbPost.content,
        fromDb:      true,
      };
    }
  } catch { /* fall through to MDX */ }
  return getMdxBlogPost(slug);
}

/**
 * Synchronous slug list for static generation (MDX files only — DB posts
 * use dynamic rendering via `export const dynamic = "force-dynamic"`).
 */
export function getMdxBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(".mdx", ""));
}
