"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";

interface Props {
  companies: string[];
  currentCompany: string;
  currentDifficulty: string;
  currentOutcome: string;
  currentSearch: string;
}

export default function InterviewFilters({
  companies,
  currentCompany,
  currentDifficulty,
  currentOutcome,
  currentSearch,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  const hasFilters = !!(currentCompany || currentDifficulty || currentOutcome || currentSearch);

  function buildUrl(overrides: Partial<Record<"company" | "difficulty" | "outcome" | "search", string>>) {
    const params = new URLSearchParams();
    const merged = {
      company: currentCompany,
      difficulty: currentDifficulty,
      outcome: currentOutcome,
      search: currentSearch,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    // Always reset to page 1 when a filter changes
    const qs = params.toString();
    return `/interviews${qs ? "?" + qs : ""}`;
  }

  function navigate(overrides: Partial<Record<"company" | "difficulty" | "outcome" | "search", string>>) {
    startTransition(() => router.push(buildUrl(overrides)));
  }

  function clearAll() {
    if (searchRef.current) searchRef.current.value = "";
    navigate({ company: "", difficulty: "", outcome: "", search: "" });
  }

  const selectClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 " +
    "focus:border-indigo-300 focus:outline-none " +
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 " +
    "transition-opacity";

  return (
    <div className={`mb-6 transition-opacity ${isPending ? "pointer-events-none opacity-50" : ""}`}>
      {/* Search */}
      <div className="relative mb-3">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          ref={searchRef}
          type="search"
          placeholder="Search by company or role…"
          defaultValue={currentSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate({ search: (e.currentTarget as HTMLInputElement).value });
            }
          }}
          onBlur={(e) => {
            const val = e.currentTarget.value;
            if (val !== currentSearch) navigate({ search: val });
          }}
          className={
            "w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-700 " +
            "placeholder:text-zinc-400 focus:border-indigo-300 focus:outline-none " +
            "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          }
        />
      </div>

      {/* Dropdown row */}
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <select
          value={currentCompany}
          onChange={(e) => navigate({ company: e.target.value })}
          className={selectClass}
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={currentDifficulty}
          onChange={(e) => navigate({ difficulty: e.target.value })}
          className={selectClass}
        >
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={currentOutcome}
          onChange={(e) => navigate({ outcome: e.target.value })}
          className={selectClass}
        >
          <option value="">All outcomes</option>
          <option value="offer">Got offer</option>
          <option value="rejection">Rejected</option>
          <option value="ongoing">Ongoing</option>
          <option value="ghosted">Ghosted</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="shrink-0 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
