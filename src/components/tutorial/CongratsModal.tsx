"use client";

import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import { tutorialUrl } from "@/lib/urls";

interface Props {
  tutorialTitle: string;
  lang: string;
  tutorialSlug: string;
  next: { slug: string; title: string } | null;
  countdown: number;
  onDismiss: () => void;
}

export default function CongratsModal({
  tutorialTitle,
  lang,
  tutorialSlug,
  next,
  countdown,
  onDismiss,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="congrats-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-emerald-300 bg-white p-8 text-center shadow-2xl dark:border-emerald-800 dark:bg-zinc-900">
        <div className="mb-3 text-5xl">🎉</div>
        <h2 id="congrats-title" className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Tutorial Complete!
        </h2>
        <p className="mb-2 text-zinc-500 dark:text-zinc-400">
          You finished{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{tutorialTitle}</span>. Great work!
        </p>
        <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">
          {next
            ? `Continuing to "${next.title}" in ${countdown}…`
            : `Returning home in ${countdown}…`}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onDismiss}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Review steps
          </button>
          <ShareButton
            text={`I just completed "${tutorialTitle}" on uByte! 🐹`}
            url={typeof window !== "undefined" ? `${window.location.origin}${tutorialUrl(lang, tutorialSlug)}` : ""}
          />
          {next ? (
            <Link
              href={tutorialUrl(lang, next.slug)}
              className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800"
            >
              Next: {next.title} →
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800"
            >
              All Tutorials
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
