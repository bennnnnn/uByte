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
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load note when user/step changes
  useEffect(() => {
    if (!user) return;
    fetch(`/api/notes?slug=${encodeURIComponent(tutorialSlug)}&stepIndex=${stepIndex}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setNote(d.note ?? ""))
      .catch(() => {});
  }, [user, tutorialSlug, stepIndex]);

  useEffect(() => () => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
  }, []);

  async function saveNote(value: string) {
    if (!user) return;
    setSavingNote(true);
    try {
      await apiFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tutorialSlug, stepIndex, note: value }),
      });
      setNoteSaved(true);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setNoteSaved(false), 2500);
    } finally {
      setSavingNote(false);
    }
  }

  function handleNoteChange(val: string) {
    setNote(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveNote(val), 800);
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
              📝 {showNote ? "Hide note" : "Note for this step"}
            </button>
            {showNote && (
              <div className="mt-2 space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  onBlur={() => note.trim() && saveNote(note)}
                  placeholder="Write a note for this step (saved per question)…"
                  maxLength={2000}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-700 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:placeholder-zinc-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{note.length}/2000</span>
                  <button
                    type="button"
                    onClick={() => saveNote(note)}
                    disabled={savingNote}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {savingNote ? "Saving…" : noteSaved ? "Saved ✓" : "Save note"}
                  </button>
                </div>
              </div>
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

      {/* Step dots — green + checkmark = completed (saved per question) */}
      <div className="shrink-0 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Tutorial steps">
          {steps.map((s, i) => {
            const isCompleted = completedSteps.has(i);
            return (
              <button
                key={i}
                role="tab"
                aria-selected={i === stepIndex}
                aria-label={`Step ${i + 1}: ${s.title}${isCompleted ? " (done)" : ""}`}
                title={isCompleted ? "Done" : undefined}
                onClick={() => onGoToStep(i)}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  i === stepIndex ? "bg-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-800"
                  : isCompleted ? "bg-emerald-500 text-white"
                  : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
