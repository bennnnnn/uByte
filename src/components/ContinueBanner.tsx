"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { tutorialUrl } from "@/lib/urls";

interface Tutorial {
  slug: string;
  title: string;
}

export default function ContinueBanner({ lang, tutorials }: { lang: string; tutorials: Tutorial[] }) {
  const { user, progress } = useAuth();
  const [lastStep, setLastStep] = useState<number | null>(null);

  const nextTutorial = tutorials.find((t) => !progress.includes(t.slug));

  useEffect(() => {
    if (!nextTutorial) return;
    try {
      const saved = localStorage.getItem(`last-step-${lang}-${nextTutorial.slug}`);
      if (saved !== null) {
        const n = parseInt(saved, 10);
        if (!isNaN(n) && n > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage
          setLastStep(n);
        }
      }
    } catch { /* ignore */ }
  }, [nextTutorial, nextTutorial?.slug, lang]);

  if (!user || progress.length === 0) return null;
  // All done
  if (!nextTutorial) {
    return (
      <div className="mb-8 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏆</span>
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            You completed all {tutorials.length} tutorials!
          </span>
        </div>
        <Link
          href="/profile?tab=achievements"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
        >
          View achievements →
        </Link>
      </div>
    );
  }

  const completedCount = tutorials.filter((t) => progress.includes(t.slug)).length;
  const progressPct = tutorials.length > 0 ? Math.round((completedCount / tutorials.length) * 100) : 0;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:flex-nowrap">
        <div className="flex items-center gap-3">
          <span className="text-xl">📖</span>
          <div>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
              Continue where you left off
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              {completedCount} of {tutorials.length} completed
            </p>
          </div>
        </div>
        <Link
          href={tutorialUrl(lang, nextTutorial.slug, lastStep ?? undefined)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-md"
        >
          {nextTutorial.title}
          <span aria-hidden>→</span>
        </Link>
      </div>
      {/* Progress bar */}
      <div className="h-1 w-full bg-indigo-200/80 dark:bg-indigo-900/50">
        <div
          className="h-full bg-indigo-500 transition-all duration-500 ease-out dark:bg-indigo-400"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={tutorials.length}
          aria-label={`${completedCount} of ${tutorials.length} tutorials completed`}
        />
      </div>
    </div>
  );
}
