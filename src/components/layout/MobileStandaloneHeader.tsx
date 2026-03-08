"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";

const STANDALONE_PREFIXES = ["/", "/practice", "/certifications", "/search", "/pricing", "/privacy", "/terms", "/leaderboard", "/profile", "/reset-password", "/verify-email", "/certificate", "/admin", "/u"];

function isStandalonePath(pathname: string): boolean {
  if (pathname === "/") return true;
  return STANDALONE_PREFIXES.some((p) => p !== "/" && pathname.startsWith(p));
}

const LANG_ICONS: Record<string, string> = {
  go: "🐹", python: "🐍", javascript: "🟨", java: "☕", rust: "🦀", cpp: "⚙️",
};

function AccordionSection({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {label}
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-0.5 space-y-0.5 pb-1 pl-2">
          {children}
        </div>
      )}
    </div>
  );
}

export default function MobileStandaloneHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!isStandalonePath(pathname ?? "")) return null;

  const languageSlugs = getAllLanguageSlugs();

  const toggle = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const close = () => {
    setOpen(false);
    setExpandedSection(null);
  };

  return (
    <div className="sticky top-0 z-30 shrink-0 md:hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
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
            onClick={() => { setOpen(!open); if (open) setExpandedSection(null); }}
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
          className="max-h-[70vh] overflow-y-auto border-b border-zinc-100 bg-surface-card px-3 py-2 dark:border-zinc-800"
          aria-label="Main navigation"
        >
          {/* Tutorials accordion */}
          <AccordionSection label="Tutorials" expanded={expandedSection === "tutorials"} onToggle={() => toggle("tutorials")}>
            {languageSlugs.map((slug) => {
              const config = LANGUAGES[slug as keyof typeof LANGUAGES];
              if (!config) return null;
              return (
                <Link
                  key={slug}
                  href={`/tutorial/${slug}`}
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <span className="text-base">{LANG_ICONS[slug] ?? ""}</span>
                  {config.name}
                </Link>
              );
            })}
          </AccordionSection>

          {/* Interview Prep accordion */}
          <AccordionSection label="Interview Prep" expanded={expandedSection === "practice"} onToggle={() => toggle("practice")}>
            <Link
              href="/practice"
              onClick={close}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            >
              <span className="text-base">🎯</span>
              All problems
            </Link>
            {languageSlugs.map((slug) => {
              const config = LANGUAGES[slug as keyof typeof LANGUAGES];
              if (!config) return null;
              return (
                <Link
                  key={slug}
                  href={`/practice/${slug}`}
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <span className="text-base">{LANG_ICONS[slug] ?? ""}</span>
                  {config.name}
                </Link>
              );
            })}
          </AccordionSection>

          {/* Certifications accordion */}
          <AccordionSection label="Certifications" expanded={expandedSection === "certifications"} onToggle={() => toggle("certifications")}>
            <Link
              href="/certifications"
              onClick={close}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            >
              <span className="text-base">📝</span>
              All certifications
            </Link>
            {languageSlugs.map((slug) => {
              const config = LANGUAGES[slug as keyof typeof LANGUAGES];
              if (!config) return null;
              return (
                <Link
                  key={slug}
                  href={`/certifications/${slug}`}
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <span className="text-base">{LANG_ICONS[slug] ?? ""}</span>
                  {config.name}
                </Link>
              );
            })}
          </AccordionSection>

          {/* Standalone links */}
          <div className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-800">
            <Link
              href="/pricing"
              onClick={close}
              className="flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Pricing
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
