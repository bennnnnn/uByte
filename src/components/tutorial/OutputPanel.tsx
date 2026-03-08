"use client";

import type { StepProgressState } from "@/hooks/useStepProgress";

interface Props {
  progress: StepProgressState;
  expectedOutput: string[];
  stepsLength: number;
  onRequestHint: () => void;
  height: number;
}

/** Single scroll container: output + inline AI feedback (no chat window, no nested scroll). */
export default function OutputPanel({
  progress,
  expectedOutput,
  stepsLength,
  onRequestHint,
  height,
}: Props) {
  const { output, outputIsError, status, aiFeedback, aiFeedbackLoading, stepIndex } = progress;
  return (
    <div
      className="shrink-0 overflow-y-auto overflow-x-hidden bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950"
      style={{ height }}
      suppressHydrationWarning
    >
      <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${
        outputIsError || status === "failed"
          ? "text-red-500 dark:text-red-400"
          : status === "passed"
          ? "text-emerald-500 dark:text-emerald-400"
          : "text-zinc-400 dark:text-zinc-500"
      }`}>
        {outputIsError
          ? "Error"
          : status === "failed" && output !== null
          ? "Wrong output"
          : status === "passed"
          ? "Output — correct ✓"
          : "Output"}
      </p>

      {output === null ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Click Run to execute, or Check to validate.
        </p>
      ) : (
        <pre className={`whitespace-pre-wrap break-words text-xs ${
          outputIsError || status === "failed"
            ? "text-red-600 dark:text-red-400"
            : "text-green-600 dark:text-green-400"
        }`}>{output}</pre>
      )}

      {status === "passed" && (
        <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          🎉 {stepIndex < stepsLength - 1 ? "Great job! Moving to the next step…" : "Outstanding! Tutorial complete!"}
        </p>
      )}

      {status === "failed" && output !== null && !outputIsError && expectedOutput.length > 0 && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Expected: <span className="font-medium text-zinc-500 dark:text-zinc-400">{expectedOutput.join(" · ")}</span>
        </p>
      )}

      {status === "failed" && output !== null && (
        <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 font-sans dark:border-violet-800/50 dark:bg-violet-950/20">
          {aiFeedbackLoading && (
            <p className="px-3 py-2 text-xs text-violet-500 dark:text-violet-400 animate-pulse">Analyzing your code…</p>
          )}
          {!aiFeedbackLoading && !aiFeedback && (
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="shrink-0 text-[11px] text-violet-400 dark:text-violet-500">✦</span>
              <button
                type="button"
                onClick={onRequestHint}
                className="text-left text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Get hint
              </button>
            </div>
          )}
          {!aiFeedbackLoading && aiFeedback && (
            <p className="px-3 py-2 text-xs leading-relaxed text-violet-800 dark:text-violet-200">{aiFeedback}</p>
          )}
        </div>
      )}
    </div>
  );
}
