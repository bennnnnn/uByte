"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tutorialUrl } from "@/lib/urls";

interface PopularLanguage {
  slug: string;
  name: string;
  completionCount: number;
}

interface PopularTutorial {
  lang: string;
  slug: string;
  title: string;
  completionCount: number;
}

interface PopularPracticeProblem {
  slug: string;
  title: string;
  viewCount: number;
}

interface HomePopularData {
  popularLanguages: PopularLanguage[];
  popularTutorials: PopularTutorial[];
  popularPracticeProblems: PopularPracticeProblem[];
}

export default function HomePopularSidebar() {
  const [data, setData] = useState<HomePopularData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home-popular")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <aside className="lg:pt-0" aria-label="Popular">
        <div className="space-y-6">
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/50" />
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/50" />
        </div>
      </aside>
    );
  }

  const languages = data?.popularLanguages ?? [];
  const tutorials = data?.popularTutorials ?? [];
  const practice = data?.popularPracticeProblems ?? [];

  return (
    <aside className="space-y-8 lg:pt-0" aria-label="Popular">
      {/* Popular programming languages */}
      <section aria-labelledby="popular-languages-heading">
        <h2 id="popular-languages-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Popular languages
        </h2>
        <ul className="space-y-2">
          {languages.length === 0 ? (
            <li className="text-sm text-zinc-500 dark:text-zinc-400">No data yet</li>
          ) : (
            languages.map(({ slug, name, completionCount }) => (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-indigo-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <span>{name}</span>
                  {completionCount > 0 && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {completionCount}
                    </span>
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Popular tutorials */}
      {tutorials.length > 0 && (
        <section aria-labelledby="popular-tutorials-heading">
          <h2 id="popular-tutorials-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Popular tutorials
          </h2>
          <ul className="space-y-2">
            {tutorials.map(({ lang, slug, title }) => (
              <li key={`${lang}-${slug}`}>
                <Link
                  href={tutorialUrl(lang, slug)}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-indigo-400 line-clamp-2"
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Popular interview questions */}
      <section aria-labelledby="popular-practice-heading">
        <h2 id="popular-practice-heading" className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Trending problems
        </h2>
        <ul className="space-y-2">
          {practice.length === 0 ? (
            <li className="text-sm text-zinc-500 dark:text-zinc-400">No data yet</li>
          ) : (
            practice.map(({ slug, title }) => (
              <li key={slug}>
                <Link
                  href={`/practice/go/${slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-indigo-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                >
                  <span className="line-clamp-1">{title}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
        <Link
          href="/practice"
          className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          All practice problems →
        </Link>
      </section>
    </aside>
  );
}
