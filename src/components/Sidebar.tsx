"use client";

import { useState } from "react";
import Link from "next/link";
import { useNavState } from "@/hooks/useNavState";
import { useAuth } from "@/components/AuthProvider";
import { FREE_TUTORIAL_LIMIT, hasPaidAccess } from "@/lib/plans";

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

export default function Sidebar({ tutorials }: { tutorials: SidebarItem[] }) {
  const { pathname, expanded, activeHash, toggleExpand } = useNavState(tutorials);
  const { progress, profile } = useAuth();
  const userHasPaidAccess = hasPaidAccess(profile?.plan);
  const [query, setQuery] = useState("");

  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-zinc-900 dark:text-white">
          <span className="text-2xl">🐹</span>
          <span>uByte</span>
        </Link>
      </div>

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
            placeholder="Search lessons..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-8 text-sm text-zinc-700 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500"
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

        {/* Playground */}
        <Link
          href="/playground"
          className={`mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
            pathname === "/playground"
              ? "bg-indigo-500 text-white shadow-sm"
              : "text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          }`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/30 text-sm dark:bg-white/10">⚡</span>
          Playground
        </Link>

        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Lessons
        </p>

        <ul className="space-y-0.5">
          {(() => {
            const q = query.toLowerCase();
            const filtered = tutorials
              .filter((tutorial) => tutorial.title.toLowerCase().includes(q));
            if (filtered.length === 0) {
              return <li className="px-3 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">No lessons found</li>;
            }
            return filtered.map((tutorial) => {
              const href = `/golang/${tutorial.slug}`;
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
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                      isOnThisPage
                        ? "bg-white font-semibold text-indigo-700 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
                        : isCompleted
                        ? "font-medium text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                        : "font-medium text-zinc-800 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                    }`}
                  >
                    <span className={`flex-1 leading-snug ${isLocked ? "text-zinc-400 dark:text-zinc-500" : ""}`}>{tutorial.title}</span>
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
                          isOnThisPage ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"
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
                              className={`block rounded-md px-2 py-1.5 text-xs transition-all duration-150 ${
                                isSubActive
                                  ? "font-medium text-indigo-600 dark:text-indigo-400"
                                  : "text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
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
