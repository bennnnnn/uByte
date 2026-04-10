import type { SupportedLanguage } from "./types";

/** Shared language icons (emoji) for cards, hero, nav, etc. */
export const LANG_ICONS: Record<SupportedLanguage, string> = {
  go: "🐹",
  python: "🐍",
  cpp: "⚙️",
  javascript: "🟨",
  java: "☕",
  rust: "🦀",
  csharp: "💜",
  typescript: "🔷",
  sql: "🗄️",
};

/** Short taglines for language cards / marketing copy */
export const LANGUAGE_TAGLINES: Record<SupportedLanguage, string> = {
  go: "Arrays, hashmaps & goroutines",
  python: "Clean syntax, fast prototyping",
  javascript: "Closures, callbacks & async",
  java: "OOP, generics & collections",
  rust: "Ownership, lifetimes & safety",
  cpp: "Pointers, STL & performance",
  csharp: "LINQ, async/await & .NET",
  typescript: "Types, interfaces & generics",
  sql: "Queries, joins & aggregates",
};

export function getLangIcon(slug: string): string {
  return LANG_ICONS[slug as SupportedLanguage] ?? "📝";
}
