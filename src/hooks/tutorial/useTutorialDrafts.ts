"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TutorialStep } from "@/lib/tutorial-steps";
import type { SupportedLanguage } from "@/lib/languages/types";
import { apiFetch } from "@/lib/api-client";
import { tryDecodeShareCode } from "@/lib/share-code";

export function useTutorialDrafts(opts: {
  user: { id: number } | null;
  tutorialSlug: string;
  pageLang: string;
  ideLang: SupportedLanguage;
  currentSteps: TutorialStep[];
  stepIndex: number;
  code: string;
  setCode: (c: string) => void;
}) {
  const draftLoadingRef = useRef(false);
  const skipDraftLoadOnceRef = useRef(false);
  const saveDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = useRef(opts.stepIndex);
  stepIndexRef.current = opts.stepIndex;

  const [resetDone, setResetDone] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDraft = useCallback(
    (stepIndex: number, langOverride?: SupportedLanguage) => {
      if (opts.currentSteps.length === 0) return;
      if (skipDraftLoadOnceRef.current) {
        skipDraftLoadOnceRef.current = false;
        return;
      }
      const targetLang = langOverride ?? opts.ideLang;
      const safeIndex = Math.min(stepIndex, opts.currentSteps.length - 1);
      const starter = opts.currentSteps[safeIndex]?.starter ?? "";

      if (!opts.user) {
        opts.setCode(starter);
        return;
      }

      draftLoadingRef.current = true;
      apiFetch(
        `/api/code-drafts?slug=${encodeURIComponent(opts.tutorialSlug)}` +
          `&key=${encodeURIComponent(`step-${safeIndex}`)}` +
          `&lang=${encodeURIComponent(targetLang)}`,
      )
        .then((r) => r.json())
        .then((d: { code?: string }) => {
          opts.setCode(typeof d?.code === "string" && d.code ? d.code : starter);
        })
        .catch(() => {
          opts.setCode(starter);
        })
        .finally(() => {
          draftLoadingRef.current = false;
        });
    },
    [
      opts.user,
      opts.tutorialSlug,
      opts.ideLang,
      opts.currentSteps,
      opts.setCode,
    ],
  );

  useEffect(() => {
    loadDraft(stepIndexRef.current);
  }, [opts.ideLang, opts.currentSteps, loadDraft]);

  useEffect(() => {
    loadDraft(opts.stepIndex);
  }, [opts.stepIndex, loadDraft]);

  useEffect(() => {
    if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
    saveDraftTimerRef.current = setTimeout(() => {
      if (!opts.user || draftLoadingRef.current) return;
      const safeIndex = Math.min(opts.stepIndex, opts.currentSteps.length - 1);
      apiFetch("/api/code-drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: opts.tutorialSlug,
          key: `step-${safeIndex}`,
          code: opts.code,
          lang: opts.ideLang,
        }),
      }).catch(() => {});
    }, 1000);
    return () => {
      if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
    };
  }, [opts.code, opts.user, opts.tutorialSlug, opts.ideLang, opts.stepIndex, opts.currentSteps.length]);

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("share");
    if (encoded) {
      const decoded = tryDecodeShareCode(encoded);
      if (decoded) opts.setCode(decoded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function skipNextDraftLoad() {
    skipDraftLoadOnceRef.current = true;
  }

  function deleteDraftForStep(stepIndex: number) {
    if (!opts.user) return;
    const safeIndex = Math.min(stepIndex, opts.currentSteps.length - 1);
    apiFetch("/api/code-drafts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: opts.tutorialSlug,
        key: `step-${safeIndex}`,
        lang: opts.ideLang,
      }),
    }).catch(() => {});
  }

  function saveDraftNow(stepIndex: number, code: string) {
    if (!opts.user) return;
    apiFetch("/api/code-drafts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: opts.tutorialSlug,
        key: `step-${stepIndex}`,
        code,
        lang: opts.ideLang,
      }),
    }).catch(() => {});
  }

  function flashResetDone() {
    setResetDone(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setResetDone(false), 2000);
  }

  function cancelPendingSave() {
    if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
  }

  return {
    loadDraft,
    skipNextDraftLoad,
    deleteDraftForStep,
    saveDraftNow,
    flashResetDone,
    cancelPendingSave,
    resetDone,
  };
}
