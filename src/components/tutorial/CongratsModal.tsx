"use client";

import Link from "next/link";
import { useState } from "react";
import ShareButton from "@/components/ShareButton";
import { tutorialUrl } from "@/lib/urls";

interface Props {
  tutorialTitle: string;
  lang: string;
  tutorialSlug: string;
  next: { slug: string; title: string } | null;
  onDismiss: () => void;
  isPro: boolean;
  stepsDone?: number;
  totalSteps?: number;
  streakDays?: number;
  totalXp?: number;
}

export default function CongratsModal({
  tutorialTitle,
  lang,
  tutorialSlug,
  next,
  onDismiss,
  isPro,
  stepsDone = 0,
  totalSteps = 0,
  streakDays = 0,
  totalXp = 0,
}: Props) {
  const [rated, setRated] = useState<1 | -1 | null>(null);

  async function submitRating(rating: 1 | -1) {
    setRated(rating);
    try {
      await fetch(`/api/tutorials/${lang}/${tutorialSlug}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
    } catch {
      // silent — rating is best-effort
    }
  }

  const nextLevelAt = (() => {
    const thresholds = [0, 100, 300, 700, 1500, 3000, 6000, 12000, 25000, 50000];
    const labels = ["Beginner", "Learner", "Coder", "Builder", "Developer",
                    "Engineer", "Architect", "Expert", "Master", "Legend"];
    let level = 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (totalXp >= thresholds[i]) { level = i; break; }
    }
    const nextXp = thresholds[level + 1] ?? thresholds[thresholds.length - 1];
    return { level: level + 1, label: labels[level] ?? "Legend", nextXp, xpProgress: Math.min(100, Math.round((totalXp / nextXp) * 100)) };
  })();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="congrats-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-emerald-300 bg-white p-6 text-center shadow-2xl dark:border-emerald-800 dark:bg-zinc-900">
        {/* Big celebration */}
        <div className="relative mb-3">
          <div className="text-6xl">🎉</div>
          {streakDays > 0 && (
            <div className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              🔥 {streakDays}-day streak
            </div>
          )}
        </div>
        <h2 id="congrats-title" className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Tutorial Complete!
        </h2>
        <p className="mb-4 text-zinc-500 dark:text-zinc-400">
          You finished{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{tutorialTitle}</span>.
        </p>

        {/* Stats row */}
        {stepsDone > 0 && (
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
              <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{stepsDone}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Steps</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
              <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{totalXp.toLocaleString()}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Total XP</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
              <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">Lv.{nextLevelAt.level}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{nextLevelAt.label}</p>
            </div>
          </div>
        )}

        {/* XP progress to next level */}
        {totalXp > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>{totalXp.toLocaleString()} XP</span>
              <span>{nextLevelAt.nextXp.toLocaleString()} XP</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${nextLevelAt.xpProgress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {nextLevelAt.nextXp - totalXp} XP to {nextLevelAt.label === "Legend" ? "max level" : `${nextLevelAt.label}`}
            </p>
          </div>
        )}

        {/* Action buttons */}
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-5 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg"
            >
              Next: {next.title} →
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-5 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-600"
            >
              🏁 All Tutorials
            </Link>
          )}
        </div>

        {/* Thumbs rating */}
        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {rated === null ? (
            <>
              <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                Was this tutorial helpful?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => submitRating(1)}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-600 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                >
                  👍 Yes
                </button>
                <button
                  onClick={() => submitRating(-1)}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-600 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-rose-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                >
                  👎 No
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {rated === 1 ? "Thanks for the feedback! 🙏" : "Thanks — we'll work to improve it. 🙏"}
            </p>
          )}
        </div>

        {/* Hint upsell */}
        {!isPro && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-left dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
              Want extra help on the next lesson?
            </p>
            <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300/70">
              Lessons stay free. Upgrade only if you want detailed hints and extra guidance without leaving the tutorial.
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
            >
              See hint pricing →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
