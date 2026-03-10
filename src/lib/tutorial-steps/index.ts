import type { TutorialStep } from "./types";
import { goSteps } from "./go";
import { pythonSteps } from "./python";
import { cppSteps } from "./cpp";
import { javascriptSteps } from "./javascript";
import { javaSteps } from "./java";
import { rustSteps } from "./rust";
import { csharpSteps } from "./csharp";
import type { SupportedLanguage } from "../languages/types";
import { loadStepsFromContent } from "./load-from-content";
import { getAllTutorials } from "../tutorials";

/**
 * Steps per language. Fallback when content/<lang>/<slug>.steps.json is not present.
 *
 * HOW TO ADD A NEW LANGUAGE:
 *   1. Add language key to SupportedLanguage in src/lib/languages/types.ts
 *   2. Add language config in src/lib/languages/registry.ts
 *   3. Create src/lib/highlight-<lang>.ts and wire into registry getHighlighter()
 *   4. Create src/lib/languages/icons.ts entries (LANG_ICONS + PRACTICE_TAGLINES)
 *   5. Add Judge0 language ID to src/lib/judge0.ts
 *   6. Create content/<lang>/*.mdx tutorial files
 *   7. Create src/lib/tutorial-steps/<lang>/index.ts + step files
 *   8. Add the import and entry below in stepsByLanguage
 *   9. Add default starter in src/lib/practice/problems.ts (DEFAULT_X + switch case)
 *  10. Add exam content in src/lib/exams/content.ts (if certifications needed)
 *
 * Everything else (profile stats, tutorial pages, practice pages, sitemap, nav)
 * auto-updates from the registry and this map.
 */
const stepsByLanguage: Record<SupportedLanguage, Record<string, TutorialStep[]>> = {
  go:         goSteps,
  python:     pythonSteps,
  cpp:        cppSteps,
  javascript: javascriptSteps,
  java:       javaSteps,
  rust:       rustSteps,
  csharp:     csharpSteps,
};

/**
 * Get steps for a tutorial. Prefers content-driven steps from
 * content/<lang>/<slug>.steps.json (SEO-friendly, translatable); falls back to TS-defined steps.
 */
export function getSteps(
  lang: SupportedLanguage,
  tutorialSlug: string
): TutorialStep[] {
  const fromContent = loadStepsFromContent(lang, tutorialSlug);
  if (fromContent && fromContent.length > 0) return fromContent;
  return stepsByLanguage[lang]?.[tutorialSlug] ?? [];
}

export function getAllStepsForLanguage(
  lang: SupportedLanguage
): Record<string, TutorialStep[]> {
  const merged: Record<string, TutorialStep[]> = {
    ...(stepsByLanguage[lang] ?? {}),
  };

  for (const tutorial of getAllTutorials(lang)) {
    merged[tutorial.slug] = getSteps(lang, tutorial.slug);
  }

  return merged;
}

/**
 * Total number of lessons (steps) for a language across all tutorials.
 *
 * Used by: profile stats, homepage hero, tutorial cards, public profile.
 *
 * HOW TO ADD A NEW TUTORIAL:
 *   1. Create the MDX file:  content/<lang>/<slug>.mdx
 *   2. Create the steps via EITHER:
 *      a. content/<lang>/<slug>.steps.json  (preferred — content-driven, translatable)
 *      b. src/lib/tutorial-steps/<lang>/<slug>.ts  (TS fallback — export from lang index)
 *   3. That's it — lesson count updates automatically (60s cache on MDX scan).
 *
 * Resolution order:
 *   - First tries getAllTutorials(lang) which scans content/<lang>/*.mdx via fs.readdirSync
 *   - If that returns empty (e.g. serverless env without content/ bundled),
 *     falls back to TS step definitions in stepsByLanguage[lang]
 *   - For each tutorial slug, getSteps() prefers .steps.json, then TS definitions
 */
export function getTotalLessonCount(lang: SupportedLanguage): number {
  let slugs: string[] = getAllTutorials(lang).map((t) => t.slug);
  if (slugs.length === 0) {
    const stepMap = stepsByLanguage[lang];
    if (stepMap) slugs = Object.keys(stepMap);
  }
  let total = 0;
  for (const slug of slugs) {
    total += getSteps(lang, slug).length;
  }
  return total;
}

/** @deprecated Use getSteps(lang, slug) or getAllStepsForLanguage(lang). Kept for gradual migration. */
export const allSteps: Record<string, TutorialStep[]> = goSteps;

export type { TutorialStep };
