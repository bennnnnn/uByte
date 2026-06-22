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
  /** Bumped on every loadDraft call so stale HTTP responses cannot overwrite the editor. */
  const draftLoadSeqRef = useRef(0);
  /** Last (lang, step) applied for guests — avoids re-resetting on duplicate effect runs. */
  const lastGuestDraftKeyRef = useRef<string | null>(null);
  const skipDraftLoadOnceRef = useRef(false);
  const saveDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const optsRef = useRef(opts);
  const codeRef = useRef(opts.code);

  // Update refs in effect to comply with React hooks rules
  useEffect(() => {
    optsRef.current = opts;
    codeRef.current = opts.code;
  });

  const [resetDone, setResetDone] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDraft = useCallback((stepIndex: number, langOverride?: SupportedLanguage) => {
    const o = optsRef.current;
    if (o.currentSteps.length === 0) return;
    if (skipDraftLoadOnceRef.current) {
      skipDraftLoadOnceRef.current = false;
      return;
    }
    const targetLang = langOverride ?? o.ideLang;
    const safeIndex = Math.min(stepIndex, o.currentSteps.length - 1);
    const starter = o.currentSteps[safeIndex]?.starter ?? "";

    if (!o.user) {
      const guestKey = `${targetLang}:${safeIndex}`;
      if (lastGuestDraftKeyRef.current === guestKey) return;
      lastGuestDraftKeyRef.current = guestKey;
      o.setCode(starter);
      return;
    }

    const codeBeforeFetch = codeRef.current;
    const seq = ++draftLoadSeqRef.current;
    draftLoadingRef.current = true;
    apiFetch(
      `/api/code-drafts?slug=${encodeURIComponent(o.tutorialSlug)}` +
        `&key=${encodeURIComponent(`step-${safeIndex}`)}` +
        `&lang=${encodeURIComponent(targetLang)}`,
    )
      .then((r) => r.json())
      .then((d: { code?: string }) => {
        if (seq !== draftLoadSeqRef.current) return;
        // User typed while the fetch was in flight — do not overwrite with stale DB code.
        if (codeRef.current !== codeBeforeFetch) return;
        o.setCode(typeof d?.code === "string" && d.code ? d.code : starter);
      })
      .catch(() => {
        if (seq !== draftLoadSeqRef.current) return;
        if (codeRef.current !== codeBeforeFetch) return;
        o.setCode(starter);
      })
      .finally(() => {
        if (seq === draftLoadSeqRef.current) draftLoadingRef.current = false;
      });
  }, []);

  // Load draft only when step, IDE language, or step list changes — NOT on every keystroke.
  useEffect(() => {
    loadDraft(opts.stepIndex);
  }, [opts.ideLang, opts.stepIndex, opts.tutorialSlug, opts.currentSteps.length, loadDraft]);

  useEffect(() => {
    if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
    saveDraftTimerRef.current = setTimeout(() => {
      const o = optsRef.current;
      if (!o.user || draftLoadingRef.current) return;
      const safeIndex = Math.min(o.stepIndex, o.currentSteps.length - 1);
      apiFetch("/api/code-drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: o.tutorialSlug,
          key: `step-${safeIndex}`,
          code: codeRef.current,
          lang: o.ideLang,
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
      if (decoded) optsRef.current.setCode(decoded);
    }
  }, []);

  function skipNextDraftLoad() {
    skipDraftLoadOnceRef.current = true;
  }

  function deleteDraftForStep(stepIndex: number) {
    const o = optsRef.current;
    if (!o.user) return;
    const safeIndex = Math.min(stepIndex, o.currentSteps.length - 1);
    apiFetch("/api/code-drafts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: o.tutorialSlug,
        key: `step-${safeIndex}`,
        lang: o.ideLang,
      }),
    }).catch(() => {});
  }

  function saveDraftNow(stepIndex: number, code: string) {
    const o = optsRef.current;
    if (!o.user) return;
    apiFetch("/api/code-drafts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: o.tutorialSlug,
        key: `step-${stepIndex}`,
        code,
        lang: o.ideLang,
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
