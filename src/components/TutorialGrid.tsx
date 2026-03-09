"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { tutorialUrl } from "@/lib/urls";

type Difficulty = "beginner" | "intermediate" | "advanced";
type DifficultyFilter = "all" | Difficulty;

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  beginner:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  advanced:     "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

interface Tutorial {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
}

export default function TutorialGrid({
  lang,
  tutorials,
  stepCountBySlug = {},
  totalLessons,
}: {
  lang: string;
  tutorials: Tutorial[];
  stepCountBySlug?: Record<string, number>;
  /** Pre-computed total from getTotalLessonCount — must match the LangCard badge. */
  totalLessons?: number;
}) {
  const { user, progress } = useAuth();

  // Prefer the server-computed total (same value shown in LangCard).
  // Fall back to summing stepCountBySlug, then to topic count.
  const computedTotal = Object.values(stepCountBySlug).reduce((s, n) => s + n, 0);
  const totalCount = totalLessons ?? (computedTotal > 0 ? computedTotal : tutorials.length);

  // Sum step counts for each completed topic slug; fall back to counting topics.
  const completedCount = computedTotal > 0
    ? progress.reduce((s, slug) => s + (stepCountBySlug[slug] ?? 0), 0)
    : progress.length;
  const [query, setQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>("all");

  const filtered = tutorials.filter((t) => {
    if (diffFilter !== "all" && t.difficulty !== diffFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      {user && totalCount > 0 && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              Your Progress
            </span>
            <span className="text-zinc-600 dark:text-zinc-300">
              {completedCount} / {totalCount} lessons completed
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Difficulty filter */}
      <div className="mb-4 flex gap-1.5 flex-wrap">
        {(["all", "beginner", "intermediate", "advanced"] as DifficultyFilter[]).map((d) => (
          <button
            key={d}
            onClick={() => setDiffFilter(d)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              diffFilter === d
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {d === "all" ? "All" : d}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tutorials..."
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
          <div className="mb-2 text-4xl">🔍</div>
          <p className="font-medium">No tutorials found for &quot;{query}&quot;</p>
          <p className="mt-1 text-sm">Try a different keyword.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((tutorial, i) => {
            const isCompleted = progress.includes(tutorial.slug);
            const originalIndex = tutorials.indexOf(tutorial);
            return (
              <Link
                key={tutorial.slug}
                href={tutorialUrl(lang, tutorial.slug)}
                className="group relative rounded-xl border border-zinc-200 p-5 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-indigo-800"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isCompleted
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      (query ? originalIndex : i) + 1
                    )}
                  </span>
                  <h3 className="text-base font-semibold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                    {tutorial.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {tutorial.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[tutorial.difficulty]}`}>
                    {tutorial.difficulty}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">⏱ {tutorial.estimatedMinutes} min</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
