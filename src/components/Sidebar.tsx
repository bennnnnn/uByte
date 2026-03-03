"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNavState } from "@/hooks/useNavState";
import { useAuth } from "@/components/AuthProvider";
import { FREE_TUTORIAL_LIMIT, hasPaidAccess } from "@/lib/plans";
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

interface SubTopic {
  id: string;
  title: string;
}

interface SidebarItem {
  slug: string;
  title: string;
  order: number;
  subtopics: SubTopic[];
}

export default function Sidebar({ lang, tutorials }: { lang: string; tutorials: SidebarItem[] }) {
  const { pathname, expanded, activeHash, toggleExpand } = useNavState(tutorials, lang);
  const { progress, profile } = useAuth();
  const userHasPaidAccess = hasPaidAccess(profile?.plan);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const queryLongEnough = query.trim().length >= 2;
  const displayResults = queryLongEnough ? searchResults : [];
  const displayShowDropdown = queryLongEnough && showDropdown;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!queryLongEnough) return;
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          setSearchResults(d.results ?? []);
          setShowDropdown(true);
        })
        .catch(() => {});
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, queryLongEnough]);

  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onFocus={() => displayResults.length > 0 && setShowDropdown(true)}
            placeholder="Search lessons..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-8 text-sm text-zinc-700 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setShowDropdown(false); setSearchResults([]); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Search dropdown */}
          {displayShowDropdown && displayResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {displayResults.map((r, i) => (
                <button
                  key={i}
                  onMouseDown={() => {
                    const resultLang = r.lang ?? lang;
                    const href = r.matchType === "step" && r.stepIndex !== undefined
                      ? tutorialUrl(resultLang, r.slug, r.stepIndex)
                      : tutorialUrl(resultLang, r.slug);
                    setShowDropdown(false);
                    setQuery("");
                    router.push(href);
                  }}
                  className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${r.matchType === "tutorial" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                      {r.matchType === "tutorial" ? "Tutorial" : "Step"}
                    </span>
                    <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {r.stepTitle ?? r.title}
                    </span>
                  </div>
                  {r.matchType === "step" && (
                    <span className="pl-1 text-xs text-zinc-400">{r.title}</span>
                  )}
                  <p className="line-clamp-1 pl-1 text-xs text-zinc-400">{r.excerpt}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mb-2 px-3 text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Lessons
        </p>

        <ul className="space-y-0.5">
          {(() => {
            const q = query.toLowerCase();
            const filtered = tutorials
              .filter((tutorial) => tutorial.title.toLowerCase().includes(q));
            if (filtered.length === 0) {
              return <li className="px-3 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">No lessons found</li>;
            }
            return filtered.map((tutorial) => {
              const href = tutorialUrl(lang, tutorial.slug);
              const isOnThisPage = pathname === href;
              const isExpanded = expanded === tutorial.slug;
              const isCompleted = progress.includes(tutorial.slug);
              const isLocked = tutorial.order > FREE_TUTORIAL_LIMIT && !userHasPaidAccess;

              return (
                <li key={tutorial.slug}>
                  {/* Main topic row — clicking navigates + toggles subtopics */}
                  <Link
                    href={href}
                    onClick={() => tutorial.subtopics.length > 0 && toggleExpand(tutorial.slug)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-lg transition-all duration-150 ${
                      isOnThisPage
                        ? "bg-white font-semibold text-indigo-700 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
                        : isCompleted
                        ? "font-medium text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                        : "font-medium text-zinc-800 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                    }`}
                  >
                    <span className={`flex-1 leading-snug ${isLocked ? "text-zinc-500 dark:text-zinc-400" : ""}`}>{tutorial.title}</span>
                    {isLocked ? (
                      <svg className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : isCompleted && !isOnThisPage ? (
                      <svg className="mr-1 h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                    {tutorial.subtopics.length > 0 && (
                      <svg
                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""} ${
                          isOnThisPage ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>

                  {/* Sub-topics */}
                  {isExpanded && tutorial.subtopics.length > 0 && (
                    <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-700">
                      {tutorial.subtopics.map((sub) => {
                        const isSubActive = isOnThisPage && activeHash === sub.id;
                        return (
                          <li key={sub.id}>
                            <Link
                              href={`${href}#${sub.id}`}
                              className={`block rounded-md px-2 py-1.5 text-base transition-all duration-150 ${
                                isSubActive
                                  ? "font-medium text-indigo-600 dark:text-indigo-400"
                                  : "text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                              }`}
                            >
                              {sub.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            });
          })()}
        </ul>
      </nav>
    </aside>
  );
}
