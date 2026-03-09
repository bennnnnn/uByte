"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type PracticeProblem, type ProblemCategory } from "@/lib/practice/types";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";
import { getCategoryLabel } from "@/lib/practice/problems";

const PAGE_SIZE = 20;

interface ListQuery {
  category?: string;
  page?: number;
  status?: string;
  difficulty?: string;
}

interface Props {
  problems: PracticeProblem[];
  activeSlug: string;
  lang: string;
  onCollapse: () => void;
  statuses: Record<string, PracticeAttemptStatus>;
  listQuery?: ListQuery;
  /** Pre-select a category (e.g. when navigating from a filtered list page). */
  initialCategory?: ProblemCategory;
}

function buildListQueryString(q: ListQuery | undefined): string {
  if (!q || (!q.category && !q.page && !q.status && !q.difficulty)) return "";
  const params = new URLSearchParams();
  if (q.category) params.set("category", q.category);
  if (q.page != null && q.page > 1) params.set("page", String(q.page));
  if (q.status) params.set("status", q.status);
  if (q.difficulty) params.set("difficulty", q.difficulty);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function ProblemSidebar({
  problems,
  activeSlug,
  lang,
  onCollapse,
  statuses,
  listQuery,
  initialCategory,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | "all">(
    initialCategory ?? "all"
  );
  const [page, setPage] = useState(1);

  // Unique categories present in this problem set
  const availableCategories = useMemo<ProblemCategory[]>(() => {
    const seen = new Set<ProblemCategory>();
    for (const p of problems) {
      if (p.category) seen.add(p.category);
    }
    return [...seen];
  }, [problems]);

  // Filter by selected category
  const filtered = useMemo(
    () =>
      selectedCategory === "all"
        ? problems
        : problems.filter((p) => p.category === selectedCategory),
    [problems, selectedCategory]
  );

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageProblems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleCategoryChange(cat: ProblemCategory | "all") {
    setSelectedCategory(cat);
    setPage(1);
  }

  const queryString = buildListQueryString(listQuery);

  return (
    <nav className="flex h-full flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="shrink-0 space-y-2 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
        {/* Title row + collapse */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Problems
          </span>
          <button
            type="button"
            onClick={onCollapse}
            title="Collapse sidebar"
            className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Category dropdown */}
        {availableCategories.length > 0 && (
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as ProblemCategory | "all")}
              className="w-full appearance-none rounded-lg border border-zinc-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-zinc-700 shadow-sm transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-indigo-600"
            >
              <option value="all">All Categories ({problems.length})</option>
              {availableCategories.map((cat) => {
                const count = problems.filter((p) => p.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)} ({count})
                  </option>
                );
              })}
            </select>
            {/* Custom chevron */}
            <svg
              className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Problem list ─────────────────────────────────── */}
      <ul className="flex-1 overflow-y-auto py-1">
        {pageProblems.length === 0 ? (
          <li className="px-4 py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
            No problems in this category.
          </li>
        ) : (
          pageProblems.map((p, idx) => {
            const isActive = p.slug === activeSlug;
            const status   = statuses[p.slug];
            const globalIdx = (page - 1) * PAGE_SIZE + idx + 1;
            return (
              <li key={p.slug}>
                <Link
                  href={`/practice/${lang}/${p.slug}${queryString}`}
                  className={`group flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <span
                    className={`w-5 shrink-0 text-right text-xs tabular-nums ${
                      isActive ? "text-indigo-400" : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {globalIdx}.
                  </span>
                  <span className="flex-1 truncate font-medium leading-snug" title={p.title}>
                    {p.title}
                  </span>
                  <StatusDot status={status} />
                </Link>
              </li>
            );
          })
        )}
      </ul>

      {/* ── Pagination ───────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between gap-2 border-t border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-6 w-6 items-center justify-center rounded text-sm text-zinc-500 transition-colors hover:bg-zinc-200 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            ‹
          </button>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-6 w-6 items-center justify-center rounded text-sm text-zinc-500 transition-colors hover:bg-zinc-200 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            ›
          </button>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="shrink-0 border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
        <div className="flex flex-col gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <span>
            {filtered.length !== problems.length
              ? `${filtered.length} of ${problems.length} problems`
              : `${problems.length} problem${problems.length !== 1 ? "s" : ""}`}
          </span>
          <div className="flex items-center gap-2">
            <Link href={`/practice/${lang}${queryString}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
              ← Back to list
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <Link href="/practice" className="hover:text-indigo-600 dark:hover:text-indigo-400">
              All languages →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** Small status circle: grey = untried, green = solved, red = failed */
function StatusDot({ status }: { status: PracticeAttemptStatus | undefined }) {
  if (!status) {
    return (
      <span
        title="Not attempted"
        className="h-3 w-3 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-600"
      />
    );
  }
  if (status === "solved") {
    return (
      <span title="Solved" className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-emerald-500">
        <svg className="h-2 w-2 text-white" viewBox="0 0 8 8" fill="currentColor">
          <path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
    );
  }
  return (
    <span title="Attempted — not passing" className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-red-500">
      <svg className="h-2 w-2 text-white" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 2l4 4M6 2L2 6" />
      </svg>
    </span>
  );
}
