"use client";

import { useState, useEffect, useRef } from "react";
import TutorialRating from "@/components/TutorialRating";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import type { TutorialStep } from "@/lib/tutorial-steps";
import type { Status } from "@/hooks/useStepProgress";

function InstructionText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="rounded bg-zinc-200 px-1 py-0.5 text-xs font-mono text-indigo-700 dark:bg-zinc-800 dark:text-indigo-300">
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface Props {
  lang: string;
  step: TutorialStep;
  stepIndex: number;
  steps: TutorialStep[];
  status: Status;
  showHint: boolean;
  onToggleHint: () => void;
  failCount: number;
  completedSteps: Set<number>;
  onGoToStep: (idx: number) => void;
  onSkip: () => void;
  tutorialSlug: string;
}

export default function InstructionsSidebar({
  lang,
  step,
  stepIndex,
  steps,
  status,
  showHint,
  onToggleHint,
  failCount,
  completedSteps,
  onGoToStep,
  onSkip,
  tutorialSlug,
}: Props) {
  const { user } = useAuth();
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load note when user/step changes
  useEffect(() => {
    if (!user) return;
    fetch(`/api/notes?slug=${encodeURIComponent(tutorialSlug)}&stepIndex=${stepIndex}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setNote(d.note ?? ""))
      .catch(() => {});
  }, [user, tutorialSlug, stepIndex]);

  function handleNoteChange(val: string) {
    setNote(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      apiFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tutorialSlug, stepIndex, note: val }),
      }).catch(() => {});
    }, 1000);
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-500">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {step.title}
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {step.instruction.split("\n").map((line, i) => (
            <p key={i}><InstructionText text={line} /></p>
          ))}
        </div>

        {step.hint && (
          <div className="mt-6">
            <button
              onClick={onToggleHint}
              className="flex items-center gap-1.5 text-sm text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-400"
            >
              <span>{showHint ? "▾" : "▸"}</span>
              {showHint ? "Hide hint" : "Show hint"}
            </button>
            {showHint && (
              <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950/40">
                <code className="break-all text-xs text-indigo-700 dark:text-indigo-300">{step.hint}</code>
              </div>
            )}
          </div>
        )}

        {user && (
          <div className="mt-6">
            <button
              onClick={() => setShowNote((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <span>{showNote ? "▾" : "▸"}</span>
              📝 {showNote ? "Hide note" : "My note"}
            </button>
            {showNote && (
              <textarea
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Write a note for this step…"
                maxLength={2000}
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-700 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:placeholder-zinc-500"
              />
            )}
          </div>
        )}

        {status === "passed" && (
          <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              🎉 Excellent work!
            </p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
              {stepIndex < steps.length - 1
                ? "Perfect! Moving to the next step…"
                : "You nailed it! Tutorial complete!"}
            </p>
          </div>
        )}

        {completedSteps.size === steps.length && steps.length > 0 && (
          <TutorialRating lang={lang} tutorialSlug={tutorialSlug} />
        )}

        {status === "failed" && failCount >= 3 && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Still stuck?</p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              No worries — check the hint above, or skip this step and come back later.
            </p>
            <button
              onClick={onSkip}
              className="mt-3 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-400 dark:hover:bg-amber-950/50"
            >
              Skip this step →
            </button>
          </div>
        )}
      </div>

      {/* Step dots */}
      <div className="shrink-0 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Tutorial steps">
          {steps.map((s, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === stepIndex}
              aria-label={`Step ${i + 1}: ${s.title}${completedSteps.has(i) ? " (completed)" : ""}`}
              onClick={() => onGoToStep(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === stepIndex ? "bg-indigo-500"
                : completedSteps.has(i) ? "bg-emerald-500"
                : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
