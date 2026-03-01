"use client";

import Link from "next/link";
import { useNavState } from "@/hooks/useNavState";
import { useAuth } from "@/components/AuthProvider";

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
  const { progress } = useAuth();

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
        {/* Playground */}
        <Link
          href="/playground"
          className={`mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
            pathname === "/playground"
              ? "bg-cyan-500 text-white shadow-sm"
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
          {tutorials.map((tutorial, i) => {
            const href = `/golang/${tutorial.slug}`;
            const isOnThisPage = pathname === href;
            const isExpanded = expanded === tutorial.slug;
            const isCompleted = progress.includes(tutorial.slug);

            return (
              <li key={tutorial.slug}>
                {/* Topic row */}
                <div className="flex items-center">
                  <Link
                    href={href}
                    className={`flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                      isOnThisPage
                        ? "bg-white font-semibold text-cyan-700 shadow-sm dark:bg-zinc-800 dark:text-cyan-300"
                        : "font-medium text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                    }`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400"
                        : isOnThisPage
                        ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}>
                      {isCompleted ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="flex-1 leading-snug">{tutorial.title}</span>
                  </Link>
                  {tutorial.subtopics.length > 0 && (
                    <button
                      onClick={() => toggleExpand(tutorial.slug)}
                      className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
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

                {/* Sub-topics — indented under the topic title text */}
                {isExpanded && tutorial.subtopics.length > 0 && (
                  <ul className="ml-[2.85rem] mt-0.5 space-y-0.5 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
                    {tutorial.subtopics.map((sub) => {
                      const isSubActive = isOnThisPage && activeHash === sub.id;
                      return (
                        <li key={sub.id}>
                          <Link
                            href={`${href}#${sub.id}`}
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
          })}
        </ul>
      </nav>
    </aside>
  );
}
