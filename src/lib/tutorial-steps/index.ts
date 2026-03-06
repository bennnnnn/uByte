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
  return stepsByLanguage[lang] ?? {};
}

/**
 * Total number of lessons (steps) for a language across all tutorials.
 * Uses content-driven tutorial list when available (MDX); falls back to TS step keys
 * so the count is never 0 when we have step data (e.g. if content dir is missing at build time).
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
