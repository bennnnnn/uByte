"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";

/**
 * Mobile top bar + menu for pages that don't use the [lang] layout (home, practice, search, pricing, etc.).
 * Renders only on mobile (md:hidden) and only when the current route is a "standalone" page.
 */
const STANDALONE_PREFIXES = ["/", "/practice", "/certifications", "/search", "/pricing", "/privacy", "/terms", "/leaderboard", "/profile", "/reset-password", "/verify-email", "/certificate", "/admin", "/u"];

function isStandalonePath(pathname: string): boolean {
  if (pathname === "/") return true;
  return STANDALONE_PREFIXES.some((p) => p !== "/" && pathname.startsWith(p));
}

export default function MobileStandaloneHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!isStandalonePath(pathname ?? "")) return null;

  const languageSlugs = getAllLanguageSlugs();

  return (
    <div className="sticky top-0 z-30 shrink-0 md:hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/" className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">U</span>
          <span className="text-lg font-bold">uByte</span>
        </Link>
        <div className="flex items-center gap-1">
          <Suspense fallback={<div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />}>
            <AuthButtons />
          </Suspense>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Toggle menu"
            aria-expanded={open}
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
        <nav
          className="border-b border-zinc-100 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950"
          aria-label="Main navigation"
        >
          {/* Top links */}
          <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-700">
            <Link href="/leaderboard" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => setOpen(false)}>
              Leaderboard
            </Link>
            <Link href="/pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => setOpen(false)}>
              Pricing
            </Link>
          </div>

          {/* Tutorials */}
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Tutorials
          </p>
          <ul className="space-y-0.5">
            {languageSlugs.map((slug) => {
              const config = LANGUAGES[slug as keyof typeof LANGUAGES];
              if (!config) return null;
              return (
                <li key={slug}>
                  <Link
                    href={`/${slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {config.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Interview Prep (coding problems) */}
          <p className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Interview Prep
          </p>
          <Link href="/practice" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800">
            All problems
          </Link>
          <ul className="mt-0.5 space-y-0.5">
            {languageSlugs.map((slug) => {
              const config = LANGUAGES[slug as keyof typeof LANGUAGES];
              if (!config) return null;
              return (
                <li key={slug}>
                  <Link
                    href={`/practice/${slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {config.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Certifications (MCQ exams) */}
          <p className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Certifications
          </p>
          <Link href="/certifications" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800">
            Certifications
          </Link>
          <ul className="mt-0.5 space-y-0.5">
            {languageSlugs.map((slug) => {
              const config = LANGUAGES[slug as keyof typeof LANGUAGES];
              if (!config) return null;
              return (
                <li key={slug}>
                  <Link
                    href={`/certifications/${slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {config.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
