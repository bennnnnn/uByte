"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import type { TutorialStep } from "@/lib/tutorial-steps";
import { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButtons from "@/components/AuthButtons";
import ShareButton from "@/components/ShareButton";
import UpgradeWall from "@/components/UpgradeWall";
import { hasPaidAccess } from "@/lib/plans";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { useStepProgress } from "@/hooks/useStepProgress";
import { usePanelResize } from "@/hooks/usePanelResize";
import OutputPanel from "@/components/tutorial/OutputPanel";
import InstructionsSidebar from "@/components/tutorial/InstructionsSidebar";
import CourseOutlineDrawer from "@/components/tutorial/CourseOutlineDrawer";
import SnapshotDrawer from "@/components/tutorial/SnapshotDrawer";
import { tutorialUrl } from "@/lib/urls";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import GripDots from "@/components/GripDots";
import { useIsMobile } from "@/hooks/useIsMobile";
import GuestConversionPrompt from "@/components/GuestConversionPrompt";
import GuestTopBanner from "@/components/GuestTopBanner";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { useShareCode } from "@/hooks/useShareCode";
import { useEditorKeyDown } from "@/hooks/useEditorKeyDown";
import { tryDecodeShareCode } from "@/lib/share-code";
import { apiFetch } from "@/lib/api-client";

interface Props {
  lang: string;
  tutorialTitle: string;
  tutorialSlug: string;
  steps: TutorialStep[];
  allTutorials: { slug: string; title: string; order: number; difficulty: string; estimatedMinutes: number }[];
  allTutorialSteps: Record<string, { index: number; title: string }[]>;
  next: { slug: string; title: string } | null;
  isFree: boolean;
}

export default function InteractiveTutorial({
  lang,
  tutorialTitle,
  tutorialSlug,
  steps,
  allTutorials,
  allTutorialSteps,
  next,
  isFree,
}: Props) {
  const { user, profile, loading } = useAuth();

  const [ideLang, setIdeLang] = useState<SupportedLanguage>(lang as SupportedLanguage);
  const [stepsForLang, setStepsForLang] = useState<TutorialStep[] | null>(null);
  const [stepsLoading, setStepsLoading] = useState(false);
  const currentSteps = ideLang === lang ? steps : (stepsForLang ?? steps);

  const editor = useCodeEditor(currentSteps[0]?.starter ?? "", ideLang);
  const stepProgress = useStepProgress(currentSteps, ideLang, tutorialSlug, next, editor.setCode, user?.id);
  const { leftWidth, outputHeight, isDragging, startDragH, startDragV, startDragVTouch } = usePanelResize();

  const [showNav, setShowNav] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState(tutorialSlug);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const { shareCopied, handleShare } = useShareCode(() => editor.code);
  const [fontSize, setFontSize] = useState<14 | 16 | 18>(() => {
    try { const s = localStorage.getItem("ide-font-size"); if (s === "16") return 16; if (s === "18") return 18; } catch { /* ignore */ }
    return 14;
  });
  const [mobileTab, setMobileTab] = useState<"instructions" | "code">("instructions");
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

  // When IDE language or its steps change, load the draft (or starter) for the current step
  useEffect(() => {
    loadDraft(stepIndexRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideLang, stepsForLang]);

  // When the user navigates to a different step, load the draft for that step
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.code]);

  // Auto-switch mobile tab on pass/fail
  useEffect(() => {
    if (stepProgress.status === "passed") setMobileTab("instructions");
    if (stepProgress.status === "failed" && isMobile) setMobileTab("code");
  }, [stepProgress.status, isMobile]);

  // Load shared code from ?share= URL param on mount (client-side — page is statically generated)
  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("share");
    if (encoded) {
      const decoded = tryDecodeShareCode(encoded);
      if (decoded) editor.setCode(decoded);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Reset to starter and delete the saved draft for the current step. */
  function handleReset() {
    // Ask for confirmation — user may have written code they didn't mean to lose.
    const confirmed = window.confirm(
      "This will restore the original starter code and delete your current changes for this step.\n\nAre you sure?"
    );
    if (!confirmed) return;

    // Cancel any in-flight save so it doesn't undo the delete
    if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
    // Delete the user's saved draft from DB (starter code never lives in the DB)
    if (user) {
      const safeIndex = Math.min(stepProgress.stepIndex, currentSteps.length - 1);
      apiFetch("/api/code-drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tutorialSlug, key: `step-${safeIndex}`, lang: ideLang }),
      }).catch(() => {});
    }
    stepProgress.handleReset(currentStep, editor.setCode, editor.setErrorLines);
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

  if (!isFree && !loading && !hasPaidAccess(profile?.plan)) {
    return <UpgradeWall tutorialTitle={tutorialTitle} />;
  }

  // Show conversion prompt to guests after completing their very first step
  const guestHasProgress = !user && !loading && stepProgress.completedSteps.size >= 1;

  return (
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
          <button onClick={() => { setShowNav(true); setExpandedSlug(tutorialSlug); }} aria-label="Open course outline" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 md:h-8 md:w-8 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="2" y1="4.5" x2="16" y2="4.5" /><line x1="2" y1="9" x2="16" y2="9" /><line x1="2" y1="13.5" x2="16" y2="13.5" /></svg>
          </button>
          <Link href="/" className="hidden items-center gap-2 rounded-md py-1 pr-2 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 md:flex" aria-label="Back to home">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">U</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">uByte</span>
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
      <div className="flex shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800 md:hidden">
        {(["instructions", "code"] as const).map((tab) => (
          <button key={tab} onClick={() => setMobileTab(tab)} className={`relative flex-1 py-2 text-sm font-medium capitalize transition-colors ${mobileTab === tab ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"}`}>
            {tab === "instructions" ? "Instructions" : (
              <>
                Code Editor
                {stepProgress.output && (stepProgress.outputIsError || stepProgress.status === "failed") && mobileTab !== "code" && (
                  <span className="absolute right-6 top-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </>
            )}
          </button>
        ))}
        {/* Font size controls — mobile only */}
        <div className="flex items-center gap-0.5 px-2">
          <button onClick={() => { const s = fontSize === 18 ? 16 : 14; setFontSize(s); try { localStorage.setItem("ide-font-size", String(s)); } catch { /* ignore */ } }} aria-label="Decrease font size" className="rounded px-1.5 py-1 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">A⁻</button>
          <button onClick={() => { const s = fontSize === 14 ? 16 : 18; setFontSize(s); try { localStorage.setItem("ide-font-size", String(s)); } catch { /* ignore */ } }} aria-label="Increase font size" className="rounded px-1.5 py-1 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">A⁺</button>
        </div>
      </div>

      {/* Main Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className={`flex min-w-0 flex-col overflow-hidden bg-surface-card ${mobileTab === "instructions" ? "flex shrink" : "hidden"} md:flex md:shrink-0`} style={isMobile ? undefined : { width: leftWidth }} suppressHydrationWarning>
          <InstructionsSidebar
            lang={lang}
            step={currentStep}
            steps={currentSteps}
            progress={stepProgress}
            tutorialSlug={tutorialSlug}
            nextTutorial={next ? { slug: next.slug, steps: allTutorialSteps[next.slug] ?? [] } : null}
          />
        </aside>

        {/* Horizontal resize handle */}
        <div onMouseDown={startDragH} className="group relative hidden w-1 shrink-0 cursor-col-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600 md:block">
          <GripDots vertical />
        </div>

        {/* Right panel */}
        <div className={`flex-col overflow-hidden ${mobileTab === "code" ? "flex" : "hidden"} md:flex flex-1`}>
          {/* Shared code editor surface */}
          <CodeEditor editor={editor} onKeyDown={handleKeyDown} fontSize={isMobile ? fontSize : undefined} />

          {/* Shared toolbar — desktop only */}
          <EditorToolbar
            lang={ideLang}
            onLangChange={setIdeLang}
            langOptions={Object.keys(LANGUAGES) as SupportedLanguage[]}
            shareCopied={shareCopied}
            onShare={handleShare}
            extraLeft={stepsLoading ? <span className="text-xs text-zinc-500">Loading…</span> : undefined}
          >
            <button
              type="button"
              onClick={() => stepProgress.handleRun(editor.code, editor.setErrorLines)}
              disabled={stepProgress.status === "running"}
              title="Run code (Ctrl+Enter)"
              className="flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/70"
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
              title="Restore the original starter code — your changes will be deleted"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-red-300 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-700 dark:hover:text-red-400"
            >
              ↺ Reset starter
            </button>
          </EditorToolbar>

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
          />
        </div>
      </div>

      {/* Mobile bottom bar — shared EditorToolbar in mobile mode */}
      {mobileTab === "code" && (
        <EditorToolbar
          lang={ideLang}
          onLangChange={setIdeLang}
          langOptions={Object.keys(LANGUAGES) as SupportedLanguage[]}
          shareCopied={shareCopied}
          onShare={handleShare}
          mobile
        >
          <button
            type="button"
            onClick={() => stepProgress.handleRun(editor.code, editor.setErrorLines)}
            disabled={stepProgress.status === "running"}
            aria-label={stepProgress.status === "running" ? "Running" : "Run code"}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-100 py-2 text-sm font-medium text-green-800 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300"
          >
            {stepProgress.status === "running" ? "…" : "▶ Run"}
          </button>
          <button
            type="button"
            onClick={() => stepProgress.handleCheck(editor.code, currentStep, editor.setCode, editor.setErrorLines)}
            disabled={stepProgress.status === "running"}
            aria-label="Check answer"
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-indigo-700 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            ✓ Check
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset to original starter code"
            className="flex shrink-0 items-center justify-center rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
          >
            ↺
          </button>
        </EditorToolbar>
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

      {/* Course outline drawer */}
      <CourseOutlineDrawer
        lang={lang}
        show={showNav}
        onClose={() => setShowNav(false)}
        allTutorials={allTutorials}
        allTutorialSteps={allTutorialSteps}
        tutorialSlug={tutorialSlug}
        stepIndex={stepProgress.stepIndex}
        completedSteps={stepProgress.completedSteps}
        skippedSteps={stepProgress.skippedSteps}
        expandedSlug={expandedSlug}
        onExpandSlug={setExpandedSlug}
        onGoToStep={stepProgress.goToStep}
      />

      {/* Congratulations modal */}
      {stepProgress.tutorialDone && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="congrats-title">
          <div className="w-full max-w-md rounded-2xl border border-emerald-300 bg-white p-8 text-center shadow-2xl dark:border-emerald-800 dark:bg-zinc-900">
            <div className="mb-3 text-5xl">🎉</div>
            <h2 id="congrats-title" className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Tutorial Complete!</h2>
            <p className="mb-2 text-zinc-500 dark:text-zinc-400">You finished <span className="font-medium text-zinc-800 dark:text-zinc-200">{tutorialTitle}</span>. Great work!</p>
            <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">{next ? `Continuing to "${next.title}" in ${stepProgress.countdown}…` : `Returning home in ${stepProgress.countdown}…`}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => stepProgress.setTutorialDone(false)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Review steps</button>
              <ShareButton text={`I just completed "${tutorialTitle}" on uByte! 🐹`} url={typeof window !== "undefined" ? `${window.location.origin}${tutorialUrl(lang, tutorialSlug)}` : ""} />
              {next ? (
                <Link href={tutorialUrl(lang, next.slug)} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800">Next: {next.title} →</Link>
              ) : (
                <Link href="/" className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800">All Tutorials</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
