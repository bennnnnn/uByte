"use client";

import TutorialChat from "@/components/TutorialChat";
import type { Status } from "@/hooks/useStepProgress";
interface Props {
  output: string | null;
  outputIsError: boolean;
  status: Status;
  aiFeedback: string | null;
  expectedOutput: string[];
  stepIndex: number;
  stepsLength: number;
  showInlineChat: boolean;
  onToggleChat: () => void;
  chatSlug: string;
  lang: string;
  currentCode: string;
  height: number;
}

export default function OutputPanel({
  output,
  outputIsError,
  status,
  aiFeedback,
  expectedOutput,
  stepIndex,
  stepsLength,
  showInlineChat,
  onToggleChat,
  chatSlug,
  lang,
  currentCode,
  height,
}: Props) {
  return (
    <div
      className="shrink-0 overflow-y-auto bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950"
      style={{ height }}
      suppressHydrationWarning
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
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
        <pre className={`whitespace-pre-wrap ${
          outputIsError
            ? "text-red-600 dark:text-red-400"
            : status === "failed"
            ? "text-amber-600 dark:text-amber-400"
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
        <div className="mt-3 rounded-lg border border-zinc-200/70 bg-white/70 font-sans backdrop-blur-sm dark:border-zinc-700/40 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="shrink-0 text-[11px] text-indigo-400 dark:text-indigo-500">✦</span>
            <p className={`flex-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 ${!aiFeedback ? "animate-pulse" : ""}`}>
              {aiFeedback ?? "Analyzing your code…"}
            </p>
            {aiFeedback && (
              <button
                onClick={onToggleChat}
                title="Ask a follow-up question"
                className="shrink-0 animate-bounce text-indigo-400 transition-colors hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </button>
            )}
          </div>
          {showInlineChat && (
            <div className="border-t border-zinc-200/70 dark:border-zinc-700/40">
              <TutorialChat
                chatSlug={chatSlug}
                lang={lang}
                onClose={onToggleChat}
                currentCode={currentCode}
                inline
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
