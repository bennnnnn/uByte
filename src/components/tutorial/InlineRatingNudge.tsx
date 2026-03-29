"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

const DISMISS_KEY = (lang: string, slug: string) => `ubyte-rdismiss-${lang}-${slug}`;
const DONE_KEY = (lang: string, slug: string) => `ubyte-rdone-${lang}-${slug}`;
const MAX_DISMISSALS = 3;
const STEP_THRESHOLD = 5;

interface Props {
  lang: string;
  tutorialSlug: string;
  completedCount: number;
  isLoggedIn: boolean;
}

export default function InlineRatingNudge({ lang, tutorialSlug, completedCount, isLoggedIn }: Props) {
  const [visible, setVisible] = useState(false);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || completedCount < STEP_THRESHOLD) return;

    try {
      const done = localStorage.getItem(DONE_KEY(lang, tutorialSlug)) === "1";
      const dismissCount = parseInt(localStorage.getItem(DISMISS_KEY(lang, tutorialSlug)) ?? "0", 10);
      if (done || dismissCount >= MAX_DISMISSALS) return;
    } catch { return; }

    // Check DB — user may have already rated via CongratsModal on another device/session
    apiFetch(`/api/tutorials/${lang}/${tutorialSlug}/rate`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.rating != null) {
          try { localStorage.setItem(DONE_KEY(lang, tutorialSlug), "1"); } catch { /* ignore */ }
          return;
        }
        setVisible(true);
      })
      .catch(() => setVisible(true)); // show on network error — worst case they rate twice
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount, isLoggedIn]);

  function dismiss() {
    setVisible(false);
    try {
      const count = parseInt(localStorage.getItem(DISMISS_KEY(lang, tutorialSlug)) ?? "0", 10);
      localStorage.setItem(DISMISS_KEY(lang, tutorialSlug), String(count + 1));
    } catch { /* ignore */ }
  }

  async function vote(rating: 1 | -1) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/tutorials/${lang}/${tutorialSlug}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      localStorage.setItem(DONE_KEY(lang, tutorialSlug), "1");
      setVoted(true);
      setTimeout(() => setVisible(false), 1800);
    } catch {
      setVisible(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-800/60">
      {voted ? (
        <p className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Thanks for the feedback! 🙏
        </p>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Enjoying this tutorial?</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => vote(1)}
              disabled={submitting}
              className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
            >
              👍 Yes
            </button>
            <button
              type="button"
              onClick={() => vote(-1)}
              disabled={submitting}
              className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-rose-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            >
              👎 No
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="ml-1 rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
