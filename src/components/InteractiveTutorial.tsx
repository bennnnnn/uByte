"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { TutorialStep } from "@/lib/tutorial-steps";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import ThemeToggle from "@/components/ThemeToggle";
import Avatar from "@/components/Avatar";
import ShareButton from "@/components/ShareButton";
import UpgradeWall from "@/components/UpgradeWall";
import { hasPaidAccess } from "@/lib/plans";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { useStepProgress } from "@/hooks/useStepProgress";
import { usePanelResize } from "@/hooks/usePanelResize";
import OutputPanel from "@/components/tutorial/OutputPanel";
import InstructionsSidebar from "@/components/tutorial/InstructionsSidebar";
import CourseOutlineDrawer from "@/components/tutorial/CourseOutlineDrawer";

interface Props {
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
  tutorialTitle,
  tutorialSlug,
  steps,
  allTutorials,
  allTutorialSteps,
  next,
  isFree,
}: Props) {
  const { user, profile, logout, loading } = useAuth();

  const editor = useCodeEditor(steps[0]?.starter ?? "");
  const stepProgress = useStepProgress(steps, tutorialSlug, next, editor.setCode);
  const { leftWidth, outputHeight, isDragging, startDragH, startDragV } = usePanelResize();

  const [bookmarked, setBookmarked] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState(tutorialSlug);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileTab, setMobileTab] = useState<"instructions" | "code">("instructions");
  const [isMobile, setIsMobile] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[stepProgress.stepIndex];

  // Detect mobile
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Switch to instructions tab after passing
  useEffect(() => {
    if (stepProgress.status === "passed") setMobileTab("instructions");
  }, [stepProgress.status]);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    function handle(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showUserMenu]);

  async function handleBookmark() {
    if (!user) return;
    try {
      const res = await apiFetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorialSlug, snippet: editor.code, note: currentStep.title }),
      });
      if (res.ok) { setBookmarked(true); setTimeout(() => setBookmarked(false), 2000); }
    } catch { /* ignore */ }
  }

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
        <div className="flex items-center gap-1">
          <Link href="/" aria-label="Back to all tutorials" className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
          </Link>
          <button onClick={() => { setShowNav(true); setExpandedSlug(tutorialSlug); }} aria-label="Open course outline" className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="2" y1="4.5" x2="16" y2="4.5" /><line x1="2" y1="9" x2="16" y2="9" /><line x1="2" y1="13.5" x2="16" y2="13.5" /></svg>
          </button>
        </div>
        <h1 className="max-w-[40%] truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{tutorialTitle}</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" />
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setShowUserMenu((v) => !v)} title={user ? "Account" : "Log in"} className="flex items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800">
              {user ? (
                <>
                  <Avatar avatarKey={profile?.avatar ?? "gopher"} size="sm" />
                  <svg className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" /></svg>
              )}
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                {user ? (
                  <>
                    <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                      {profile && <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400"><span>⭐ {profile.xp} XP</span><span>🔥 {profile.streak_days}d streak</span></div>}
                    </div>
                    <div className="py-1">
                      {profile?.isAdmin && <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-700 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"><svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Admin</Link>}
                      <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"><svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Profile</Link>
                      <Link href="/profile?tab=bookmarks" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"><svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>Bookmarks</Link>
                      <Link href="/profile?tab=settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"><svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Settings</Link>
                    </div>
                    <div className="border-t border-zinc-100 py-1 dark:border-zinc-800">
                      <button onClick={() => { setShowUserMenu(false); logout(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Log out</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="border-b border-zinc-100 px-4 py-2.5 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">Not signed in</p>
                    <div className="py-1">
                      <Link href="/" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Log in</Link>
                      <Link href="/" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Sign up</Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="flex shrink-0 border-b border-zinc-200 dark:border-zinc-800 md:hidden">
        {(["instructions", "code"] as const).map((tab) => (
          <button key={tab} onClick={() => setMobileTab(tab)} className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${mobileTab === tab ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"}`}>
            {tab === "instructions" ? "Instructions" : "Code Editor"}
          </button>
        ))}
      </div>

      {/* Main Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className={`flex shrink-0 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900 ${mobileTab === "instructions" ? "flex" : "hidden"} md:flex`} style={isMobile ? undefined : { width: leftWidth }} suppressHydrationWarning>
          <InstructionsSidebar
            step={currentStep}
            stepIndex={stepProgress.stepIndex}
            steps={steps}
            status={stepProgress.status}
            showHint={stepProgress.showHint}
            onToggleHint={() => stepProgress.setShowHint(!stepProgress.showHint)}
            failCount={stepProgress.failCount}
            completedSteps={stepProgress.completedSteps}
            onGoToStep={stepProgress.goToStep}
            onSkip={stepProgress.skipStep}
            tutorialSlug={tutorialSlug}
          />
        </aside>

        {/* Horizontal resize handle */}
        <div onMouseDown={startDragH} className="group relative hidden w-1 shrink-0 cursor-col-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600 md:block">
          <GripDots vertical />
        </div>

        {/* Right panel */}
        <div className={`flex-col overflow-hidden ${mobileTab === "code" ? "flex" : "hidden"} md:flex flex-1`}>
          {/* Code editor */}
          <div className="flex flex-1 overflow-hidden bg-zinc-950 font-mono text-sm leading-6">
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

          {/* Toolbar */}
          <div className="flex shrink-0 items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
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
          </div>

          {/* Vertical resize handle */}
          <div onMouseDown={startDragV} className="group relative h-1 shrink-0 cursor-row-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600">
            <GripDots />
          </div>

          {/* Output panel */}
          <OutputPanel
            output={stepProgress.output}
            outputIsError={stepProgress.outputIsError}
            status={stepProgress.status}
            aiFeedback={stepProgress.aiFeedback}
            expectedOutput={currentStep.expectedOutput}
            stepIndex={stepProgress.stepIndex}
            stepsLength={steps.length}
            showInlineChat={stepProgress.showInlineChat}
            onToggleChat={() => stepProgress.setShowInlineChat(!stepProgress.showInlineChat)}
            chatSlug={`${tutorialSlug}-step-${stepProgress.stepIndex}`}
            stepContext={{ title: currentStep.title, instruction: currentStep.instruction, expectedOutput: currentStep.expectedOutput, currentCode: editor.code }}
            height={outputHeight}
          />
        </div>
      </div>

      {/* Course outline drawer */}
      <CourseOutlineDrawer
        show={showNav}
        onClose={() => setShowNav(false)}
        allTutorials={allTutorials}
        allTutorialSteps={allTutorialSteps}
        tutorialSlug={tutorialSlug}
        stepIndex={stepProgress.stepIndex}
        completedSteps={stepProgress.completedSteps}
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
              <ShareButton text={`I just completed "${tutorialTitle}" on uByte! 🐹`} url={typeof window !== "undefined" ? `${window.location.origin}/golang/${tutorialSlug}` : ""} />
              {next ? (
                <Link href={`/golang/${next.slug}`} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800">Next: {next.title} →</Link>
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
