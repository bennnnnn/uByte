"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import type { Difficulty, ProblemCategory } from "@/lib/practice/types";
import { getCategoryForSlug, getCategoryLabel } from "@/lib/practice/problems";
import { isPracticeProblemFree } from "@/lib/plans";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";

const LANG_ICONS: Record<string, string> = {
  go: "🐹", python: "🐍", cpp: "⚙️", javascript: "🟨", java: "☕", rust: "🦀",
};

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
};

export interface PracticeListProblem {
  slug: string;
  title: string;
  difficulty: Difficulty;
}

interface Props {
  initialLang: SupportedLanguage;
  categories: ProblemCategory[];
  categoryFilter: ProblemCategory | null;
  statusFilter: "solved" | "unsolved" | null;
  difficultyFilter: Difficulty | null;
  currentPage: number;
  totalPages: number;
  start: number;
  sortedLength: number;
  pageProblems: PracticeListProblem[];
  attempts: Record<string, PracticeAttemptStatus>;
  hasUser: boolean;
  solvedCount: number;
  allProblemsLength: number;
}

function buildQueryString(opts: { category?: string; status?: string; difficulty?: string; page?: number }): string {
  const u = new URLSearchParams();
  if (opts.category != null && opts.category !== "") u.set("category", opts.category);
  if (opts.status != null && opts.status !== "") u.set("status", opts.status);
  if (opts.difficulty != null && opts.difficulty !== "") u.set("difficulty", opts.difficulty);
  if (opts.page != null && opts.page !== 1) u.set("page", String(opts.page));
  return u.toString();
}

export function PracticeListClient({
  initialLang,
  categories,
  categoryFilter,
  statusFilter,
  difficultyFilter,
  currentPage,
  totalPages,
  start,
  sortedLength,
  pageProblems,
  attempts,
  hasUser,
  solvedCount,
  allProblemsLength,
}: Props) {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(initialLang);

  const buildUrl = useCallback(
    (lang: SupportedLanguage, opts: { page?: number; category?: string; status?: string; difficulty?: string }) => {
      const q = buildQueryString({
        category: opts.category ?? categoryFilter ?? undefined,
        status: opts.status ?? statusFilter ?? undefined,
        difficulty: opts.difficulty ?? difficultyFilter ?? undefined,
        page: opts.page ?? currentPage,
      });
      return `/practice/${lang}${q ? `?${q}` : ""}`;
    },
    [categoryFilter, statusFilter, difficultyFilter, currentPage]
  );

  const buildProblemHref = useCallback(
    (slug: string) => {
      const q = buildQueryString({
        category: categoryFilter ?? undefined,
        status: statusFilter ?? undefined,
        difficulty: difficultyFilter ?? undefined,
        page: currentPage > 1 ? currentPage : undefined,
      });
      return `/practice/${selectedLang}/${slug}${q ? `?${q}` : ""}`;
    },
    [selectedLang, categoryFilter, statusFilter, difficultyFilter, currentPage]
  );

  const handleLanguageClick = useCallback(
    (l2: SupportedLanguage) => {
      setSelectedLang(l2);
      const q = buildQueryString({
        category: categoryFilter ?? undefined,
        status: statusFilter ?? undefined,
        difficulty: difficultyFilter ?? undefined,
        page: currentPage > 1 ? currentPage : undefined,
      });
      const url = `/practice/${l2}${q ? `?${q}` : ""}`;
      window.history.replaceState(null, "", url);
    },
    [categoryFilter, statusFilter, difficultyFilter, currentPage]
  );

  const handleDifficultyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const difficulty = value === "" ? undefined : value;
      router.push(buildUrl(selectedLang, { difficulty, page: 1 }), { scroll: false });
    },
    [router, selectedLang, buildUrl]
  );

  const config = LANGUAGES[selectedLang];
  const PROBLEMS_PER_PAGE = 35;

  const statusIcon = (slug: string) => {
    const s = attempts[slug];
    if (s === "solved") return "solved";
    if (s === "failed") return "failed";
    return "none";
  };

  return (
    <div className="min-h-full overflow-y-auto">
      {/* Hero header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[400px] w-[400px] -translate-y-1/4 rounded-full bg-indigo-200/40 blur-[120px] dark:bg-indigo-500/10" />
          <div className="absolute -top-20 right-0 h-[320px] w-[320px] translate-x-1/4 rounded-full bg-violet-200/30 blur-[100px] dark:bg-violet-500/10" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-10 sm:py-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">
              {LANG_ICONS[selectedLang] ?? "🎯"}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {config?.name ?? selectedLang} Interview Practice
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {allProblemsLength} problems · by category & difficulty
              </p>
              {hasUser && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {solvedCount} of {allProblemsLength} solved
                    </span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-500"
                        style={{ width: `${allProblemsLength ? (solvedCount / allProblemsLength) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language tabs — client-side switch, no navigation */}
          <div className="flex flex-wrap gap-2">
            {(["go", "python", "cpp", "javascript", "java", "rust"] as SupportedLanguage[]).map((l2) => (
              <button
                key={l2}
                type="button"
                onClick={() => handleLanguageClick(l2)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  l2 === selectedLang
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
                }`}
              >
                {LANG_ICONS[l2]} {LANGUAGES[l2]?.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category + Status filter */}
      <section className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildUrl(selectedLang, { category: "", status: statusFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                  scroll={false}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    categoryFilter === null
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  } dark:border dark:border-zinc-700`}
                >
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={buildUrl(selectedLang, { category: cat, status: statusFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      categoryFilter === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    } dark:border dark:border-zinc-700`}
                  >
                    {getCategoryLabel(cat)}
                  </Link>
                ))}
              </div>
            </div>
            {hasUser && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildUrl(selectedLang, { status: "", category: categoryFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === null
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    } dark:border dark:border-zinc-700`}
                  >
                    All
                  </Link>
                  <Link
                    href={buildUrl(selectedLang, { status: "solved", category: categoryFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === "solved"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    } dark:border dark:border-zinc-700`}
                  >
                    ✓ Solved
                  </Link>
                  <Link
                    href={buildUrl(selectedLang, { status: "unsolved", category: categoryFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter === "unsolved"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    } dark:border dark:border-zinc-700`}
                  >
                    Not solved
                  </Link>
                </div>
              </div>
            )}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Difficulty
              </p>
              <select
                value={difficultyFilter ?? ""}
                onChange={handleDifficultyChange}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Problem list */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {pageProblems.map((p, idx) => {
              const free = isPracticeProblemFree(p.slug);
              const cat = getCategoryForSlug(p.slug);
              const status = statusIcon(p.slug);
              return (
                <li key={p.slug}>
                  <Link
                    href={buildProblemHref(p.slug)}
                    className="group flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:flex-nowrap"
                  >
                    <span className="flex w-6 shrink-0 items-center justify-center" title={status === "solved" ? "Solved" : status === "failed" ? "Attempted" : "Not attempted"}>
                      {status === "solved" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </span>
                      ) : status === "failed" ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
                      )}
                    </span>
                    <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-zinc-400 group-hover:text-indigo-500 dark:text-zinc-500 dark:group-hover:text-indigo-400">
                      {start + idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {p.title}
                    </span>
                    {cat && (
                      <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {getCategoryLabel(cat)}
                      </span>
                    )}
                    {!free && (
                      <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        Pro
                      </span>
                    )}
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_STYLES[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-zinc-300 group-hover:text-indigo-500 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 bg-zinc-50/80 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800/50 sm:px-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing {start + 1}–{Math.min(start + PROBLEMS_PER_PAGE, sortedLength)} of {sortedLength}
              </p>
              <nav className="flex items-center gap-1" aria-label="Pagination">
                {currentPage > 1 ? (
                  <Link
                    href={buildUrl(selectedLang, { page: currentPage - 1, category: categoryFilter ?? undefined, status: statusFilter ?? undefined })}
                    scroll={false}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                    ← Previous
                  </span>
                )}
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
                    p === currentPage ? (
                      <span
                        key={p}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
                        aria-current="page"
                      >
                        {p}
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={buildUrl(selectedLang, { page: p, category: categoryFilter ?? undefined, status: statusFilter ?? undefined })}
                        scroll={false}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        {p}
                      </Link>
                    )
                  )}
                </div>
                {currentPage < totalPages ? (
                  <Link
                    href={buildUrl(selectedLang, { page: currentPage + 1, category: categoryFilter ?? undefined, status: statusFilter ?? undefined })}
                    scroll={false}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                    Next →
                  </span>
                )}
              </nav>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
