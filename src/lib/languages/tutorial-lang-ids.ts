/**
 * Canonical tutorial language IDs — single source for middleware, redirects, and tests.
 * Keep in sync with SupportedLanguage in types.ts (validated in registry.test.ts).
 */
export const TUTORIAL_LANG_IDS = [
  "go",
  "python",
  "cpp",
  "javascript",
  "java",
  "rust",
  "csharp",
  "typescript",
  "sql",
] as const;

export type TutorialLangId = (typeof TUTORIAL_LANG_IDS)[number];

export const TUTORIAL_LANG_SET = new Set<string>(TUTORIAL_LANG_IDS);

export function isTutorialLangId(lang: string): lang is TutorialLangId {
  return TUTORIAL_LANG_SET.has(lang);
}
