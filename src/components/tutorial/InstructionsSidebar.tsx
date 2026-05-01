"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import TutorialRating from "@/components/TutorialRating";
import InlineRatingNudge from "@/components/tutorial/InlineRatingNudge";
import TutorialHintPanel from "@/components/tutorial/TutorialHintPanel";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";
import { tutorialUrl } from "@/lib/urls";
import type { TutorialStep } from "@/lib/tutorial-steps";
import type { StepProgressState } from "@/hooks/useStepProgress";

function InstructionText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="break-all rounded bg-zinc-200 px-1 py-0.5 text-xs font-mono text-indigo-700  ">
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
  steps: TutorialStep[];
  progress: StepProgressState;
  tutorialSlug: string;
  nextTutorial: { slug: string; title: string; steps: { index: number; title: string }[] } | null;
  /** All tutorials in this language — for showing track progress */
  allTutorials: { slug: string; title: string; order: number; difficulty: string; estimatedMinutes: number }[];
  /** After passing a step, advances and may carry code for cumulative (`carryForward`) lessons. */
  onContinueAfterPass?: () => void;
  onRequestHint: () => void;
}

export default function InstructionsSidebar({
  lang,
  step,
  steps,
  progress,
  tutorialSlug,
  nextTutorial,
  allTutorials,
  onContinueAfterPass,
  onRequestHint,
}: Props) {
  const { stepIndex, status, showHint, failCount, completedSteps, skippedSteps, tutorialDone, aiFeedback, aiFeedbackLoading, aiFeedbackUpgrade, aiFeedbackLoginRequired } = progress;
  const { profile } = useAuth();
  const isPro = hasPaidAccess(profile?.plan);
  const isGuest = !profile;
  const aiHintActive = aiFeedbackLoading || !!aiFeedback || aiFeedbackUpgrade || aiFeedbackLoginRequired;
  const dotsRef = useRef<HTMLDivElement>(null);

  // Scroll active step dot into view when step or done-state changes
  useEffect(() => {
    const el = dotsRef.current?.querySelector('[aria-selected="true"]') ?? dotsRef.current?.firstElementChild;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [stepIndex, tutorialDone]);

  return (
    <>
      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 break-words md:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700  ">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Step {stepIndex + 1}/{steps.length}
            </span>
            <span className="text-xs text-zinc-400">
              {steps.length - stepIndex - 1} more
            </span>
          </div>
          {/* Track progress: "Tutorial N of M" */}
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600  ">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {(() => {
                const idx = allTutorials.findIndex(t => t.slug === tutorialSlug);
                return idx >= 0 ? `Tutorial ${idx + 1} of ${allTutorials.length}` : "";
              })()}
            </span>
          </div>
          {completedSteps.size > 0 && (
            <span className="text-xs text-emerald-600  font-semibold">
              ✅ {completedSteps.size} done
            </span>
          )}
        </div>
        <h2 className="mb-4 break-words text-lg font-bold text-zinc-900 ">
          {step.title}
        </h2>
        <div className="min-w-0 space-y-3 break-words text-sm leading-relaxed text-zinc-700 ">
          {step.instruction.split("\n").map((line, i) => (
            <p key={i} className="min-w-0 break-words"><InstructionText text={line} /></p>
          ))}
        </div>

        <TutorialHintPanel progress={progress} onRequestHint={onRequestHint} />

        {step.hint && failCount >= 2 && !aiFeedbackLoading && !aiFeedback && (
          <div className="mt-6">
            <button
              onClick={() => progress.setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-sm text-indigo-600 transition-colors hover:text-indigo-500  :text-indigo-400"
            >
              <span>{showHint ? "▾" : "▸"}</span>
              {showHint ? "Hide syntax nudge" : "Show syntax nudge"}
            </button>
            {showHint && (
              <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3  ">
                <code className="break-all text-xs text-indigo-700 ">{step.hint}</code>
              </div>
            )}
          </div>
        )}

        {status === "passed" && (
          <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4  ">
            {step.successMessage ? (
              step.successMessage.split("\n").map((line, i) => (
                <p key={i} className={`text-sm text-emerald-700  ${i === 0 ? "font-semibold" : "mt-1"}`}>
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm font-semibold text-emerald-700 ">
                {stepIndex < steps.length - 1 ? "🎉 Excellent work!" : "🎉 You nailed it!"}
              </p>
            )}
            {stepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => (onContinueAfterPass ? onContinueAfterPass() : progress.goToStep(stepIndex + 1))}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Next Step
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : nextTutorial ? (
              <Link
                href={tutorialUrl(lang, nextTutorial.slug)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
              >
                Next: {nextTutorial.title}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : null}
          </div>
        )}

        {completedSteps.size === steps.length && steps.length > 0 && (
          <TutorialRating lang={lang} tutorialSlug={tutorialSlug} />
        )}

        <InlineRatingNudge
          lang={lang}
          tutorialSlug={tutorialSlug}
          completedCount={completedSteps.size}
          isLoggedIn={!isGuest}
        />

        {status === "failed" && failCount >= 3 && !isGuest && !aiHintActive && (
          <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4  ">
            <p className="text-sm font-semibold text-indigo-800 ">Want a step-by-step walkthrough?</p>
            <p className="mt-1 text-xs text-indigo-700 ">
              Pro gives you a detailed breakdown of exactly where you went wrong and how to fix it — no more switching to ChatGPT.
            </p>
            {isPro ? (
              <p className="mt-3 text-xs font-medium text-indigo-600 ">
                💡 Use the <strong>Get hint</strong> section above.
              </p>
            ) : (
              <Link
                href="/pricing"
                className="mt-3 inline-block rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Get Pro for instant hints →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Step dots — shows current section's steps; switches to next section's steps when done */}
      <div className="shrink-0 border-t border-zinc-200 p-4 ">
        <div
          ref={dotsRef}
          className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label={tutorialDone && nextTutorial ? "Next section steps" : "Tutorial steps"}
        >
          {tutorialDone && nextTutorial
            ? nextTutorial.steps.map((s) => (
                <Link
                  key={s.index}
                  href={tutorialUrl(lang, nextTutorial.slug, s.index)}
                  role="tab"
                  aria-selected={false}
                  aria-label={`Next: ${s.title}`}
                  title={s.title}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-300 transition-colors hover:bg-indigo-400  :bg-indigo-500"
                />
              ))
            : steps.map((s, i) => {
                const isCompleted = completedSteps.has(i) && !skippedSteps.has(i);
                const isSkipped = skippedSteps.has(i);
                const isCurrent = i === stepIndex;
                return (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`Step ${i + 1}: ${s.title}${isCompleted ? " (done)" : isSkipped ? " (skipped)" : ""}`}
                    title={s.title}
                    onClick={() => progress.goToStep(i)}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isCurrent
                        ? "bg-indigo-500 ring-2 ring-indigo-300 "
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : isSkipped
                        ? "bg-zinc-400 text-white "
                        : "bg-zinc-300 hover:bg-zinc-400  :bg-zinc-400"
                    }`}
                  >
                    {isCompleted && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isSkipped && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h15" />
                      </svg>
                    )}
                  </button>
                );
              })}
        </div>
      </div>
    </>
  );
}
