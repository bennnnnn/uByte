import { getSql } from "./client";
import { getAllLanguageSlugs, getLanguageConfig, isSupportedLanguage } from "@/lib/languages/registry";
import { getAllTutorials } from "@/lib/tutorials";
import { getAllPracticeProblems, getPracticeProblemBySlug } from "@/lib/practice/problems";
import type { SupportedLanguage } from "@/lib/languages/types";

const UNDEFINED_COLUMN = "42703";
const LIMIT_LANGUAGES = 8;
const LIMIT_TUTORIALS = 6;
const LIMIT_PRACTICE = 6;

export interface PopularLanguage {
  slug: string;
  name: string;
  completionCount: number;
}

export interface PopularTutorial {
  lang: string;
  slug: string;
  title: string;
  completionCount: number;
}

export interface PopularPracticeProblem {
  slug: string;
  title: string;
  viewCount: number;
}

/** Popular languages by completion count (from progress table). */
export async function getPopularLanguages(): Promise<PopularLanguage[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT language AS lang, COUNT(*)::int AS c
      FROM progress
      WHERE language IS NOT NULL AND language != ''
      GROUP BY language
      ORDER BY c DESC
      LIMIT ${LIMIT_LANGUAGES}
    `;
    const supported = getAllLanguageSlugs();
    const result: PopularLanguage[] = [];
    for (const r of rows) {
      const lang = (r.lang as string)?.toLowerCase();
      if (lang && supported.includes(lang)) {
        const config = getLanguageConfig(lang);
        if (config)
          result.push({
            slug: lang,
            name: config.name,
            completionCount: (r.c as number) ?? 0,
          });
      }
    }
    return result;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === UNDEFINED_COLUMN) return [];
    throw err;
  }
}

/** Popular tutorials by completion count (from progress table). */
export async function getPopularTutorials(): Promise<PopularTutorial[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT language AS lang, tutorial_slug AS slug, COUNT(*)::int AS c
      FROM progress
      WHERE language IS NOT NULL AND language != ''
      GROUP BY language, tutorial_slug
      ORDER BY c DESC
      LIMIT ${LIMIT_TUTORIALS * 2}
    `;
    const result: PopularTutorial[] = [];
    const seen = new Set<string>();
    for (const r of rows) {
      const lang = (r.lang as string)?.toLowerCase();
      const slug = r.slug as string;
      if (!lang || !slug || !isSupportedLanguage(lang)) continue;
      const key = `${lang}:${slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const tutorials = getAllTutorials(lang as SupportedLanguage);
      const t = tutorials.find((x) => x.slug === slug);
      if (t)
        result.push({
          lang,
          slug,
          title: t.title,
          completionCount: (r.c as number) ?? 0,
        });
      if (result.length >= LIMIT_TUTORIALS) break;
    }
    return result;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === UNDEFINED_COLUMN) return [];
    throw err;
  }
}

/** Record an interview prep problem view (for popularity). */
export async function recordPracticeView(viewerId: string, problemSlug: string): Promise<void> {
  const sql = getSql();
  try {
    await sql`
      INSERT INTO practice_views (viewer_id, problem_slug)
      VALUES (${viewerId}, ${problemSlug})
      ON CONFLICT (viewer_id, problem_slug) DO NOTHING
    `;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "42P01") return; /* table does not exist */
    throw err;
  }
}

/** Popular interview prep problems by view count (from practice_views table). */
export async function getPopularPracticeProblems(): Promise<PopularPracticeProblem[]> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT problem_slug AS slug, COUNT(*)::int AS c
      FROM practice_views
      GROUP BY problem_slug
      ORDER BY c DESC
      LIMIT ${LIMIT_PRACTICE}
    `;
    return rows.map((r) => {
      const slug = r.slug as string;
      const problem = getPracticeProblemBySlug(slug);
      return {
        slug,
        title: problem?.title ?? slug,
        viewCount: (r.c as number) ?? 0,
      };
    });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "42P01") return []; /* table does not exist */
    throw err;
  }
}

/** Fallback when DB has no data: return all languages and all interview prep problems. */
export function getFallbackPopularLanguages(): PopularLanguage[] {
  return getAllLanguageSlugs()
    .map((slug) => ({ slug, config: getLanguageConfig(slug) }))
    .filter((e): e is { slug: string; config: NonNullable<ReturnType<typeof getLanguageConfig>> } => !!e.config)
    .map(({ slug, config }) => ({ slug, name: config.name, completionCount: 0 }));
}

export function getFallbackPopularPracticeProblems(): PopularPracticeProblem[] {
  return getAllPracticeProblems()
    .slice(0, LIMIT_PRACTICE)
    .map((p) => ({ slug: p.slug, title: p.title, viewCount: 0 }));
}
