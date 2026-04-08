import { unstable_cache } from "next/cache";
import { getSql } from "./client";
import { getAllLanguageSlugs, getLanguageConfig, isSupportedLanguage } from "@/lib/languages/registry";
import { getAllTutorials } from "@/lib/tutorials";
import type { SupportedLanguage } from "@/lib/languages/types";

const UNDEFINED_COLUMN = "42703";
const LIMIT_TUTORIALS = 6;

export interface PopularLanguage {
  slug: string;
  name: string;
  /** Distinct users who have at least one progress row for this language */
  learnerCount: number;
}

export interface PopularTutorial {
  lang: string;
  slug: string;
  title: string;
  completionCount: number;
}

/** Popular languages by completion count (from progress table). */
export const getPopularLanguages = unstable_cache(
  async (): Promise<PopularLanguage[]> => {
    const sql = getSql();
    try {
      const rows = await sql`
        SELECT language AS lang, COUNT(DISTINCT user_id)::int AS c
        FROM progress
        WHERE language IS NOT NULL AND language != ''
        GROUP BY language
        ORDER BY c DESC
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
              learnerCount: (r.c as number) ?? 0,
            });
        }
      }
      return result;
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === UNDEFINED_COLUMN) return [];
      throw err;
    }
  },
  ["popular-languages"],
  { revalidate: 300, tags: ["home-popular"] }
);

/** Popular tutorials by completion count (from progress table). */
export const getPopularTutorials = unstable_cache(
  async (): Promise<PopularTutorial[]> => {
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
  },
  ["popular-tutorials"],
  { revalidate: 300, tags: ["home-popular"] }
);

/** Fallback when DB has no data: return all tutorial languages. */
export function getFallbackPopularLanguages(): PopularLanguage[] {
  return getAllLanguageSlugs()
    .map((slug) => ({ slug, config: getLanguageConfig(slug) }))
    .filter((e): e is { slug: string; config: NonNullable<ReturnType<typeof getLanguageConfig>> } => !!e.config)
    .map(({ slug, config }) => ({ slug, name: config.name, learnerCount: 0 }));
}
