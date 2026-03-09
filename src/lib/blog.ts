/**
 * Blog utilities — reads MDX files from src/content/blog/.
 *
 * Files live in the repo (no CMS, no database).
 * Frontmatter fields: title, description, date, readTime, category, tags.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export function getAllBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8"));
      return {
        slug,
        title: (data.title as string) ?? "",
        description: (data.description as string) ?? "",
        date: (data.date as string) ?? "",
        readTime: (data.readTime as string) ?? "",
        category: (data.category as string) ?? "",
        tags: (data.tags as string[]) ?? [],
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  return {
    slug,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    date: (data.date as string) ?? "",
    readTime: (data.readTime as string) ?? "",
    category: (data.category as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    content,
  };
}
