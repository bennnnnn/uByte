"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TextLink } from "@/components/ui";
import { tutorialUrl } from "@/lib/urls";

interface SearchResult {
  slug: string;
  title: string;
  matchType: "tutorial" | "step";
  stepIndex?: number;
  stepTitle?: string;
  excerpt: string;
  lang?: string;
}

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const runSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 2) {
        setResults([]);
        setSearchError(false);
        return;
      }
      setLoading(true);
      setSearchError(false);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((d) => {
          setResults(d.results ?? []);
        })
        .catch(() => { setResults([]); setSearchError(true); })
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync query from URL
    setQuery(initialQ);
    runSearch(initialQ);
  }, [initialQ, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
      runSearch(trimmed);
    }
  };

  return (
    <>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        Search tutorial titles and lesson steps across all languages.
      </p>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            id="global-search"
            name="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tutorials and lessons..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            aria-label="Search"
          />
        </div>
      </form>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Searching…</span>
        </div>
      )}

      {!loading && searchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Search failed. Please try again.</p>
        </div>
      )}

      {!loading && !searchError && query.trim().length >= 2 && (
        <ul className="space-y-2">
          {results.length === 0 ? (
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Try different keywords or browse <TextLink href="/tutorial/go">tutorials</TextLink> and <TextLink href="/practice">interview prep</TextLink>.
              </p>
            </li>
          ) : (
            results.map((r, i) => {
              const lang = r.lang ?? "go";
              const href =
                r.matchType === "step" && r.stepIndex != null
                  ? tutorialUrl(lang, r.slug, r.stepIndex)
                  : tutorialUrl(lang, r.slug);
              return (
                <li key={`${r.lang}-${r.slug}-${r.stepIndex ?? 0}-${i}`}>
                  <a
                    href={href}
                    className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          r.matchType === "tutorial"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {r.matchType === "tutorial" ? "Tutorial" : "Step"}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {lang}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                      {r.stepTitle ?? r.title}
                    </p>
                    {r.matchType === "step" && (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {r.title}
                      </p>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {r.excerpt}
                    </p>
                  </a>
                </li>
              );
            })
          )}
        </ul>
      )}

      {!loading && query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Type at least 2 characters to search.
        </p>
      )}
    </>
  );
}
