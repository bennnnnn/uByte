// Central configuration for practice exams (MCQ).
// Keeps exam languages and sizing consistent across APIs, DB helpers, and UI.

export const EXAM_LANGS = ["go", "python", "javascript", "java", "rust", "cpp"] as const;

export type ExamLang = (typeof EXAM_LANGS)[number];

export const EXAM_SIZE = 40;

export function isExamLang(lang: string): lang is ExamLang {
  return (EXAM_LANGS as readonly string[]).includes(lang);
}

