import type { SupportedLanguage } from "@/lib/languages/types";
import { isSupportedLanguage } from "@/lib/languages/registry";

const ALIAS: Record<string, SupportedLanguage> = {
  js: "javascript",
  ts: "typescript",
  cpp: "cpp",
  "c++": "cpp",
  csharp: "csharp",
  "c#": "csharp",
};

/** Map blog tags (e.g. "Go", "C++") to tutorial language slugs for deep links. */
export function tutorialLanguagesFromTags(tags: string[]): SupportedLanguage[] {
  const out: SupportedLanguage[] = [];
  for (const raw of tags) {
    const k = raw.trim().toLowerCase();
    const lang: SupportedLanguage | undefined = isSupportedLanguage(k)
      ? k
      : ALIAS[k];
    if (lang && !out.includes(lang)) out.push(lang);
  }
  return out.slice(0, 5);
}
