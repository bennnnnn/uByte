"use client";

import Link from "next/link";
import type { PracticeProblem, Difficulty } from "@/lib/practice/types";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";

const DIFF_BADGE: Record<Difficulty, string> = {
  easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  medium: "bg-amber-100   text-amber-700   dark:bg-amber-950/60   dark:text-amber-400",
  hard:   "bg-red-100     text-red-700     dark:bg-red-950/60     dark:text-red-400",
};

interface ListQuery {
  category?: string;
  page?: number;
}

interface Props {
  problems: PracticeProblem[];
  activeSlug: string;
  lang: string;
  onCollapse: () => void;
  /** slug → attempt status; undefined means not yet attempted */
  statuses: Record<string, PracticeAttemptStatus>;
  /** When set, problem links and "back to list" preserve this filter (e.g. from list page). */
  listQuery?: ListQuery;
}

function buildListQueryString(q: ListQuery | undefined): string {
  if (!q || (!q.category && !q.page)) return "";
  const params = new URLSearchParams();
  if (q.category) params.set("category", q.category);
  if (q.page != null && q.page > 1) params.set("page", String(q.page));
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
}: Props) {
  const queryString = buildListQueryString(listQuery);
  const easy   = problems.filter((p) => p.difficulty === "easy").length;
  const medium = problems.filter((p) => p.difficulty === "medium").length;
  const hard   = problems.filter((p) => p.difficulty === "hard").length;

  return (
    <nav className="flex h-full flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      {/* ── Header: difficulty summary + collapse button ─── */}
      <div className="shrink-0 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
        {/* Difficulty badges row */}
        <div className="mb-2 flex items-center gap-1.5 flex-wrap">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFF_BADGE.easy}`}>
            {easy} Easy
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFF_BADGE.medium}`}>
            {medium} Medium
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFF_BADGE.hard}`}>
            {hard} Hard
          </span>
        </div>
        {/* Collapse button */}
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
      </div>

      {/* ── Problem list ────────────────────────────────── */}
      <ul className="flex-1 overflow-y-auto py-1">
        {problems.map((p, idx) => {
          const isActive = p.slug === activeSlug;
          const status   = statuses[p.slug];

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
                {/* Row number */}
                <span
                  className={`w-5 shrink-0 text-right text-xs tabular-nums ${
                    isActive ? "text-indigo-400" : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {idx + 1}.
                </span>

                {/* Title */}
                <span className="flex-1 truncate font-medium leading-snug">
                  {p.title}
                </span>

                {/* Status circle — replaces the old difficulty tag */}
                <StatusDot status={status} />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ── Footer ──────────────────────────────────────── */}
      <div className="shrink-0 border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
        <div className="flex flex-col gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <span>{problems.length} problems{queryString ? " in this category" : ""}</span>
          <div className="flex items-center gap-2">
            <Link
              href={`/practice/${lang}${queryString}`}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              ← Back to list
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <Link
              href="/practice"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
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
    // Not attempted — empty circle outline
    return (
      <span
        title="Not attempted"
        className="h-3 w-3 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-600"
      />
    );
  }
  if (status === "solved") {
    return (
      <span
        title="Solved"
        className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-emerald-500"
      >
        <svg className="h-2 w-2 text-white" viewBox="0 0 8 8" fill="currentColor">
          <path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
    );
  }
  // failed
  return (
    <span
      title="Attempted — not passing"
      className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-red-500"
    >
      <svg className="h-2 w-2 text-white" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 2l4 4M6 2L2 6" />
      </svg>
    </span>
  );
}
