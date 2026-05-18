"use client";

import { useEffect, useRef } from "react";
import type { TutorialStep } from "@/lib/tutorial-steps";
import { apiFetch } from "@/lib/api-client";
import { trackConversion } from "@/lib/analytics";

/**
 * Restores step progress from DB, syncs URL ?step=, localStorage, last-activity, and chapter completion.
 */
export function useTutorialProgressSync(opts: {
  steps: TutorialStep[];
  lang: string;
  tutorialSlug: string;
  userId?: number;
  stepIndex: number;
  completedSteps: Set<number>;
  setCode: (c: string) => void;
  setStepIndex: (idx: number) => void;
  setCompletedSteps: React.Dispatch<React.SetStateAction<Set<number>>>;
  setSkippedSteps: React.Dispatch<React.SetStateAction<Set<number>>>;
  markedRef: React.MutableRefObject<boolean>;
  setTutorialDone: (v: boolean) => void;
  toggleProgress: (slug: string, lang?: string) => Promise<void>;
  refreshProfile: () => Promise<unknown>;
}) {
  const urlHasStepRef = useRef(false);

  useEffect(() => {
    if (!opts.userId || !opts.tutorialSlug) return;
    trackConversion("started_tutorial", { lang: opts.lang, slug: opts.tutorialSlug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get("step");
    if (s !== null) {
      urlHasStepRef.current = true;
      const idx = parseInt(s, 10);
      if (!isNaN(idx) && idx >= 0 && idx < opts.steps.length) {
        opts.setStepIndex(idx);
        opts.setCode(opts.steps[idx].starter);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`last-step-${opts.lang}-${opts.tutorialSlug}`, String(opts.stepIndex));
    } catch { /* ignore */ }
  }, [opts.stepIndex, opts.lang, opts.tutorialSlug]);

  useEffect(() => {
    if (opts.userId == null) return;
    const controller = new AbortController();
    apiFetch("/api/last-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "tutorial",
        lang: opts.lang,
        slug: opts.tutorialSlug,
        step: opts.stepIndex,
      }),
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [opts.userId, opts.lang, opts.tutorialSlug, opts.stepIndex]);

  useEffect(() => {
    if (opts.userId == null || !opts.tutorialSlug) return;
    const controller = new AbortController();
    apiFetch(
      `/api/progress/steps?slug=${encodeURIComponent(opts.tutorialSlug)}&lang=${encodeURIComponent(opts.lang)}`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then((d) => {
        if (controller.signal.aborted) return;
        const completed: number[] = Array.isArray(d?.steps) ? d.steps : [];
        const skipped: number[] = Array.isArray(d?.skippedSteps) ? d.skippedSteps : [];

        if (opts.steps.length > 0 && completed.length + skipped.length >= opts.steps.length) {
          opts.markedRef.current = true;
        }
        opts.setCompletedSteps((prev) => new Set([...prev, ...completed, ...skipped]));
        opts.setSkippedSteps((prev) => new Set([...prev, ...skipped]));

        if (!urlHasStepRef.current && opts.steps.length > 0) {
          const doneSet = new Set([...completed, ...skipped]);
          for (let i = 0; i < opts.steps.length; i++) {
            if (!doneSet.has(i)) {
              if (i > 0) {
                opts.setStepIndex(i);
                opts.setCode(opts.steps[i].starter);
              }
              break;
            }
          }
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [opts.userId, opts.tutorialSlug, opts.lang, opts.steps.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      opts.completedSteps.size === opts.steps.length &&
      opts.steps.length > 0 &&
      !opts.markedRef.current
    ) {
      opts.markedRef.current = true;
      opts.setTutorialDone(true);
      opts.toggleProgress(opts.tutorialSlug, opts.lang).then(() => {
        void opts.refreshProfile();
      });
      trackConversion("completed_tutorial", { lang: opts.lang, slug: opts.tutorialSlug });
    }
  }, [
    opts.completedSteps,
    opts.steps.length,
    opts.tutorialSlug,
    opts.toggleProgress,
    opts.lang,
    opts.refreshProfile,
    opts.markedRef,
    opts.setTutorialDone,
  ]);

  return { urlHasStepRef };
}
