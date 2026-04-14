"use client";

import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import AiFeedbackCard from "@/components/AiFeedbackCard";
import type { StepProgressState } from "@/hooks/useStepProgress";

const AuthModal = lazy(() => import("@/components/auth/AuthModal"));

interface Props {
  progress: StepProgressState;
  onRequestHint: () => void;
}

export default function TutorialHintPanel({ progress, onRequestHint }: Props) {
  const { output, status, aiFeedback, setAiFeedback, aiFeedbackLoading, aiFeedbackUpgrade, aiFeedbackLoginRequired } = progress;
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  if (status !== "failed" || output === null) return null;

  return (
    <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-800/60 dark:bg-indigo-950/20">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
        AI Hint
      </p>

      {aiFeedbackLoading && (
        <p className="text-sm text-indigo-600 animate-pulse dark:text-indigo-300">
          Analyzing your code…
        </p>
      )}

      {!aiFeedbackLoading && aiFeedbackLoginRequired && !aiFeedbackUpgrade && !aiFeedback && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
            Sign in to get hints when you&apos;re stuck
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            Create a free account and ask for guided help without leaving the lesson.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              Sign up free
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
              className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
            >
              Log in
            </button>
          </div>
        </div>
      )}

      {!aiFeedbackLoading && aiFeedbackUpgrade && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
            Hints are a Pro feature
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            Upgrade to Pro for detailed, step-by-step guidance in every lesson.
          </p>
          <Link
            href="/pricing"
            className="inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {!aiFeedbackLoading && !aiFeedback && !aiFeedbackUpgrade && !aiFeedbackLoginRequired && (
        <button
          type="button"
          onClick={onRequestHint}
          className="text-sm font-medium text-indigo-700 transition hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          Get hint
        </button>
      )}

      {!aiFeedbackLoading && aiFeedback && (
        <AiFeedbackCard feedback={aiFeedback} onClear={() => setAiFeedback(null)} />
      )}

      {authOpen && (
        <Suspense>
          <AuthModal initialMode={authMode} onClose={() => setAuthOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
