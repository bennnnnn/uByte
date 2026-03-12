import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getLanguageConfig } from "./languages/registry";
import type { SupportedLanguage } from "./languages/types";

const _allCache = new Map<string, { data: TutorialMeta[]; ts: number }>();
const _slugCache = new Map<string, { data: Tutorial | null; ts: number }>();
const CACHE_TTL = 60_000;

export interface SubTopic {
  id: string;
  title: string;
}

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface TutorialMeta {
  slug: string;
  title: string;
  description: string;
  order: number;
  difficulty: Difficulty;
  estimatedMinutes: number;
  subtopics: SubTopic[];
}

export interface Tutorial extends TutorialMeta {
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractSubtopics(content: string): SubTopic[] {
  const headingRegex = /^## (.+)$/gm;
  const subtopics: SubTopic[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const title = match[1].replace(/`/g, "").trim();
    subtopics.push({ id: slugify(title), title });
  }
  return subtopics;
}

/** Get content directory for a language (resolves to absolute path) */
function getContentDir(lang: SupportedLanguage): string {
  const config = getLanguageConfig(lang);
  if (!config) throw new Error(`Unknown language: ${lang}`);
  return path.join(process.cwd(), config.contentDir);
}

/** Only allow slugs that are safe filesystem names — no path traversal. */
const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function isSafeSlug(slug: string): boolean {
  return SAFE_SLUG_RE.test(slug) && !slug.includes("..");
}

export function getAllTutorials(lang: SupportedLanguage = "go"): TutorialMeta[] {
  const cacheKey = lang;
  const hit = _allCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;

  const contentDir = getContentDir(lang);
  if (!fs.existsSync(contentDir)) return [];

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const tutorials = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      order: data.order ?? 999,
      difficulty: (data.difficulty as Difficulty) ?? "beginner",
      estimatedMinutes: data.estimatedMinutes ?? 10,
      subtopics: extractSubtopics(content),
    };
  });

  const sorted = tutorials.sort((a, b) => a.order - b.order);
  _allCache.set(cacheKey, { data: sorted, ts: Date.now() });
  return sorted;
}

export function getTutorialBySlug(
  slug: string,
  lang: SupportedLanguage = "go"
): Tutorial | null {
  // Guard against path traversal attacks via crafted slug values.
  if (!isSafeSlug(slug)) return null;

  const cacheKey = `${lang}:${slug}`;
  const hit = _slugCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;

  const contentDir = getContentDir(lang);
  const filePath = path.join(contentDir, `${slug}.mdx`);

  // Defence in depth: confirm resolved path stays inside contentDir.
  if (!filePath.startsWith(contentDir + path.sep)) return null;

  if (!fs.existsSync(filePath)) {
    _slugCache.set(cacheKey, { data: null, ts: Date.now() });
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const tutorial: Tutorial = {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    order: data.order ?? 999,
    difficulty: (data.difficulty as Difficulty) ?? "beginner",
    estimatedMinutes: data.estimatedMinutes ?? 10,
    subtopics: extractSubtopics(content),
    content,
  };
  _slugCache.set(cacheKey, { data: tutorial, ts: Date.now() });
  return tutorial;
}

export function getAdjacentTutorials(
  currentSlug: string,
  lang: SupportedLanguage = "go"
) {
  const all = getAllTutorials(lang);
  const idx = all.findIndex((t) => t.slug === currentSlug);

  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
