"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { tutorialUrl } from "@/lib/urls";
import { getLangIcon } from "@/lib/languages/icons";

interface SearchResult {
  slug: string;
  title: string;
  matchType: "tutorial" | "step";
  stepIndex?: number;
  stepTitle?: string;
  excerpt: string;
  lang?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NavSearch() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router       = useRouter();
  const pathname     = usePathname();
  const debouncedQ   = useDebounce(query, 200);

  // Fetch results
  useEffect(() => {
    const q = debouncedQ.trim();
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setResults((d.results ?? []).slice(0, 7)))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // ⌘K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") {
        setFocused(false);
        setQuery("");
        setResults([]);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close whenever route changes (user clicked a result)
  useEffect(() => {
    setFocused(false);
    setQuery("");
    setResults([]);
  }, [pathname]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setFocused(false);
  }

  function getResultHref(r: SearchResult): string {
    if (!r.lang) return `/search?q=${encodeURIComponent(query)}`;
    return r.matchType === "step" && r.stepIndex != null
      ? tutorialUrl(r.lang, r.slug, r.stepIndex)
      : tutorialUrl(r.lang, r.slug);
  }

  const showDropdown = focused && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          {/* Search icon */}
          <svg
            className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search tutorials…"
            autoComplete="off"
            aria-label="Search tutorials"
            className="w-56 rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-8 text-sm text-zinc-700 placeholder-zinc-400 outline-none transition-all duration-200 focus:w-72 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:placeholder-zinc-500 dark:focus:border-indigo-600 dark:focus:bg-zinc-800 dark:focus:ring-indigo-900/40"
          />

          {/* Right slot: spinner | clear */}
          <div className="pointer-events-none absolute right-2.5 flex items-center">
            {loading ? (
              <span className="pointer-events-none h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
            ) : query ? (
              <button
                type="button"
                aria-label="Clear search"
                className="pointer-events-auto text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40">
          {results.length > 0 ? (
            <>
              <ul role="listbox" aria-label="Search results">
                {results.map((r, i) => (
                  <li key={`${r.slug}-${i}`} role="option" aria-selected="false">
                    <Link
                      href={getResultHref(r)}
                      className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-100 text-sm dark:bg-zinc-800">
                        {getLangIcon(r.lang ?? "")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{r.title}</p>
                        {r.stepTitle && (
                          <p className="truncate text-xs text-indigo-500 dark:text-indigo-400">↳ {r.stepTitle}</p>
                        )}
                        {!r.stepTitle && r.excerpt && (
                          <p className="line-clamp-1 text-xs text-zinc-400 dark:text-zinc-500">{r.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  See all results for &ldquo;{query.trim()}&rdquo; →
                </Link>
              </div>
            </>
          ) : !loading ? (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-zinc-400">No results for &ldquo;{query.trim()}&rdquo;</p>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                className="mt-1 text-xs text-indigo-500 hover:underline"
              >
                Search all content →
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
