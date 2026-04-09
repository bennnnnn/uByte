/**
 * Shared exam-related constants used by legacy DB helpers (exam_questions, exam_lang_settings).
 * The certification UI and public exam flows were removed; these remain for data/API compatibility.
 */
import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

export const EXAM_LANGS = ALL_LANGUAGE_KEYS;

export type ExamLang = SupportedLanguage;

/** Default questions per attempt (overridden per lang in site_settings / exam_lang_settings). */
export const EXAM_SIZE = 40;

/** Default duration per attempt in minutes. */
export const EXAM_DURATION_MINUTES = 45;

/** Default minimum score (%) to pass (live value often in site_settings). */
export const EXAM_PASS_PERCENT = 70;

export function isExamLang(lang: string): lang is ExamLang {
  return (EXAM_LANGS as string[]).includes(lang);
}
