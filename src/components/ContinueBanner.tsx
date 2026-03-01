"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

interface Tutorial {
  slug: string;
  title: string;
}

export default function ContinueBanner({ tutorials }: { tutorials: Tutorial[] }) {
  const { user, progress } = useAuth();
  if (!user || progress.length === 0) return null;

  const nextTutorial = tutorials.find((t) => !progress.includes(t.slug));
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

  return (
    <div className="mb-8 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 dark:border-indigo-900 dark:bg-indigo-950/30">
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
        href={`/golang/${nextTutorial.slug}`}
        className="rounded-lg bg-indigo-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-800"
      >
        {nextTutorial.title} →
      </Link>
    </div>
  );
}
