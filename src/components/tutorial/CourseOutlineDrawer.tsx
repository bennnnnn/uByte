"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { tutorialUrl } from "@/lib/urls";

interface Tutorial {
  slug: string;
  title: string;
  order: number;
  difficulty: string;
  estimatedMinutes: number;
}

interface Props {
  lang: string;
  show: boolean;
  onClose: () => void;
  allTutorials: Tutorial[];
  allTutorialSteps: Record<string, { index: number; title: string }[]>;
  tutorialSlug: string;
  stepIndex: number;
  completedSteps: Set<number>;
  skippedSteps: Set<number>;
  expandedSlug: string;
  onExpandSlug: (slug: string) => void;
  onGoToStep: (idx: number) => void;
}

export default function CourseOutlineDrawer({
  lang,
  show,
  onClose,
  allTutorials,
  allTutorialSteps,
  tutorialSlug,
  stepIndex,
  completedSteps,
  skippedSteps,
  expandedSlug,
  onExpandSlug,
  onGoToStep,
}: Props) {
  const { progressByLang } = useAuth();
  const progress = progressByLang[lang] ?? [];

  return (
    <>
      {show && (
        <div
          className="fixed inset-0 z-[54] bg-black/50"
          role="button"
          aria-label="Close drawer"
          tabIndex={0}
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClose(); } }}
        />
      )}
      <div
        className={`fixed left-0 top-12 bottom-0 z-[55] flex w-72 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-900 ${
          show ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Course Outline
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >✕</button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {allTutorials.map((t) => {
              const isCurrent = t.slug === tutorialSlug;
              const isDone = progress.includes(t.slug);
              const isExpanded = expandedSlug === t.slug;
              const subSteps = allTutorialSteps[t.slug] ?? [];
              return (
                <li key={t.slug}>
                  <Link
                    href={tutorialUrl(lang, t.slug)}
                    onClick={() => {
                      if (subSteps.length > 0) onExpandSlug(isExpanded ? "" : t.slug);
                      else onClose();
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                      isCurrent
                        ? "bg-white font-semibold text-indigo-700 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
                        : "font-medium text-zinc-800 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                    }`}
                  >
                    <span className="flex-1 leading-snug">{t.title}</span>
                    {isDone && !isCurrent && (
                      <svg className="mr-1 h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {subSteps.length > 0 && (
                      <svg
                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""} ${isCurrent ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>

                  {isExpanded && subSteps.length > 0 && (
                    <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-700">
                      {subSteps.map((step) => {
                        const isActiveStep = isCurrent && step.index === stepIndex;
                        const isStepSkipped = isCurrent && skippedSteps.has(step.index);
                        const isStepDone = isCurrent && completedSteps.has(step.index) && !isStepSkipped;
                        return (
                          <li key={step.index}>
                            {isCurrent ? (
                              <button
                                onClick={() => { onGoToStep(step.index); onClose(); }}
                                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-all duration-150 ${
                                  isActiveStep
                                    ? "font-medium text-indigo-600 dark:text-indigo-400"
                                    : "text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                                }`}
                              >
                                <span>{step.title}</span>
                                {isStepDone    && <span className="shrink-0 text-emerald-500 dark:text-emerald-400">✓</span>}
                                {isStepSkipped && <span className="shrink-0 text-zinc-400 dark:text-zinc-500" title="Skipped">›</span>}
                              </button>
                            ) : (
                              <Link
                                href={tutorialUrl(lang, t.slug, step.index)}
                                onClick={onClose}
                                className="block rounded-md px-2 py-1.5 text-xs text-zinc-400 transition-all duration-150 hover:bg-zinc-200/70 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                              >
                                {step.title}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
