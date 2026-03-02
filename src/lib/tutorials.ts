import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getLanguageConfig } from "./languages/registry";
import type { SupportedLanguage } from "./languages/types";

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

export function getAllTutorials(lang: SupportedLanguage = "go"): TutorialMeta[] {
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

  return tutorials.sort((a, b) => a.order - b.order);
}

export function getTutorialBySlug(
  slug: string,
  lang: SupportedLanguage = "go"
): Tutorial | null {
  const contentDir = getContentDir(lang);
  const filePath = path.join(contentDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

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
    content,
  };
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
