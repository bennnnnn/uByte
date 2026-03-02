import type { SupportedLanguage } from "./types";

/** Minimal language list for UI (e.g. language switcher). Client-safe. */
export const LANGUAGE_DISPLAY_LIST: { id: SupportedLanguage; name: string; slug: string }[] = [
  { id: "go", name: "Go", slug: "go" },
  { id: "python", name: "Python", slug: "python" },
  { id: "cpp", name: "C++", slug: "cpp" },
];
