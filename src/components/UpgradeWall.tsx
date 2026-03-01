"use client";

import Link from "next/link";

export default function UpgradeWall({ tutorialTitle }: { tutorialTitle: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/0 dark:from-zinc-950 dark:via-zinc-950/95 dark:to-zinc-950/0" />

      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-8 shadow-2xl ring-1 ring-zinc-200 sm:mb-0 sm:rounded-2xl dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="mb-2 text-center text-3xl">🔒</div>
        <h2 className="mb-2 text-center text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {tutorialTitle} is a Pro tutorial
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          You&apos;ve completed the free tutorials. Upgrade to unlock all 20 Go tutorials and keep learning.
        </p>

        {/* Plans */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {/* Early Bird */}
          <div className="relative flex flex-col rounded-xl border-2 border-indigo-500 bg-indigo-50 p-4 dark:bg-indigo-950/40">
            <span className="mb-2 inline-block self-start rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Early Bird 🔥
            </span>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              $4.50<span className="text-sm font-normal text-zinc-400">/mo</span>
            </p>
            <p className="mt-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">50% off — limited time</p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">All tutorials, forever</p>
          </div>

          {/* Pro */}
          <div className="flex flex-col rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <span className="mb-2 inline-block self-start rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Pro
            </span>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              $9<span className="text-sm font-normal text-zinc-400">/mo</span>
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">Regular price</p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">All tutorials, forever</p>
          </div>
        </div>

        <Link
          href="/pricing"
          className="block w-full rounded-xl bg-indigo-700 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
        >
          Get Early Bird — $4.50/mo
        </Link>

        <Link
          href="/"
          className="mt-3 block w-full rounded-xl border border-zinc-200 py-2.5 text-center text-sm text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Back to free tutorials
        </Link>
      </div>
    </div>
  );
}
