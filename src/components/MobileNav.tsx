"use client";

import { useState } from "react";
import Link from "next/link";
import { useNavState } from "@/hooks/useNavState";
import { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButtons from "@/components/AuthButtons";

interface SubTopic {
  id: string;
  title: string;
}

interface NavItem {
  slug: string;
  title: string;
  subtopics: SubTopic[];
}

export default function MobileNav({ tutorials }: { tutorials: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { pathname, expanded, activeHash, toggleExpand } = useNavState(tutorials);
  const { progress } = useAuth();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
          <span className="text-2xl">🐹</span>
          <span>uByte</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" />
          <AuthButtons />
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-b border-zinc-100 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <Link
            href="/playground"
            onClick={() => setOpen(false)}
            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span>⚡</span> Playground
          </Link>

          {/* Search */}
          <div className="relative mb-2">
            <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons..."
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-8 text-sm text-zinc-700 placeholder-zinc-400 focus:border-cyan-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Lessons
          </p>

          <ul className="space-y-0.5">
            {(() => {
              const q = query.toLowerCase();
              const filtered = tutorials
                .map((t, i) => ({ t, i }))
                .filter(({ t }) => t.title.toLowerCase().includes(q));
              if (filtered.length === 0) {
                return <li className="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">No lessons found</li>;
              }
              return filtered.map(({ t, i }) => {
              const href = `/golang/${t.slug}`;
              const isOnThisPage = pathname === href;
              const isExpanded = expanded === t.slug;
              const isCompleted = progress.includes(t.slug);
              return (
                <li key={t.slug}>
                  <div className="flex items-center">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                        isOnThisPage
                          ? "bg-white font-semibold text-cyan-700 shadow-sm dark:bg-zinc-800 dark:text-cyan-300"
                          : "text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400"
                          : isOnThisPage
                          ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300"
                          : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}>
                        {isCompleted ? "✓" : i + 1}
                      </span>
                      {t.title}
                    </Link>
                    {t.subtopics.length > 0 && (
                      <button
                        onClick={() => toggleExpand(t.slug)}
                        className="mr-1 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700"
                      >
                        <svg
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Sub-topics — indented under the topic title */}
                  {isExpanded && t.subtopics.length > 0 && (
                    <ul className="ml-[2.85rem] mt-0.5 space-y-0.5 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
                      {t.subtopics.map((sub) => {
                        const isSubActive = isOnThisPage && activeHash === sub.id;
                        return (
                          <li key={sub.id}>
                            <Link
                              href={`${href}#${sub.id}`}
                              onClick={() => setOpen(false)}
                              className={`block rounded-md px-2 py-1.5 text-sm transition-all duration-150 ${
                                isSubActive
                                  ? "bg-cyan-50 font-semibold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300"
                                  : "text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
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
      )}
    </div>
  );
}
