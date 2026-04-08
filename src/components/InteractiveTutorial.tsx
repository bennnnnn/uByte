"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import type { TutorialStep } from "@/lib/tutorial-steps";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButtons from "@/components/AuthButtons";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { useStepProgress } from "@/hooks/useStepProgress";
import { usePanelResize } from "@/hooks/usePanelResize";
import OutputPanel from "@/components/tutorial/OutputPanel";
import InstructionsSidebar from "@/components/tutorial/InstructionsSidebar";
import SnapshotDrawer from "@/components/tutorial/SnapshotDrawer";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import GripDots from "@/components/GripDots";
import { useIsMobile } from "@/hooks/useIsMobile";
import GuestConversionPrompt from "@/components/GuestConversionPrompt";
import GuestTopBanner from "@/components/GuestTopBanner";
import TutorialGate from "@/components/TutorialGate";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { useEditorKeyDown } from "@/hooks/useEditorKeyDown";
import { tryDecodeShareCode } from "@/lib/share-code";
import DiscussionThread from "@/components/discussion/DiscussionThread";
import { apiFetch } from "@/lib/api-client";
import CongratsModal from "@/components/tutorial/CongratsModal";
import MobileTabBar from "@/components/tutorial/MobileTabBar";
import CourseOutlinePanel from "@/components/tutorial/CourseOutlinePanel";

interface Props {
  lang: string;
  tutorialTitle: string;
  tutorialSlug: string;
  steps: TutorialStep[];
  allTutorials: { slug: string; title: string; order: number; difficulty: string; estimatedMinutes: number }[];
  allTutorialSteps: Record<string, { index: number; title: string }[]>;
  next: { slug: string; title: string } | null;
}

export default function InteractiveTutorial({
  lang,
  tutorialTitle,
  tutorialSlug,
  steps,
  allTutorials,
  allTutorialSteps,
  next,
}: Props) {
  const { user, profile, loading, progressByLang } = useAuth();
  const isPro = hasPaidAccess(profile?.plan);

  const [ideLang, setIdeLang] = useState<SupportedLanguage>(lang as SupportedLanguage);
  const [stepsForLang, setStepsForLang] = useState<TutorialStep[] | null>(null);
  const [stepsLoading, setStepsLoading] = useState(false);
  // Fall back to original steps if the other language has no content yet
  const currentSteps = ideLang === lang ? steps : (stepsForLang?.length ? stepsForLang : steps);

  const editor = useCodeEditor(currentSteps[0]?.starter ?? "", ideLang);
  const stepProgress = useStepProgress(currentSteps, ideLang, tutorialSlug, next, editor.setCode, user?.id);
  const { leftWidth, outputHeight, isDragging, startDragH, startDragV, startDragVTouch } = usePanelResize();

  const [expandedSlug, setExpandedSlug] = useState(tutorialSlug);
  const [showSnapshots, setShowSnapshots] = useState(false);

  // Notes (per-tutorial, persisted in localStorage)
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const notesKey = `tutorial-notes-${lang}-${tutorialSlug}`;

  useEffect(() => {
    try { setNotes(localStorage.getItem(notesKey) ?? ""); } catch { /* ignore */ }
  }, [notesKey]);

  function saveNotesNow() {
    try { localStorage.setItem(notesKey, notes); } catch { /* ignore */ }
  }
  const [fontSize, setFontSize] = useState<14 | 16 | 18>(14);
  useEffect(() => {
    try {
      const s = localStorage.getItem("ide-font-size");
      if (s === "16") setFontSize(16);
      else if (s === "18") setFontSize(18);
    } catch { /* ignore */ }
  }, []);
  const [mobileTab, setMobileTab] = useState<"instructions" | "discuss" | "code">("instructions");
  const [leftTab, setLeftTab] = useState<"instructions" | "discuss" | "outline">("instructions");
  const isMobile = useIsMobile();

  const currentStep = currentSteps[stepProgress.stepIndex];

  // Fetch steps when user selects a different language in the IDE
  useEffect(() => {
    if (ideLang === lang) {
      setStepsForLang(null);
      return;
    }
    setStepsLoading(true);
    fetch(`/api/tutorial-steps?lang=${encodeURIComponent(ideLang)}&slug=${encodeURIComponent(tutorialSlug)}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setStepsForLang(Array.isArray(d?.steps) ? d.steps : []))
      .catch(() => setStepsForLang([]))
      .finally(() => setStepsLoading(false));
  }, [ideLang, lang, tutorialSlug]);

  const stepIndexRef = useRef(stepProgress.stepIndex);
  stepIndexRef.current = stepProgress.stepIndex;

  // True while an async draft-load is in flight — prevents the debounce-save from
  // firing before the real draft arrives and accidentally overwriting it with starter code.
  const draftLoadingRef = useRef(false);
  const saveDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Load the saved draft for (tutorialSlug, stepIndex, lang) from the DB.
   * Falls back to the step's starter code if no draft exists.
   *
   * Called when: language changes, new language steps finish loading, or
   * the user navigates to a different step.
   */
  function loadDraft(stepIndex: number, langOverride?: SupportedLanguage) {
    if (currentSteps.length === 0) return;
    const targetLang = langOverride ?? ideLang;
    const safeIndex  = Math.min(stepIndex, currentSteps.length - 1);
    const starter    = currentSteps[safeIndex]?.starter ?? "";

    if (!user) {
      editor.setCode(starter);
      return;
    }

    draftLoadingRef.current = true;
    apiFetch(
      `/api/code-drafts?slug=${encodeURIComponent(tutorialSlug)}` +
      `&key=${encodeURIComponent(`step-${safeIndex}`)}` +
      `&lang=${encodeURIComponent(targetLang)}`
    )
      .then((r) => r.json())
      .then((d: { code?: string }) => {
        editor.setCode(typeof d?.code === "string" && d.code ? d.code : starter);
      })
      .catch(() => { editor.setCode(starter); })
      .finally(() => { draftLoadingRef.current = false; });
  }

  // When IDE language or its steps change, load the draft (or starter) for the current step.
  // loadDraft is excluded: it's defined inline (not useCallback) so its reference changes
  // every render — including it would cause an infinite loop. stepIndexRef is a ref, not state.
  useEffect(() => {
    loadDraft(stepIndexRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideLang, stepsForLang]);

  // When the user navigates to a different step, load the draft for that step.
  // loadDraft excluded for the same reason as above — inline function, not useCallback.
  useEffect(() => {
    loadDraft(stepProgress.stepIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepProgress.stepIndex]);

  // Debounce-save code to DB on every change (1 s idle, logged-in only)
  useEffect(() => {
    if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
    saveDraftTimerRef.current = setTimeout(() => {
      if (!user || draftLoadingRef.current) return;
      const safeIndex = Math.min(stepProgress.stepIndex, currentSteps.length - 1);
      apiFetch("/api/code-drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: tutorialSlug,
          key: `step-${safeIndex}`,
          code: editor.code,
          lang: ideLang,
        }),
      }).catch(() => {});
    }, 1000);
    return () => { if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current); };
    // Only editor.code triggers the debounce. All other deps (user, slug, lang, stepIndex)
    // are accessed via refs inside the timeout callback so they never go stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.code]);

  // Auto-switch mobile tab on pass/fail
  useEffect(() => {
    if (stepProgress.status === "passed") setMobileTab("instructions");
    if (stepProgress.status === "failed" && isMobile) setMobileTab("code");
  }, [stepProgress.status, isMobile]);

  // Load shared code from ?share= URL param on mount (client-side — page is statically generated).
  // Intentionally mount-only: the share param is a one-time initial load from the URL bar.
  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("share");
    if (encoded) {
      const decoded = tryDecodeShareCode(encoded);
      if (decoded) editor.setCode(decoded);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Reset to starter immediately and show brief confirmation. */
  function handleReset() {
    if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
    if (user) {
      const safeIndex = Math.min(stepProgress.stepIndex, currentSteps.length - 1);
      apiFetch("/api/code-drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tutorialSlug, key: `step-${safeIndex}`, lang: ideLang }),
      }).catch(() => {});
    }
    stepProgress.handleReset(currentStep, editor.setCode, editor.setErrorLines);
    setResetDone(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setResetDone(false), 2000);
  }

  const handleKeyDown = useEditorKeyDown({
    editor,
    onRun: () => stepProgress.handleRun(editor.code, editor.setErrorLines),
    onCheck: () => stepProgress.handleCheck(editor.code, currentStep, editor.setCode, editor.setErrorLines),
  });

  if (!currentStep) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        No steps found for this tutorial.
      </div>
    );
  }

  // Show conversion prompt to guests after completing their very first step
  const guestHasProgress = !user && !loading && stepProgress.completedSteps.size >= 1;

  return (
    <TutorialGate tutorialSlug={tutorialSlug} completedLessons={stepProgress.completedSteps.size}>
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Persistent top bar for guests — visible from step 0, before any code is run */}
      <GuestTopBanner show={!user && !loading} />
      {/* Slide-up prompt after first completed step */}
      <GuestConversionPrompt trigger={guestHasProgress} context="tutorial" />

      {isDragging && (
        <div className="fixed inset-0 z-[52]" style={{ cursor: isDragging === "h" ? "col-resize" : "row-resize" }} />
      )}

      {/* ── Top Bar ── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial">
          <Link href="/" className="flex items-center gap-2 rounded-md py-1 pr-2 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800" aria-label="Back to home">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">U</span>
            <span className="hidden text-sm font-bold text-zinc-800 dark:text-zinc-100 md:block">uByte</span>
          </Link>
        </div>
        <h1 className="min-w-0 max-w-[45%] flex-1 truncate text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100 md:max-w-[40%] md:flex-initial" title={tutorialTitle}>{tutorialTitle}</h1>
        <div className="flex flex-1 justify-end gap-3 md:flex-initial">
          <ThemeToggle className="hidden h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 md:flex" />
          <Suspense fallback={<div className="h-9 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />}>
            <AuthButtons />
          </Suspense>
        </div>
      </header>

      {/* Mobile tab bar */}
      <MobileTabBar
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        hasOutputError={!!(stepProgress.output && (stepProgress.outputIsError || stepProgress.status === "failed"))}
      />

      {/* Main Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className={`min-w-0 flex-col overflow-hidden bg-surface-card ${mobileTab !== "code" ? "flex shrink" : "hidden"} md:flex md:shrink-0`} style={isMobile ? undefined : { width: leftWidth }} suppressHydrationWarning>
          {/* Tab strip: ☰ hamburger | Instructions | Discuss — desktop only (mobile uses top tab bar) */}
          <div className="hidden shrink-0 items-stretch border-b border-zinc-200 dark:border-zinc-800 md:flex">
            {/* Hamburger toggle — expands/collapses the outline */}
            <button
              type="button"
              onClick={() => setLeftTab(leftTab === "outline" ? "instructions" : "outline")}
              aria-label={leftTab === "outline" ? "Close outline" : "Open course outline"}
              className={`flex w-10 shrink-0 items-center justify-center transition-colors ${
                leftTab === "outline"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              {leftTab === "outline" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="12" x2="14" y2="12" />
                  <line x1="11" y1="5.5" x2="14" y2="8" /><line x1="14" y1="8" x2="11" y2="10.5" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="12" x2="14" y2="12" />
                </svg>
              )}
            </button>

            {/* Steps / Discuss tabs */}
            {(["instructions", "discuss"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLeftTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  leftTab === tab
                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {tab === "instructions" ? "Instructions" : "Discuss"}
              </button>
            ))}
          </div>

          {!isMobile && leftTab === "outline" && (
            <CourseOutlinePanel
              lang={lang}
              tutorialSlug={tutorialSlug}
              allTutorials={allTutorials}
              allTutorialSteps={allTutorialSteps}
              stepIndex={stepProgress.stepIndex}
              progressByLang={progressByLang}
              expandedSlug={expandedSlug}
              onExpandedSlugChange={setExpandedSlug}
              completedSteps={stepProgress.completedSteps}
              skippedSteps={stepProgress.skippedSteps}
              onGoToStep={stepProgress.goToStep}
              onStepClick={() => setLeftTab("instructions")}
            />
          )}

          {(isMobile ? mobileTab === "instructions" : leftTab === "instructions") && (
            <InstructionsSidebar
              lang={lang}
              step={currentStep}
              steps={currentSteps}
              progress={stepProgress}
              tutorialSlug={tutorialSlug}
              nextTutorial={next ? { slug: next.slug, title: next.title, steps: allTutorialSteps[next.slug] ?? [] } : null}
            />
          )}

          {(isMobile ? mobileTab === "discuss" : leftTab === "discuss") && (
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <DiscussionThread
                slug={`tutorial:${lang}:${tutorialSlug}:${stepProgress.stepIndex}`}
                currentUserId={user?.id ?? null}
                isSignedIn={!!user}
              />
            </div>
          )}
        </aside>

        {/* Horizontal resize handle */}
        <div onMouseDown={startDragH} className="group relative hidden w-1 shrink-0 cursor-col-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600 md:block">
          <GripDots vertical />
        </div>

        {/* Right panel — pb-[60px] on mobile gives room above the fixed action bar */}
        <div className={`relative flex-col overflow-hidden ${mobileTab === "code" ? "flex" : "hidden"} md:flex flex-1`}>
          {/* Shared code editor surface */}
          <CodeEditor editor={editor} onKeyDown={handleKeyDown} fontSize={isMobile ? fontSize : undefined} />

          {/* Shared toolbar — desktop only */}
          <EditorToolbar
            lang={ideLang}
            onLangChange={setIdeLang}
            langOptions={Object.keys(LANGUAGES) as SupportedLanguage[]}
            extraLeft={stepsLoading ? <span className="text-xs text-zinc-500">Loading…</span> : undefined}
          >
            <button
              type="button"
              onClick={() => stepProgress.handleRun(editor.code, editor.setErrorLines)}
              disabled={stepProgress.status === "running"}
              title="Run code (Ctrl+Enter)"
              className="flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
            >
              {stepProgress.status === "running" ? "Running…" : "▶ Run"}
            </button>
            <button
              type="button"
              onClick={() => stepProgress.handleCheck(editor.code, currentStep, editor.setCode, editor.setErrorLines)}
              disabled={stepProgress.status === "running"}
              title="Check answer (Ctrl+Shift+Enter)"
              className="flex items-center gap-1.5 rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-50"
            >
              ✓ Check
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Restore the original starter code"
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                resetDone
                  ? "border-emerald-400 text-emerald-600 dark:border-emerald-600 dark:text-emerald-400"
                  : "border-zinc-300 text-zinc-500 hover:border-red-300 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-700 dark:hover:text-red-400"
              }`}
            >
              {resetDone ? "✓ Reset" : "↺ Reset"}
            </button>
            {/* Notes button — ml-auto pushes it to the right, where Share was */}
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              title="My notes for this tutorial"
              className={`ml-auto flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-all ${
                notesOpen
                  ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                  : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notes
            </button>
          </EditorToolbar>

          {/* Notes drawer — vertical side panel overlaying the editor column */}
          {notesOpen && (
            <>
              {/* Backdrop — click to close */}
              <div
                className="absolute inset-0 z-20 bg-black/20 dark:bg-black/40"
                onClick={() => setNotesOpen(false)}
              />
              {/* Drawer */}
              <div className="absolute inset-y-0 right-0 z-30 flex w-72 flex-col border-l border-zinc-200 bg-white pb-[60px] shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 md:pb-0">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">My Notes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotesOpen(false)}
                    className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    title="Close notes"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Textarea — grows to fill remaining space */}
                <textarea
                  id="tutorial-notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); }}
                  placeholder="Write your observations, questions, or ideas here…"
                  className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none dark:text-zinc-200 dark:placeholder-zinc-500"
                />

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {user ? "Saved per tutorial." : "Sign in to sync notes."}
                  </p>
                  <button
                    type="button"
                    onClick={() => { saveNotesNow(); setNotesOpen(false); }}
                    className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    Save &amp; Close
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Vertical resize handle — touch-friendly on mobile */}
          <div
            onMouseDown={startDragV}
            onTouchStart={startDragVTouch}
            className="group relative shrink-0 cursor-row-resize touch-none bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600"
            style={{ minHeight: 24 }}
            role="separator"
            aria-label="Resize output"
          >
            <GripDots />
          </div>

          {/* Output panel — single scroll, inline AI only */}
          <OutputPanel
            progress={stepProgress}
            expectedOutput={currentStep.expectedOutput}
            stepsLength={steps.length}
            onRequestHint={() => stepProgress.requestHint(editor.code)}
            height={outputHeight}
            staticHint={currentStep.hint}
          />
        </div>
      </div>

      {/* ── Mobile bottom action bar ─────────────────────────────────────────
           Icon-only on mobile for breathing room and clean aesthetics.
           The lang selector uses abbreviated display; all buttons are 44 px tall
           for comfortable tap targets (Apple HIG minimum). ──────────────────── */}
      {mobileTab === "code" && (
        <div className="fixed bottom-0 left-0 right-0 z-[54] flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
          {/* Language selector — compact, shows abbreviated name */}
          <select
            id="mobile-lang-select"
            name="language"
            value={ideLang}
            onChange={(e) => setIdeLang(e.target.value as SupportedLanguage)}
            aria-label="Code language"
            className="h-11 w-20 shrink-0 rounded-xl border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((l) => (
              <option key={l} value={l}>{LANGUAGES[l]?.name ?? l}</option>
            ))}
          </select>

          {/* Run */}
          <button
            type="button"
            onClick={() => stepProgress.handleRun(editor.code, editor.setErrorLines)}
            disabled={stepProgress.status === "running"}
            aria-label={stepProgress.status === "running" ? "Running…" : "Run code"}
            title="Run (Ctrl+Enter)"
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {stepProgress.status === "running" ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </button>

          {/* Check */}
          <button
            type="button"
            onClick={() => stepProgress.handleCheck(editor.code, currentStep, editor.setCode, editor.setErrorLines)}
            disabled={stepProgress.status === "running"}
            aria-label="Check answer"
            title="Check (Ctrl+Shift+Enter)"
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset to starter code"
            title="Reset to starter code"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              resetDone
                ? "border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            {resetDone ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>

          {/* Notes */}
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            aria-label="My notes"
            title="My notes"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              notesOpen
                ? "border-amber-400 bg-amber-50 text-amber-600 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                : "border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}
      {showSnapshots && (
        <SnapshotDrawer
          slug={tutorialSlug}
          stepIndex={stepProgress.stepIndex}
          lang={lang}
          onRestore={(code) => editor.setCode(code)}
          onClose={() => setShowSnapshots(false)}
        />
      )}


      {/* Congratulations modal */}
      {stepProgress.tutorialDone && (
        <CongratsModal
          tutorialTitle={tutorialTitle}
          lang={lang}
          tutorialSlug={tutorialSlug}
          next={next}
          onDismiss={() => stepProgress.setTutorialDone(false)}
          isPro={isPro}
        />
      )}
    </div>
    </TutorialGate>
  );
}
