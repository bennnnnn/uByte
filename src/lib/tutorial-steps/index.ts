import type { TutorialStep } from "./types";
import { goSteps } from "./go";
import { pythonSteps } from "./python";
import { cppSteps } from "./cpp";
import type { SupportedLanguage } from "../languages/types";

/** Steps per language. Add more languages here as they are translated. */
const stepsByLanguage: Record<SupportedLanguage, Record<string, TutorialStep[]>> = {
  go: goSteps,
  python: pythonSteps,
  cpp: cppSteps,
  javascript: {},
  java: {},
  rust: {},
};

export function getSteps(
  lang: SupportedLanguage,
  tutorialSlug: string
): TutorialStep[] {
  return stepsByLanguage[lang]?.[tutorialSlug] ?? [];
}

export function getAllStepsForLanguage(
  lang: SupportedLanguage
): Record<string, TutorialStep[]> {
  return stepsByLanguage[lang] ?? {};
}

/** @deprecated Use getSteps(lang, slug) or getAllStepsForLanguage(lang). Kept for gradual migration. */
export const allSteps: Record<string, TutorialStep[]> = goSteps;

export type { TutorialStep };
