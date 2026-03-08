import type { TutorialStep } from "./types";
import { goSteps } from "./go";
import { pythonSteps } from "./python";
import { cppSteps } from "./cpp";
import { javascriptSteps } from "./javascript";
import { javaSteps } from "./java";
import { rustSteps } from "./rust";
import type { SupportedLanguage } from "../languages/types";
import { loadStepsFromContent } from "./load-from-content";
import { getAllTutorials } from "../tutorials";

/** Steps per language. Fallback when content/<lang>/<slug>.steps.json is not present. */
const stepsByLanguage: Record<SupportedLanguage, Record<string, TutorialStep[]>> = {
  go: goSteps,
  python: pythonSteps,
  cpp: cppSteps,
  javascript: javascriptSteps,
  java: javaSteps,
  rust: rustSteps,
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
