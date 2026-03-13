"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";

export default function HeroCTAButtons() {
  const { user, loading, profile } = useAuth();
  const isPro = hasPaidAccess(profile?.plan);

  const trustLine = isPro
    ? "You have full access — tutorials, interview prep, and certifications, all unlocked."
    : user
    ? "Upgrade to unlock all tutorials, certifications, and interview prep."
    : "Free forever for the basics. Upgrade to unlock everything.";

  // Reserve layout space while auth state loads — prevents CLS
  if (loading) {
    return <div className="mb-10 h-[52px]" aria-hidden />;
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-3">
        {isPro ? (
          <>
            <Link
              href="/tutorial/go"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              {(profile?.xp ?? 0) > 0 ? "Continue learning" : "Start learning"}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/certifications"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-surface-card px-7 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              My certifications
            </Link>
          </>
        ) : user ? (
          <>
            <Link
              href="/tutorial/go"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              {(profile?.xp ?? 0) > 0 ? "Continue learning" : "Start learning"}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-surface-card px-7 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Upgrade to Pro
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/tutorial/go"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Start for free
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-surface-card px-7 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              See pricing
            </Link>
          </>
        )}
      </div>

      <p className="mb-6 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {trustLine}
      </p>
    </>
  );
}
