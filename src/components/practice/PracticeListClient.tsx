"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LANGUAGES, ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";
import { DIFFICULTY_BADGE, type Difficulty, type ProblemCategory } from "@/lib/practice/types";
import { getCategoryForSlug, getCategoryLabel } from "@/lib/practice/problems";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";

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
  /** All problems after server-side filters — used for instant client-side text search. */
  searchableProblems: PracticeListProblem[];
  attempts: Record<string, PracticeAttemptStatus>;
  hasUser: boolean;
  isPro: boolean;
  solvedCount: number;
  allProblemsLength: number;
  unlockedSlugs: string[];
  unlockedCount: number;
  allowance: number;
  maxFree: number;
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
  searchableProblems,
  attempts,
  hasUser,
  isPro,
  solvedCount,
  allProblemsLength,
  unlockedSlugs,
  unlockedCount,
  allowance,
  maxFree,
}: Props) {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(initialLang);
  const [searchQuery, setSearchQuery] = useState("");

  const unlockedSet = new Set(unlockedSlugs);
  const slotsRemaining = Math.max(0, allowance - unlockedCount);
  const isMaxed = unlockedCount >= maxFree;

  // When a search query is active, bypass server pagination and filter client-side.
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const isSearching = trimmedSearch.length > 0;
  const displayProblems = isSearching
    ? searchableProblems.filter((p) => p.title.toLowerCase().includes(trimmedSearch))
    : pageProblems;
  const displayStart = isSearching ? 0 : start;

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
      const difficulty = value === "" ? "" : value;
      router.push(buildUrl(selectedLang, { difficulty, page: 1 }), { scroll: false });
    },
    [router, selectedLang, buildUrl]
  );

  const config = LANGUAGES[selectedLang];

  const statusIcon = (slug: string) => {
    const s = attempts[slug];
    if (s === "solved") return "solved";
    if (s === "failed") return "failed";
    return "none";
  };

  const isLocked = (slug: string): boolean => {
    if (isPro) return false;
    if (!hasUser) return true;
    if (unlockedSet.has(slug)) return false;
    return slotsRemaining <= 0;
  };

  return (
    <div className="min-h-full overflow-y-auto">
      {/* Top: Language + title */}
      <section className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-2xl dark:bg-zinc-800">
                {getLangIcon(selectedLang)}
              </span>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                  {config?.name ?? selectedLang} Interview Prep
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {allProblemsLength} problems
                  {hasUser && (
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                      · You solved {solvedCount}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_LANGUAGE_KEYS.map((l2) => (
                <button
                  key={l2}
                  type="button"
                  onClick={() => handleLanguageClick(l2)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    l2 === selectedLang
                      ? "bg-indigo-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {getLangIcon(l2)} {LANGUAGES[l2]?.name}
                </button>
              ))}
            </div>
          </div>

          {/* Drip progress banner — only for logged-in free users */}
          {hasUser && !isPro && (
            <DripBanner
              unlockedCount={unlockedCount}
              allowance={allowance}
              maxFree={maxFree}
              slotsRemaining={slotsRemaining}
              isMaxed={isMaxed}
            />
          )}

          {/* Not logged in prompt */}
          {!hasUser && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 py-3 dark:border-indigo-900 dark:bg-indigo-950/30">
              <span className="text-lg">🔓</span>
              <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                <Link href="/auth?mode=signup" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                  Sign up free
                </Link>{" "}
                to unlock problems — 2 new ones every day.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        {/* Left: Category sidebar */}
        <aside className="shrink-0 border-b border-zinc-100 bg-surface-card dark:border-zinc-800 lg:w-56 lg:border-b-0 lg:border-r lg:py-6">
          <div className="px-4 py-4 lg:px-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Category
            </h2>
            <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-0" aria-label="Filter by category">
              <Link
                href={buildUrl(selectedLang, { category: "", status: statusFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                scroll={false}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:rounded-r-none lg:border-l-2 lg:pl-3 ${
                  categoryFilter === null
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={buildUrl(selectedLang, { category: cat, status: statusFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                  scroll={false}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:rounded-r-none lg:border-l-2 lg:pl-3 ${
                    categoryFilter === cat
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {getCategoryLabel(cat)}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right: Status + Difficulty above list, then problems */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {/* Search */}
          <div className="mb-4 relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems…"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          {/* Filters bar */}
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-surface-card p-4 dark:border-zinc-700">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status:</span>
              <div className="flex gap-2">
                <Link
                  href={buildUrl(selectedLang, { status: "", category: categoryFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                  scroll={false}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    statusFilter === null
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  All
                </Link>
                <Link
                  href={buildUrl(selectedLang, { status: "solved", category: categoryFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                  scroll={false}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    statusFilter === "solved"
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  ✓ Solved
                </Link>
                <Link
                  href={buildUrl(selectedLang, { status: "unsolved", category: categoryFilter ?? undefined, difficulty: difficultyFilter ?? undefined, page: 1 })}
                  scroll={false}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    statusFilter === "unsolved"
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  Not solved
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="difficulty-filter" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Difficulty:
              </label>
              <select
                id="difficulty-filter"
                value={difficultyFilter ?? ""}
                onChange={handleDifficultyChange}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <p className="ml-auto text-sm text-zinc-500 dark:text-zinc-400">
              Showing {isSearching ? displayProblems.length : sortedLength} problem{(isSearching ? displayProblems.length : sortedLength) !== 1 ? "s" : ""}
              {isSearching && ` for "${searchQuery.trim()}"`}
            </p>
          </div>

          {/* Problem list */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-surface-card shadow-sm dark:border-zinc-700">
            {isSearching && displayProblems.length === 0 && (
              <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
                <div className="mb-2 text-4xl">🔍</div>
                <p className="font-medium">No problems found for &quot;{searchQuery.trim()}&quot;</p>
                <p className="mt-1 text-sm">Try a different keyword.</p>
              </div>
            )}
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {displayProblems.map((p, idx) => {
                const cat = getCategoryForSlug(p.slug);
                const status = statusIcon(p.slug);
                const locked = isLocked(p.slug);
                return (
                  <li key={p.slug}>
                    <Link
                      href={locked ? "#" : buildProblemHref(p.slug)}
                      onClick={locked ? (e) => e.preventDefault() : undefined}
                      className={`group flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors sm:flex-nowrap ${
                        locked
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      }`}
                      aria-disabled={locked}
                    >
                      <span className="flex w-6 shrink-0 items-center justify-center" title={locked ? "Locked" : status === "solved" ? "Solved" : status === "failed" ? "Attempted" : "Not attempted"}>
                        {locked ? (
                          <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : status === "solved" ? (
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
                      <span className="w-7 shrink-0 text-center text-sm font-bold tabular-nums text-zinc-400 group-hover:text-indigo-500 dark:text-zinc-500 dark:group-hover:text-indigo-400">
                        {displayStart + idx + 1}
                      </span>
                      <span className="min-w-0 flex-1 font-medium text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                        {p.title}
                      </span>
                      {cat && (
                        <span className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {getCategoryLabel(cat)}
                        </span>
                      )}
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_BADGE[p.difficulty]}`}>
                        {p.difficulty}
                      </span>
                      {locked ? (
                        <svg className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 shrink-0 text-zinc-300 group-hover:text-indigo-500 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && !isSearching && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 bg-surface-card px-4 py-4 dark:border-zinc-700 sm:px-6">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Page {currentPage} of {totalPages}
                </p>
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  {currentPage > 1 ? (
                    <Link
                      href={buildUrl(selectedLang, { page: currentPage - 1, category: categoryFilter ?? undefined, status: statusFilter ?? undefined, difficulty: difficultyFilter ?? undefined })}
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
                          href={buildUrl(selectedLang, { page: p, category: categoryFilter ?? undefined, status: statusFilter ?? undefined, difficulty: difficultyFilter ?? undefined })}
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
                      href={buildUrl(selectedLang, { page: currentPage + 1, category: categoryFilter ?? undefined, status: statusFilter ?? undefined, difficulty: difficultyFilter ?? undefined })}
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
        </main>
      </div>
    </div>
  );
}

/** Progress banner showing how many free problems are unlocked vs available. */
function DripBanner({
  unlockedCount,
  allowance,
  maxFree,
  slotsRemaining,
  isMaxed,
}: {
  unlockedCount: number;
  allowance: number;
  maxFree: number;
  slotsRemaining: number;
  isMaxed: boolean;
}) {
  const pct = maxFree > 0 ? Math.round((unlockedCount / maxFree) * 100) : 0;

  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-surface-card p-4 dark:border-zinc-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isMaxed ? "🔒" : "🔓"}</span>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {unlockedCount} of {maxFree} free problems used
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isMaxed
                ? "You've used all your free problems."
                : slotsRemaining > 0
                  ? `${slotsRemaining} more available today — come back daily for more!`
                  : "Come back tomorrow for 2 more free problems!"}
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Unlock all →
        </Link>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isMaxed ? "bg-amber-500" : "bg-indigo-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
