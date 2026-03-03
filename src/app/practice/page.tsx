import type { Metadata } from "next";
import Link from "next/link";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getCurrentUser } from "@/lib/auth";
import { getUserPlan } from "@/lib/db";
import { hasPaidAccess } from "@/lib/plans";
import UpgradeWall from "@/components/UpgradeWall";

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

export default async function PracticePage() {
  const user = await getCurrentUser();
  const plan = user ? await getUserPlan(user.userId) : "free";
  if (!hasPaidAccess(plan)) {
    return (
      <UpgradeWall
        tutorialTitle="Interview Practice"
        subtitle="Upgrade to unlock all practice problems, all tutorials, and AI feedback."
        backHref="/"
        backLabel="← Back to home"
      />
    );
  }

  const problems = getAllPracticeProblems();
  const easy   = problems.filter((p) => p.difficulty === "easy").length;
  const medium = problems.filter((p) => p.difficulty === "medium").length;
  const hard   = problems.filter((p) => p.difficulty === "hard").length;

  const langSlugs = getAllLanguageSlugs() as SupportedLanguage[];

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-14">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Interview Practice
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
            Sharpen your coding skills with classic interview problems. Pick your language, read the problem, and write real code in the browser — just like LeetCode.
          </p>
          <div className="mt-4 flex gap-3 text-sm">
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {easy} Easy
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              {medium} Medium
            </span>
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
              {hard} Hard
            </span>
          </div>
        </div>

        {/* Language cards */}
        <section aria-labelledby="lang-heading">
          <h2 id="lang-heading" className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Choose your language
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {langSlugs.map((slug) => {
              const config = LANGUAGES[slug];
              if (!config) return null;
              return (
                <Link
                  key={slug}
                  href={`/practice/${slug}`}
                  className="group flex flex-col rounded-xl border-2 border-indigo-100 bg-indigo-50/40 p-5 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/40"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-zinc-900">
                      {LANG_ICONS[slug] ?? "🎯"}
                    </span>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {config.name}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {LANG_DESC[slug] ?? `Solve problems in ${config.name}`}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    View {problems.length} problems →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Problem preview */}
        <section className="mt-12" aria-labelledby="preview-heading">
          <h2 id="preview-heading" className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Featured problems
          </h2>
          <ul className="space-y-2">
            {problems.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/practice/go/${p.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 transition-all hover:border-indigo-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
                >
                  <span className="flex-1 font-medium text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                    {p.title}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      p.difficulty === "easy"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : p.difficulty === "medium"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                    }`}
                  >
                    {p.difficulty}
                  </span>
                  <svg className="h-4 w-4 shrink-0 text-zinc-300 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
