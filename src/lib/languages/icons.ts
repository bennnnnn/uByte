import type { SupportedLanguage } from "./types";

/** Shared language icons (emoji) for cards, hero, practice, etc. */
export const LANG_ICONS: Record<SupportedLanguage, string> = {
  go: "🐹",
  python: "🐍",
  cpp: "⚙️",
  javascript: "🟨",
  java: "☕",
  rust: "🦀",
  csharp: "💜",
};

/** Short taglines for practice section per language */
export const PRACTICE_TAGLINES: Record<SupportedLanguage, string> = {
  go: "Arrays, hashmaps & goroutines",
  python: "Clean syntax, fast prototyping",
  javascript: "Closures, callbacks & async",
  java: "OOP, generics & collections",
  rust: "Ownership, lifetimes & safety",
  cpp: "Pointers, STL & performance",
  csharp: "LINQ, async/await & .NET",
};

export function getLangIcon(slug: string): string {
  return LANG_ICONS[slug as SupportedLanguage] ?? "📝";
}
