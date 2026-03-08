import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

export const EXAM_LANGS = ALL_LANGUAGE_KEYS;

export type ExamLang = SupportedLanguage;

// Number of questions per attempt.
export const EXAM_SIZE = 40;

// Duration per exam attempt in minutes.
export const EXAM_DURATION_MINUTES = 45;

// Default minimum score (%) to pass an exam.
// The live value is stored in site_settings and read via getExamPassPercent().
export const EXAM_PASS_PERCENT = 70;

export function isExamLang(lang: string): lang is ExamLang {
  return (EXAM_LANGS as string[]).includes(lang);
}

