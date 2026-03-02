"use client";

import Link from "next/link";
import type { PracticeProblem, Difficulty } from "@/lib/practice/types";

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy:   "bg-emerald-500",
  medium: "bg-amber-500",
  hard:   "bg-red-500",
};

const DIFFICULTY_TEXT: Record<Difficulty, string> = {
  easy:   "text-emerald-700 dark:text-emerald-400",
  medium: "text-amber-700 dark:text-amber-400",
  hard:   "text-red-700 dark:text-red-400",
};

interface Props {
  problems: PracticeProblem[];
  activeSlug: string;
  lang: string;
  onCollapse: () => void;
}

export default function ProblemSidebar({ problems, activeSlug, lang, onCollapse }: Props) {
  return (
    <nav className="flex h-full flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Collapse button row */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Problems
        </span>
        <button
          type="button"
          onClick={onCollapse}
          title="Collapse sidebar"
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Problem list */}
      <ul className="flex-1 overflow-y-auto py-1">
        {problems.map((p, idx) => {
          const isActive = p.slug === activeSlug;
          return (
            <li key={p.slug}>
              <Link
                href={`/practice/${lang}/${p.slug}`}
                className={`group flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                }`}
              >
                {/* Number */}
                <span
                  className={`w-5 shrink-0 text-right text-xs tabular-nums ${
                    isActive
                      ? "text-indigo-500 dark:text-indigo-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {idx + 1}.
                </span>

                {/* Title */}
                <span className="flex-1 truncate font-medium leading-snug">
                  {p.title}
                </span>

                {/* Difficulty dot */}
                <span
                  className={`flex shrink-0 items-center gap-1 text-xs font-medium capitalize ${DIFFICULTY_TEXT[p.difficulty]}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[p.difficulty]}`} />
                  {p.difficulty}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="shrink-0 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {problems.length} problem{problems.length !== 1 ? "s" : ""}
        </p>
      </div>
    </nav>
  );
}
