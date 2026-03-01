"use client";

import { useState } from "react";
import CodePlayground from "./CodePlayground";

interface ChallengeBlockProps {
  title: string;
  description: string;
  hint?: string;
  starter: string;
}

export default function ChallengeBlock({ title, description, hint, starter }: ChallengeBlockProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-amber-300 dark:border-amber-700">
      {/* Header */}
      <div className="flex items-center gap-3 bg-amber-50 px-5 py-3 dark:bg-amber-950/40">
        <span className="text-xl">🏆</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Challenge</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-amber-200 bg-white px-5 py-4 dark:border-amber-800 dark:bg-zinc-900">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{description}</p>

        {hint && (
          <div className="mt-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              <svg
                className={`h-3.5 w-3.5 transition-transform ${showHint ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showHint ? "Hide hint" : "Show hint"}
            </button>
            {showHint && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                {hint}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Playground */}
      <div className="border-t border-amber-200 dark:border-amber-800">
        <CodePlayground code={starter ?? "package main\n\nimport \"fmt\"\n\nfunc main() {\n\t// TODO\n}"} title="challenge.go" />
      </div>
    </div>
  );
}
