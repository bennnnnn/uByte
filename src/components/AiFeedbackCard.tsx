"use client";

import { useState } from "react";

export interface AiFeedbackShape {
  friendly_one_liner: string;
  hint: string;
  next_step: string;
  minimal_patch?: string;
}

interface Props {
  feedback: AiFeedbackShape;
  onClear: () => void;
}

/** Expandable AI hint card — shared between Practice IDE and Tutorial IDE. */
export default function AiFeedbackCard({ feedback, onClear }: Props) {
  const [showMore, setShowMore] = useState(false);
  const hasMore = !!(feedback.next_step || feedback.minimal_patch);

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1 space-y-2">
        {/* Always visible: one-liner + hint */}
        <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
          🤖 {feedback.friendly_one_liner}
        </p>
        <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
          {feedback.hint}
        </p>

        {/* Expandable: next step + minimal patch */}
        {hasMore && (
          <>
            {showMore && (
              <div className="space-y-2 border-t border-indigo-200/60 pt-2 dark:border-indigo-800/60">
                {feedback.next_step && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">Next step: </span>
                    {feedback.next_step}
                  </p>
                )}
                {feedback.minimal_patch && (
                  <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
                    {feedback.minimal_patch}
                  </pre>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {showMore ? "▲ Less" : "▼ More"}
            </button>
          </>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
        aria-label="Dismiss AI hint"
      >
        ✕
      </button>
    </div>
  );
}
