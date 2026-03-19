"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NavSearch() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef= useRef<HTMLDivElement>(null);
  const router      = useRouter();
  const debouncedQ  = useDebounce(query, 220);

  // Live fetch as query changes
  useEffect(() => {
    const q = debouncedQ.trim();
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setResults((d.results ?? []).slice(0, 8)))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setFocused(false);
        setQuery("");
        setResults([]);
      }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setFocused(false);
    setOpen(false);
  }

  function clearAndClose() {
    setQuery("");
    setResults([]);
    setOpen(false);
    setFocused(false);
  }

  function getResultHref(r: SearchResult): string {
    if (!r.lang) return `/search?q=${encodeURIComponent(query)}`;
    return r.matchType === "step" && r.stepIndex != null
      ? tutorialUrl(r.lang, r.slug, r.stepIndex)
      : tutorialUrl(r.lang, r.slug);
  }

  const showDropdown = focused && query.trim().length >= 2;

  // Collapsed trigger
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); setTimeout(() => { inputRef.current?.focus(); setFocused(true); }, 0); }}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 transition-all hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-zinc-600"
        aria-label="Search (⌘K)"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search tutorials…</span>
        <kbd className="ml-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
          ⌘K
        </kbd>
      </button>
    );
  }

  // Expanded search with live dropdown
  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          {/* Search icon */}
          <svg className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => { setQuery(e.target.value); setFocused(true); }}
            onFocus={() => setFocused(true)}
            placeholder="Search tutorials, topics, languages…"
            autoComplete="off"
            className="w-72 rounded-xl border border-indigo-300 bg-white py-2 pl-9 pr-10 text-sm text-zinc-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-indigo-900/50"
          />

          {/* Loading spinner / clear / esc */}
          <div className="absolute right-2.5 flex items-center gap-1">
            {loading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
            ) : query ? (
              <button type="button" onClick={clearAndClose} className="text-zinc-400 hover:text-zinc-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                esc
              </kbd>
            )}
          </div>
        </div>
      </form>

      {/* Live results dropdown */}
      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          {results.length > 0 ? (
            <>
              <ul>
                {results.map((r, i) => (
                  <li key={`${r.slug}-${i}`}>
                    <Link
                      href={getResultHref(r)}
                      onClick={clearAndClose}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                    >
                      {/* Language icon */}
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-xs dark:bg-indigo-950/50">
                        {r.lang === "go"         ? "🐹"
                         : r.lang === "python"     ? "🐍"
                         : r.lang === "javascript" ? "🟨"
                         : r.lang === "typescript" ? "🔷"
                         : r.lang === "java"       ? "☕"
                         : r.lang === "rust"       ? "🦀"
                         : r.lang === "cpp"        ? "⚙️"
                         : r.lang === "csharp"     ? "💜"
                         : r.lang === "sql"        ? "🗄️"
                         : "📄"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {r.title}
                        </p>
                        {r.stepTitle && (
                          <p className="truncate text-xs text-indigo-500 dark:text-indigo-400">
                            Step: {r.stepTitle}
                          </p>
                        )}
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">{r.excerpt}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* View all link */}
              <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={clearAndClose}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  View all results for &ldquo;{query.trim()}&rdquo; →
                </Link>
              </div>
            </>
          ) : !loading ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-zinc-400">No results for &ldquo;{query.trim()}&rdquo;</p>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={clearAndClose}
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
