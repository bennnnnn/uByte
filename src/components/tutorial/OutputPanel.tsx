"use client";

import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import AiFeedbackCard from "@/components/AiFeedbackCard";
import type { StepProgressState } from "@/hooks/useStepProgress";

const AuthModal = lazy(() => import("@/components/auth/AuthModal"));

interface Props {
  progress: StepProgressState;
  expectedOutput: string[];
  stepsLength: number;
  onRequestHint: () => void;
  height: number;
  staticHint?: string;
}

/** Output panel for the tutorial IDE — shows run output, hints, and pass/fail state. */
export default function OutputPanel({
  progress,
  expectedOutput,
  stepsLength,
  onRequestHint,
  height,
  staticHint,
}: Props) {
  const { output, outputIsError, status, aiFeedback, setAiFeedback, aiFeedbackLoading, aiFeedbackUpgrade, aiFeedbackLoginRequired, stepIndex } = progress;
  const aiFeedbackUnavailable = aiFeedback?.confidence === 0 || aiFeedback?.root_cause === "ai_unavailable" || aiFeedback?.root_cause === "network_error";
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  const labelColor =
    outputIsError || status === "failed"
      ? "text-red-500 dark:text-red-400"
      : status === "passed"
      ? "text-emerald-500 dark:text-emerald-400"
      : "text-zinc-400 dark:text-zinc-500";

  const outputLabel =
    outputIsError
      ? "Error"
      : status === "failed" && output !== null
      ? "Wrong output"
      : status === "passed"
      ? "Output — correct ✓"
      : "Output";

  return (
    <div
      className="shrink-0 overflow-y-auto overflow-x-hidden bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950"
      style={{ height }}
      suppressHydrationWarning
    >
      {/* Status label */}
      <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${labelColor}`}>
        {outputLabel}
      </p>

      {/* Output text */}
      {output === null ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Click Run to execute, or Check to validate.
        </p>
      ) : (
        <pre
          className={`whitespace-pre-wrap break-words text-xs ${
            outputIsError || status === "failed"
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {output}
        </pre>
      )}

      {/* Pass message */}
      {status === "passed" && (
        <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          🎉{" "}
          {stepIndex < stepsLength - 1
            ? "Great job! Moving to the next step…"
            : "Outstanding! Tutorial complete!"}
        </p>
      )}

      {/* Expected output hint */}
      {status === "failed" && output !== null && !outputIsError && expectedOutput.length > 0 && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Expected:{" "}
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            {expectedOutput.join(" · ")}
          </span>
        </p>
      )}

      {/* AI feedback section */}
      {status === "failed" && output !== null && (
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-2.5 font-sans dark:border-indigo-800/50 dark:bg-indigo-950/20">
          {aiFeedbackLoading && (
            <p className="text-xs text-indigo-500 animate-pulse dark:text-indigo-400">
              Analyzing your code…
            </p>
          )}

          {/* Login prompt — shown for guests who try to use a hint */}
          {!aiFeedbackLoading && aiFeedbackLoginRequired && !aiFeedbackUpgrade && !aiFeedback && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                💡 Sign in to get hints when you&apos;re stuck
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Create a free account. When you hit a wall, ask for a hint instead of switching tabs.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                  className="inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-500"
                >
                  Sign up free →
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
                  className="inline-block rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                >
                  Log in
                </button>
              </div>
            </div>
          )}

          {/* Upgrade prompt — shown for free users trying to use a hint */}
          {!aiFeedbackLoading && aiFeedbackUpgrade && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                💡 Hints are a Pro feature
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Upgrade to Pro for instant hints when you hit a wall — on any tutorial step or practice problem.
              </p>
              <Link
                href="/pricing"
                className="mt-1 inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-500"
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}

          {!aiFeedbackLoading && !aiFeedback && !aiFeedbackUpgrade && !aiFeedbackLoginRequired && (
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[11px] text-indigo-400 dark:text-indigo-500">✦</span>
              <button
                type="button"
                onClick={onRequestHint}
                className="text-left text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                💡 Get hint
              </button>
            </div>
          )}

          {!aiFeedbackLoading && aiFeedback && (
            <AiFeedbackCard feedback={aiFeedback} onClear={() => setAiFeedback(null)} />
          )}

          {/* Static syntax nudge — shown as fallback when AI is busy/unavailable */}
          {!aiFeedbackLoading && aiFeedback && aiFeedbackUnavailable && staticHint && (
            <div className="mt-2 rounded-lg border border-indigo-100 bg-white/60 p-2.5 dark:border-indigo-900/50 dark:bg-zinc-900/40">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-400 dark:text-indigo-600">Syntax nudge</p>
              <code className="break-all text-xs text-indigo-700 dark:text-indigo-300">{staticHint}</code>
            </div>
          )}
        </div>
      )}

      {authOpen && (
        <Suspense>
          <AuthModal
            initialMode={authMode}
            onClose={() => setAuthOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
