import Link from "next/link";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon, PRACTICE_TAGLINES } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";
import LangCard from "./LangCard";

const PROBLEMS = [
  { label: "Two Sum",             diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Three Sum",           diff: "medium", color: "text-amber-600 dark:text-amber-400" },
  { label: "Maximum Subarray",    diff: "medium", color: "text-amber-600 dark:text-amber-400" },
  { label: "Trapping Rain Water", diff: "hard",   color: "text-red-600 dark:text-red-400" },
  { label: "Valid Parentheses",   diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Climbing Stairs",     diff: "easy",   color: "text-emerald-600 dark:text-emerald-400" },
];

interface PracticeSectionProps {
  problemCount?: number;
}

export default function PracticeSection({ problemCount = 11 }: PracticeSectionProps) {
  const moreCount = Math.max(0, problemCount - PROBLEMS.length);

  return (
    <section aria-labelledby="practice-heading" className="space-y-5">
      {/* Main practice CTA card */}
      <div className="overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-violet-50/40 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-violet-950/20">
        <div className="p-6 sm:p-8">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h2 id="practice-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Coding Interview Prep</h2>
            <span className="rounded-full border border-indigo-300 bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-700 dark:bg-zinc-900/80 dark:text-indigo-400">
              LeetCode-style
            </span>
          </div>
          <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
            Solve classic problems — Two Sum, LRU Cache, Merge Intervals and more — in any language. Same IDE, built right in.
          </p>

          <ul className="mb-5 space-y-1.5">
            {PROBLEMS.map((p) => (
              <li key={p.label} className="flex items-center gap-2.5 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{p.label}</span>
                <span className={`ml-auto shrink-0 text-xs font-semibold capitalize ${p.color}`}>{p.diff}</span>
              </li>
            ))}
            {moreCount > 0 && (
              <li className="pl-4 text-xs text-zinc-400">+ {moreCount} more problem{moreCount !== 1 ? "s" : ""}</li>
            )}
          </ul>

          <Link
            href="/practice"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Start interview prep
          </Link>
        </div>
      </div>

      {/* Per-language cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getAllLanguageSlugs().map((slug) => {
          const config = LANGUAGES[slug as SupportedLanguage];
          if (!config) return null;
          return (
            <LangCard
              key={slug}
              href={`/practice/${slug}`}
              icon={getLangIcon(slug)}
              name={config.name}
              badge={`${problemCount} problems`}
              description={PRACTICE_TAGLINES[slug as SupportedLanguage] ?? config.seo.defaultDescription}
              cta="Solve problems"
            />
          );
        })}
      </div>
    </section>
  );
}
