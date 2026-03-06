"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import type { TutorialStep } from "@/lib/tutorial-steps";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
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
import ShortcutsModal from "@/components/tutorial/ShortcutsModal";
import SnapshotDrawer from "@/components/tutorial/SnapshotDrawer";
import { useChallengeTimer } from "@/hooks/useChallengeTimer";
import { tutorialUrl } from "@/lib/urls";
import { useToast } from "@/components/Toast";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

interface Props {
  lang: string;
  tutorialTitle: string;
  tutorialSlug: string;
  steps: TutorialStep[];
  allTutorials: { slug: string; title: string; order: number; difficulty: string; estimatedMinutes: number }[];
  allTutorialSteps: Record<string, { index: number; title: string }[]>;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  currentOrder: number;
  totalTutorials: number;
  isFree: boolean;
}

function GripDots({ vertical }: { vertical?: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${vertical ? "flex-col gap-0.5" : "gap-0.5"}`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      ))}
    </div>
  );
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
  const { toast } = useToast();

  const [ideLang, setIdeLang] = useState<SupportedLanguage>(lang as SupportedLanguage);
  const [stepsForLang, setStepsForLang] = useState<TutorialStep[] | null>(null);
  const [stepsLoading, setStepsLoading] = useState(false);
  const currentSteps = ideLang === lang ? steps : (stepsForLang ?? steps);

  const editor = useCodeEditor(currentSteps[0]?.starter ?? "", ideLang);
  const stepProgress = useStepProgress(currentSteps, ideLang, tutorialSlug, next, editor.setCode, user?.id);
  const { leftWidth, outputHeight, isDragging, startDragH, startDragV, startDragVTouch } = usePanelResize();

  const [bookmarked, setBookmarked] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState(tutorialSlug);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{ totalMs: number; personalBest: number | null } | null>(null);
  const challengeTimer = useChallengeTimer();
  const [fontSize, setFontSize] = useState<14 | 16 | 18>(() => {
    try { const s = localStorage.getItem("ide-font-size"); if (s === "16") return 16; if (s === "18") return 18; } catch { /* ignore */ }
    return 14;
  });
  const [mobileTab, setMobileTab] = useState<"instructions" | "code">("instructions");
  const [isMobile, setIsMobile] = useState(false);

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

  // When IDE language or steps change, reset editor to the starter for the current step
  const stepIndexRef = useRef(stepProgress.stepIndex);
  stepIndexRef.current = stepProgress.stepIndex;
  useEffect(() => {
    if (currentSteps.length === 0) return;
    const safeIndex = Math.min(stepIndexRef.current, currentSteps.length - 1);
    editor.setCode(currentSteps[safeIndex]?.starter ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideLang, stepsForLang]);

  // Detect mobile
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-switch mobile tab on pass/fail
  useEffect(() => {
    if (stepProgress.status === "passed") setMobileTab("instructions");
    if (stepProgress.status === "failed" && isMobile) setMobileTab("code");
  }, [stepProgress.status, isMobile]);

  // Challenge mode: stop timer on tutorial completion
  useEffect(() => {
    if (!challengeMode || !stepProgress.tutorialDone) return;
    const totalMs = challengeTimer.stop();
    if (!user) return;
    apiFetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: tutorialSlug, totalMs, stepsCount: steps.length }),
    })
      .then((r) => r.json())
      .then((d) => setChallengeResult({ totalMs, personalBest: d.personalBest ?? totalMs }))
      .catch(() => setChallengeResult({ totalMs, personalBest: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when tutorial completes in challenge mode
  }, [stepProgress.tutorialDone, challengeMode]);

  async function handleBookmark() {
    if (!user) {
      toast("Sign in to save bookmarks", "error");
      return;
    }
    try {
      const res = await apiFetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorialSlug, snippet: editor.code, note: currentStep.title, lang }),
      });
      if (res.ok) {
        setBookmarked(true);
        setTimeout(() => setBookmarked(false), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data?.error ?? "Failed to save bookmark", "error");
      }
    } catch {
      toast("Failed to save bookmark", "error");
    }
  }

  // Global ? key → shortcuts modal (only when not typing in textarea)
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if (e.key === "?" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      }
    }
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = editor.textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = editor.code.slice(0, start) + "    " + editor.code.slice(end);
      editor.setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        stepProgress.handleCheck(editor.code, currentStep, editor.setCode, editor.setErrorLines);
      } else {
        stepProgress.handleRun(editor.code, editor.setErrorLines);
      }
    }
  }

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
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
        <h1 className="min-w-0 max-w-[45%] flex-1 truncate text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100 md:max-w-[40%] md:flex-initial">{tutorialTitle}</h1>
        <div className="flex flex-1 justify-end gap-3 md:flex-initial">
          {user && (
            <>
              {challengeMode && (
                <div className="hidden items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 shadow-sm dark:border-amber-700 dark:bg-amber-950/80 sm:flex">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Challenge</span>
                  <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-300">{challengeTimer.display}</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (!challengeMode) {
                    setChallengeMode(true);
                    challengeTimer.reset();
                    challengeTimer.start();
                  } else {
                    setChallengeMode(false);
                    challengeTimer.reset();
                  }
                }}
                title="Toggle challenge mode"
                className={`hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:flex ${
                  challengeMode
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                ⏱ {challengeMode ? "Stop" : "Challenge"}
              </button>
            </>
          )}
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
          <button onClick={() => { const s = fontSize === 18 ? 16 : 14; setFontSize(s); try { localStorage.setItem("ide-font-size", String(s)); } catch { /* ignore */ } }} className="rounded px-1.5 py-1 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">A⁻</button>
          <button onClick={() => { const s = fontSize === 14 ? 16 : 18; setFontSize(s); try { localStorage.setItem("ide-font-size", String(s)); } catch { /* ignore */ } }} className="rounded px-1.5 py-1 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">A⁺</button>
        </div>
      </div>

      {/* Main Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className={`flex min-w-0 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900 ${mobileTab === "instructions" ? "flex shrink" : "hidden"} md:flex md:shrink-0`} style={isMobile ? undefined : { width: leftWidth }} suppressHydrationWarning>
          <InstructionsSidebar
            lang={lang}
            step={currentStep}
            stepIndex={stepProgress.stepIndex}
            steps={currentSteps}
            status={stepProgress.status}
            showHint={stepProgress.showHint}
            onToggleHint={() => stepProgress.setShowHint(!stepProgress.showHint)}
            failCount={stepProgress.failCount}
            completedSteps={stepProgress.completedSteps}
            skippedSteps={stepProgress.skippedSteps}
            onGoToStep={stepProgress.goToStep}
            onSkip={stepProgress.skipStep}
            tutorialSlug={tutorialSlug}
            tutorialDone={stepProgress.tutorialDone}
            nextTutorial={next ? { slug: next.slug, steps: allTutorialSteps[next.slug] ?? [] } : null}
          />
        </aside>

        {/* Horizontal resize handle */}
        <div onMouseDown={startDragH} className="group relative hidden w-1 shrink-0 cursor-col-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600 md:block">
          <GripDots vertical />
        </div>

        {/* Right panel */}
        <div className={`flex-col overflow-hidden ${mobileTab === "code" ? "flex" : "hidden"} md:flex flex-1`}>
          {/* Code editor */}
          <div className="flex flex-1 overflow-hidden bg-zinc-950 font-mono leading-6" style={{ fontSize: isMobile ? fontSize : undefined }}>
            <div ref={editor.lineNumRef} aria-hidden className="shrink-0 select-none overflow-hidden border-r border-zinc-800 bg-zinc-900 px-3 py-4 text-right text-zinc-600">
              {editor.code.split("\n").map((_, i) => (
                <div key={i} className={editor.errorLines.has(i + 1) ? "text-red-400" : ""}>
                  {editor.errorLines.has(i + 1) ? "▶" : i + 1}
                </div>
              ))}
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div ref={editor.highlightRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {[...editor.errorLines].map((ln) => (
                  <div key={ln} className="absolute left-0 right-0 bg-red-500/10" style={{ top: 16 + (ln - 1) * 24, height: 24 }} />
                ))}
              </div>
              <pre ref={editor.preRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre py-4 pl-4 pr-8 text-zinc-100" dangerouslySetInnerHTML={{ __html: editor.highlightGo(editor.code) + "\n" }} />
              <textarea ref={editor.textareaRef} value={editor.code} onChange={(e) => editor.setCode(e.target.value)} onScroll={editor.syncScroll} onKeyDown={handleKeyDown} spellCheck={false} autoCorrect="off" autoCapitalize="off" aria-label="Code editor" className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent py-4 pl-4 pr-8 text-transparent caret-white outline-none selection:bg-indigo-900/50" />
            </div>
          </div>

          {/* Toolbar — desktop only; mobile uses single bottom bar when on Code tab */}
          <div className="hidden shrink-0 items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900 md:flex">
            <select
              value={ideLang}
              onChange={(e) => setIdeLang(e.target.value as SupportedLanguage)}
              aria-label="Code language"
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((l) => (
                <option key={l} value={l}>{LANGUAGES[l].name}</option>
              ))}
            </select>
            {stepsLoading && <span className="text-xs text-zinc-500">Loading…</span>}
            <button onClick={() => stepProgress.handleRun(editor.code, editor.setErrorLines)} disabled={stepProgress.status === "running"} title="Run code (Ctrl+Enter)" className="flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/70">
              {stepProgress.status === "running" ? "Running…" : "▶ Run"}
            </button>
            <button onClick={() => stepProgress.handleCheck(editor.code, currentStep, editor.setCode, editor.setErrorLines)} disabled={stepProgress.status === "running"} title="Check answer (Ctrl+Shift+Enter)" className="flex items-center gap-1.5 rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-50">
              ✓ Check
            </button>
            <button onClick={() => stepProgress.handleReset(currentStep, editor.setCode, editor.setErrorLines)} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200">
              Reset
            </button>
            {user && (
              <button onClick={handleBookmark} title="Bookmark this code" className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${bookmarked ? "border-indigo-400 text-indigo-600 dark:border-indigo-600 dark:text-indigo-400" : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"}`}>
                <svg className="h-3.5 w-3.5" fill={bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {bookmarked ? "Saved!" : "Bookmark"}
              </button>
            )}
            {user && (
              <button onClick={() => setShowSnapshots(true)} title="Code history" className="flex items-center gap-1.5 rounded-md border border-zinc-400 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                History
              </button>
            )}
            <button
              onClick={() => setShowShortcuts(true)}
              title="Keyboard shortcuts (?)"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 text-xs font-bold text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
            >
              ?
            </button>
          </div>

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
            output={stepProgress.output}
            outputIsError={stepProgress.outputIsError}
            status={stepProgress.status}
            aiFeedback={stepProgress.aiFeedback}
            aiFeedbackLoading={stepProgress.aiFeedbackLoading}
            expectedOutput={currentStep.expectedOutput}
            stepIndex={stepProgress.stepIndex}
            stepsLength={steps.length}
            onRequestHint={() => stepProgress.requestHint(editor.code)}
            height={outputHeight}
          />
        </div>
      </div>

      {/* Mobile bottom bar — only when on Code tab (not on Instructions) */}
      {mobileTab === "code" && (
        <div className="fixed bottom-0 left-0 right-0 z-[54] flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
          <select
            value={ideLang}
            onChange={(e) => setIdeLang(e.target.value as SupportedLanguage)}
            aria-label="Code language"
            className="w-24 shrink-0 rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((l) => (
              <option key={l} value={l}>{LANGUAGES[l].name}</option>
            ))}
          </select>
          <button onClick={() => stepProgress.handleRun(editor.code, editor.setErrorLines)} disabled={stepProgress.status === "running"} className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-100 py-2 text-sm font-medium text-green-800 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300">
            {stepProgress.status === "running" ? "…" : "▶ Run"}
          </button>
          <button onClick={() => stepProgress.handleCheck(editor.code, currentStep, editor.setCode, editor.setErrorLines)} disabled={stepProgress.status === "running"} className="flex flex-1 items-center justify-center gap-1 rounded-md bg-indigo-700 py-2 text-sm font-medium text-white disabled:opacity-50">
            ✓ Check
          </button>
          <button onClick={() => stepProgress.handleReset(currentStep, editor.setCode, editor.setErrorLines)} className="flex shrink-0 items-center justify-center rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Reset
          </button>
        </div>
      )}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
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
            {challengeResult && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">🏁 Challenge Complete!</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Time: <span className="font-mono font-bold">{challengeTimer.display}</span>
                  {challengeResult.personalBest !== null && challengeResult.personalBest <= challengeResult.totalMs && (
                    <span className="ml-2">🏆 New personal best!</span>
                  )}
                </p>
              </div>
            )}
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
