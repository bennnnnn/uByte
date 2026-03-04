import type { Metadata } from "next";
import Link from "next/link";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { FREE_PRACTICE_LIMIT } from "@/lib/plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interview Practice",
  description:
    "Solve classic coding interview problems in Go, Python, C++, JavaScript, Java, and Rust. Run your code in the browser.",
};

const LANG_ICONS: Record<string, string> = {
  go: "🐹", python: "🐍", cpp: "⚙️", javascript: "🟨", java: "☕", rust: "🦀",
};

const LANG_DESC: Record<string, string> = {
  go:         "Solve with Go's simplicity and performance",
  python:     "Solve with Python's clean, readable syntax",
  cpp:        "Solve with C++ for low-level control",
  javascript: "Solve with JavaScript in the browser",
  java:       "Solve with Java's robust type system",
  rust:       "Solve with Rust's safety and speed",
};

const DIFF_STYLES = {
  easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  hard:   "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
} as const;

export default async function PracticePage() {
  const problems = getAllPracticeProblems();
  const easy   = problems.filter((p) => p.difficulty === "easy").length;
  const medium = problems.filter((p) => p.difficulty === "medium").length;
  const hard   = problems.filter((p) => p.difficulty === "hard").length;

  const langSlugs = getAllLanguageSlugs() as SupportedLanguage[];
  const featured = problems.slice(0, 5);

  return (
    <div className="min-h-full overflow-y-auto">
      {/* ── Hero section with background ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-[600px] w-[600px] -translate-y-1/3 rounded-full bg-indigo-200/50 blur-[140px] dark:bg-indigo-500/15" />
          <div className="absolute -top-20 right-0 h-[500px] w-[500px] translate-x-1/4 rounded-full bg-violet-200/40 blur-[120px] dark:bg-violet-500/10" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-200/25 blur-[100px] dark:bg-cyan-500/10" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-14 pb-16 sm:pt-20 sm:pb-24">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
            <span className="text-base">🎯</span>
            LeetCode-style · Run in browser
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Interview{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              Practice
            </span>
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Sharpen your skills with classic problems — Two Sum, LRU Cache, Merge Intervals and more.
            Pick a language, write real code in the browser, get instant feedback. First{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{FREE_PRACTICE_LIMIT} problems free</span>{" "}
            per language; upgrade for full access.
          </p>

          {/* Difficulty stats */}
          <div className="flex flex-wrap gap-3">
            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${DIFF_STYLES.easy}`}>
              {easy} Easy
            </span>
            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${DIFF_STYLES.medium}`}>
              {medium} Medium
            </span>
            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${DIFF_STYLES.hard}`}>
              {hard} Hard
            </span>
          </div>
        </div>
      </section>

      {/* ── Choose language ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="lang-heading"
        className="border-t border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30"
      >
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <h2 id="lang-heading" className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Pick your language
          </h2>
          <p className="mb-10 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Choose your language
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {langSlugs.map((slug) => {
              const config = LANGUAGES[slug];
              if (!config) return null;
              return (
                <Link
                  key={slug}
                  href={`/practice/${slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-600 dark:hover:shadow-indigo-500/5"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-4 -translate-y-4 rounded-full bg-indigo-100/80 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-indigo-500/10" />
                  <div className="relative mb-4 flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-2xl shadow-inner dark:bg-zinc-800">
                      {LANG_ICONS[slug] ?? "🎯"}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {config.name}
                      </h3>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {problems.length} problems
                      </p>
                    </div>
                  </div>
                  <p className="relative mb-5 flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {LANG_DESC[slug] ?? `Solve problems in ${config.name}`}
                  </p>
                  <span className="relative inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-[gap] group-hover:gap-3 dark:text-indigo-400">
                    View problems
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured problems ───────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 dark:border-zinc-800" aria-labelledby="preview-heading">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <h2 id="preview-heading" className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Try these first
          </h2>
          <p className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Featured problems
          </p>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {featured.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`/practice/go/${p.slug}`}
                    className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-zinc-300 group-hover:text-indigo-500 dark:text-zinc-500 dark:group-hover:text-indigo-400">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-semibold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {p.title}
                    </span>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${DIFF_STYLES[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                    <svg className="h-5 w-5 shrink-0 text-zinc-300 transition-colors group-hover:text-indigo-500 dark:text-zinc-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-zinc-100 bg-zinc-50/80 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <Link
                href="/practice/go"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all {problems.length} problems in Go
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
