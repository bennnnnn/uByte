"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import type { TutorialStep } from "@/lib/tutorial-steps";
import { highlightGo } from "@/lib/highlight-go";
import { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import Avatar from "@/components/Avatar";
import TutorialRating from "@/components/TutorialRating";
import ShareButton from "@/components/ShareButton";

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
}

type Status = "idle" | "running" | "passed" | "failed";

function checkOutput(output: string, expected: string[]): boolean {
  if (!output.trim()) return false;
  if (expected.length === 0) return true;
  const lower = output.toLowerCase();
  return expected.every((s) => lower.includes(s.toLowerCase()));
}

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
  prev,
  next,
}: Props) {
  const { user, profile, toggleProgress, progress, logout } = useAuth();
  const router = useRouter();

  // ── Tutorial state ──
  const [stepIndex, setStepIndex] = useState(0);
  const [code, setCode] = useState(steps[0]?.starter ?? "");
  const [output, setOutput] = useState<string | null>(null);
  const [outputIsError, setOutputIsError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [showHint, setShowHint] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showNav, setShowNav] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string>(tutorialSlug);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mobileTab, setMobileTab] = useState<"instructions" | "code">("instructions");
  const [isMobile, setIsMobile] = useState(false);

  // ── Resize state — persisted in localStorage ──
  // Initialize with defaults (matches SSR); hydrate from localStorage after mount
  const [leftWidth, setLeftWidth] = useState(320);
  const [outputHeight, setOutputHeight] = useState(176);
  const [isDragging, setIsDragging] = useState<false | "h" | "v">(false);

  const dragState = useRef<{ type: "h" | "v"; startX: number; startY: number; startValue: number } | null>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const markedRef = useRef(false);

  const currentStep = steps[stepIndex];

  // ── Drag resize ──
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const ds = dragState.current;
      if (!ds) return;
      if (ds.type === "h") {
        setLeftWidth(Math.max(200, Math.min(620, ds.startValue + (e.clientX - ds.startX))));
      } else {
        setOutputHeight(Math.max(60, Math.min(520, ds.startValue + (ds.startY - e.clientY))));
      }
    }
    function onMouseUp() {
      if (dragState.current) { dragState.current = null; setIsDragging(false); }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, []);

  function startDragH(e: React.MouseEvent) {
    e.preventDefault();
    dragState.current = { type: "h", startX: e.clientX, startY: 0, startValue: leftWidth };
    setIsDragging("h");
  }
  function startDragV(e: React.MouseEvent) {
    e.preventDefault();
    dragState.current = { type: "v", startX: 0, startY: e.clientY, startValue: outputHeight };
    setIsDragging("v");
  }

  // ── Close user menu on outside click ──
  useEffect(() => {
    if (!showUserMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // ── Detect mobile (post-hydration only) ──
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Hydrate panel sizes from localStorage after mount (avoids SSR mismatch) ──
  useEffect(() => {
    const w = Number(localStorage.getItem("it-leftWidth"));
    const h = Number(localStorage.getItem("it-outputHeight"));
    if (w) setLeftWidth(w);
    if (h) setOutputHeight(h);
  }, []);

  // ── Persist panel sizes ──
  useEffect(() => { localStorage.setItem("it-leftWidth", String(leftWidth)); }, [leftWidth]);
  useEffect(() => { localStorage.setItem("it-outputHeight", String(outputHeight)); }, [outputHeight]);

  // ── Deep-link: read ?step=N from URL on mount ──
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get("step");
    if (s !== null) {
      const idx = parseInt(s, 10);
      if (!isNaN(idx) && idx >= 0 && idx < steps.length) {
        setStepIndex(idx);
        setCode(steps[idx].starter);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tutorial completion ──
  useEffect(() => {
    if (completedSteps.size === steps.length && steps.length > 0 && !markedRef.current && !progress.includes(tutorialSlug)) {
      markedRef.current = true;
      setTutorialDone(true);
      toggleProgress(tutorialSlug);
    }
  }, [completedSteps, steps.length, tutorialSlug, toggleProgress, progress]);

  // ── Auto-advance countdown ──
  useEffect(() => {
    if (!tutorialDone) return;
    function resetCount() { setCountdown(3); }
    resetCount();
    // Fire confetti
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    const id = setInterval(function tick() {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [tutorialDone]);

  useEffect(() => {
    if (!tutorialDone || countdown > 0) return;
    router.push(next ? `/golang/${next.slug}` : "/");
  }, [countdown, tutorialDone, next, router]);

  // ── Switch mobile tab to instructions after passing ──
  useEffect(() => {
    if (status === "passed") setMobileTab("instructions");
  }, [status]);

  // ── Auto-advance to next step after passing ──
  useEffect(() => {
    if (status !== "passed" || stepIndex >= steps.length - 1) return;
    const id = setTimeout(function advance() {
      setStepIndex(stepIndex + 1);
      setCode(steps[stepIndex + 1].starter);
      setOutput(null);
      setStatus("idle");
      setShowHint(false);
    }, 2000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stepIndex]);

  function syncScroll() {
    if (textareaRef.current) {
      if (preRef.current) {
        preRef.current.scrollTop = textareaRef.current.scrollTop;
        preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
      if (lineNumRef.current) {
        lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        handleCheck();
      } else {
        handleRun();
      }
    }
  }

  function goToStep(idx: number) {
    setStepIndex(idx);
    setCode(steps[idx].starter);
    setOutput(null);
    setStatus("idle");
    setShowHint(false);
    setFailCount(0);
  }

  async function runCodeRequest(currentCode: string) {
    const res = await fetch("/api/run-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: currentCode }),
    });
    const data = await res.json();
    if (data.Errors) return { output: data.Errors as string, hasError: true };
    const out = ((data.Events ?? []) as { Kind: string; Message: string }[])
      .filter((e) => e.Kind === "stdout").map((e) => e.Message).join("");
    return { output: out, hasError: false };
  }

  async function handleRun() {
    setStatus("running"); setOutput(null);
    try {
      const { output: out, hasError } = await runCodeRequest(code);
      setOutputIsError(hasError);
      setOutput(out || (hasError ? "Compilation error (see above)" : "(no output)"));
      setStatus("idle");
    } catch {
      setOutputIsError(true);
      setOutput("Could not reach the Go compiler. Please try again.");
      setStatus("idle");
    }
  }

  async function handleCheck() {
    setStatus("running"); setOutput(null);
    try {
      const { output: out, hasError } = await runCodeRequest(code);
      setOutputIsError(hasError);
      setOutput(out || (hasError ? "Compilation error" : "(no output)"));
      if (hasError) { setStatus("failed"); return; }
      if (checkOutput(out, currentStep.expectedOutput)) {
        setStatus("passed");
        setFailCount(0);
        setCompletedSteps((prev) => new Set([...prev, stepIndex]));
      } else {
        setStatus("failed");
        setFailCount((n) => n + 1);
      }
    } catch {
      setOutput("Could not reach the Go compiler. Please try again.");
      setStatus("failed");
    }
  }

  function handleReset() { setCode(currentStep.starter); setOutput(null); setStatus("idle"); }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* ignore */ }
  }

  if (!currentStep) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        No steps found for this tutorial.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">

      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[52]" style={{ cursor: isDragging === "h" ? "col-resize" : "row-resize" }} />
      )}

      {/* ── Top Bar ── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-1">
          <Link
            href="/"
            aria-label="Back to all tutorials"
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </Link>
          <button
            onClick={() => { setShowNav(true); setExpandedSlug(tutorialSlug); }}
            aria-label="Open course outline"
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="4.5" x2="16" y2="4.5" /><line x1="2" y1="9" x2="16" y2="9" /><line x1="2" y1="13.5" x2="16" y2="13.5" />
            </svg>
          </button>
        </div>

        <h1 className="max-w-[40%] truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {tutorialTitle}
        </h1>

        <div className="flex items-center gap-3">
          <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" />

          {/* User icon — always visible; opens dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              title={user ? "Account" : "Log in"}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-75"
            >
              {user ? (
                <Avatar avatarKey={profile?.avatar ?? "gopher"} size="sm" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
                </svg>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-10 z-[60] w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                {user ? (
                  <>
                    <div className="border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
                      <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">{user.name}</p>
                      <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={async () => { setShowUserMenu(false); await logout(); }}
                      className="flex w-full items-center px-3 py-2 text-sm text-red-500 hover:bg-zinc-50 dark:text-red-400 dark:hover:bg-zinc-800"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="border-b border-zinc-100 px-3 py-2 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">Not signed in</p>
                    <Link
                      href="/"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile tab bar ── */}
      <div className="flex shrink-0 border-b border-zinc-200 dark:border-zinc-800 md:hidden">
        <button
          onClick={() => setMobileTab("instructions")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mobileTab === "instructions"
              ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Instructions
        </button>
        <button
          onClick={() => setMobileTab("code")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mobileTab === "code"
              ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Code Editor
        </button>
      </div>

      {/* ── Main Split ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel ── */}
        <aside
          className={`flex shrink-0 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900 ${
            mobileTab === "instructions" ? "flex" : "hidden"
          } md:flex`}
          style={isMobile ? undefined : { width: leftWidth }}
          suppressHydrationWarning
        >
          <div className="flex-1 overflow-y-auto p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-500">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {currentStep.title}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {currentStep.instruction.split("\n").map((line, i) => (
                <p key={i}><InstructionText text={line} /></p>
              ))}
            </div>

            {currentStep.hint && (
              <div className="mt-6">
                <button
                  onClick={() => setShowHint((v) => !v)}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-400"
                >
                  <span>{showHint ? "▾" : "▸"}</span>
                  {showHint ? "Hide hint" : "Show hint"}
                </button>
                {showHint && (
                  <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950/40">
                    <code className="break-all text-xs text-indigo-700 dark:text-indigo-300">{currentStep.hint}</code>
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
              <TutorialRating tutorialSlug={tutorialSlug} />
            )}

            {status === "failed" && failCount >= 3 && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Still stuck?
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  No worries — check the hint above, or skip this step and come back later.
                </p>
                <button
                  onClick={() => {
                    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
                    setStatus("passed");
                    setFailCount(0);
                  }}
                  className="mt-3 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-400 dark:hover:bg-amber-950/50"
                >
                  Skip this step →
                </button>
              </div>
            )}
          </div>

          {/* Footer: step dots */}
          <div className="shrink-0 border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Tutorial steps">
              {steps.map((s, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === stepIndex}
                  aria-label={`Step ${i + 1}: ${s.title}${completedSteps.has(i) ? " (completed)" : ""}`}
                  onClick={() => goToStep(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i === stepIndex ? "bg-indigo-500"
                    : completedSteps.has(i) ? "bg-emerald-500"
                    : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* ── Horizontal resize handle ── */}
        <div
          onMouseDown={startDragH}
          className="group relative hidden w-1 shrink-0 cursor-col-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600 md:block"
        >
          <GripDots vertical />
        </div>

        {/* ── Right Panel ── */}
        <div className={`flex-col overflow-hidden ${mobileTab === "code" ? "flex" : "hidden"} md:flex flex-1`}>

          {/* Code editor — intentionally always dark (IDE convention) */}
          <div className="flex flex-1 overflow-hidden bg-zinc-950 font-mono text-sm leading-6">
            {/* Line numbers */}
            <div
              ref={lineNumRef}
              aria-hidden
              className="shrink-0 select-none overflow-hidden border-r border-zinc-800 bg-zinc-900 px-3 py-4 text-right text-zinc-600"
            >
              {code.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Editor */}
            <div className="relative flex-1 overflow-hidden">
              <pre
                ref={preRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre py-4 pl-4 pr-8 text-zinc-100"
                dangerouslySetInnerHTML={{ __html: highlightGo(code) + "\n" }}
              />
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={syncScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="Code editor"
                className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent py-4 pl-4 pr-8 text-transparent caret-white outline-none selection:bg-indigo-900/50"
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex shrink-0 items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={handleRun}
              disabled={status === "running"}
              title="Run code (Ctrl+Enter)"
              className="flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/70"
            >
              {status === "running" ? "Running…" : "▶ Run"}
            </button>
            <button
              onClick={handleCheck}
              disabled={status === "running"}
              title="Check answer (Ctrl+Shift+Enter)"
              className="flex items-center gap-1.5 rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-50"
            >
              ✓ Check
            </button>
            <button
              onClick={handleReset}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            >
              Reset
            </button>
            <button
              onClick={handleCopy}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <span className="ml-auto hidden text-xs text-zinc-400 dark:text-zinc-600 lg:block">
              Tab = indent · Ctrl+Enter = Run · Ctrl+Shift+Enter = Check
            </span>
          </div>

          {/* ── Vertical resize handle ── */}
          <div
            onMouseDown={startDragV}
            className="group relative h-1 shrink-0 cursor-row-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600"
          >
            <GripDots />
          </div>

          {/* Output panel */}
          <div
            className="shrink-0 overflow-y-auto bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950"
            style={{ height: outputHeight }}
            suppressHydrationWarning
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Output
            </p>
            {output === null ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                Click Run to execute, or Check to validate.
              </p>
            ) : (
              <pre className={`whitespace-pre-wrap ${outputIsError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{output}</pre>
            )}
            {status === "passed" && (
              <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                🎉 {stepIndex < steps.length - 1 ? "Great job! Moving to the next step…" : "Outstanding! Tutorial complete!"}
              </p>
            )}
            {status === "failed" && output !== null && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                ✗ Not quite.{" "}
                {currentStep.expectedOutput.length > 0
                  ? `Expected output to include: ${currentStep.expectedOutput.slice(0, 4).map((s) => `"${s}"`).join(", ")}`
                  : "Make sure your code produces some output."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Course Outline Drawer ── */}
      {showNav && (
        <div className="fixed inset-0 z-[54] bg-black/50" onClick={() => setShowNav(false)} />
      )}
      <div
        className={`fixed left-0 top-12 bottom-0 z-[55] flex w-72 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-900 ${
          showNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Course Outline
          </span>
          <button
            onClick={() => setShowNav(false)}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >✕</button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {allTutorials.map((t) => {
            const isCurrent = t.slug === tutorialSlug;
            const isDone = progress.includes(t.slug);
            const isExpanded = expandedSlug === t.slug;
            const subSteps = allTutorialSteps[t.slug] ?? [];
            return (
              <div key={t.slug}>
                {/* Tutorial row — click title to navigate, chevron to expand */}
                <div
                  className={`flex items-center justify-between pr-2 transition-colors ${
                    isCurrent
                      ? "border-l-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                      : "border-l-2 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Link
                    href={`/golang/${t.slug}`}
                    onClick={() => setShowNav(false)}
                    className={`flex flex-1 flex-col py-2 pl-3.5 text-base ${
                      isCurrent
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-800 hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">{t.order}.</span>
                      <span className="flex-1">{t.title}</span>
                      {isDone && <span className="ml-1 shrink-0 text-xs text-emerald-500">✓</span>}
                    </span>
                    <span className="mt-0.5 pl-4 text-xs capitalize text-zinc-500 dark:text-zinc-400">
                      {t.difficulty}
                    </span>
                  </Link>
                  {subSteps.length > 0 && (
                    <button
                      onClick={() => setExpandedSlug(isExpanded ? "" : t.slug)}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                    >
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        className={`transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
                      >
                        <polyline points="4 2 8 6 4 10" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Sub-steps (accordion) */}
                {isExpanded && subSteps.length > 0 && (
                  <ul className="bg-zinc-100/60 dark:bg-zinc-800/40">
                    {subSteps.map((step) => {
                      const isActiveStep = isCurrent && step.index === stepIndex;
                      const isStepDone = isCurrent && completedSteps.has(step.index);
                      return (
                        <li key={step.index}>
                          {isCurrent ? (
                            <button
                              onClick={() => { goToStep(step.index); setShowNav(false); }}
                              className={`flex w-full items-center justify-between py-2 pl-8 pr-3 text-left text-sm transition-colors ${
                                isActiveStep
                                  ? "bg-indigo-100 font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                  : "text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
                              }`}
                            >
                              <span>{step.title}</span>
                              {isStepDone && <span className="shrink-0 text-emerald-500">✓</span>}
                            </button>
                          ) : (
                            <Link
                              href={`/golang/${t.slug}?step=${step.index}`}
                              onClick={() => setShowNav(false)}
                              className="flex w-full items-center py-2 pl-8 pr-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
                            >
                              {step.title}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Congratulations Modal ── */}
      {tutorialDone && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="congrats-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-emerald-300 bg-white p-8 text-center shadow-2xl dark:border-emerald-800 dark:bg-zinc-900">
            <div className="mb-3 text-5xl">🎉</div>
            <h2 id="congrats-title" className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Tutorial Complete!</h2>
            <p className="mb-2 text-zinc-500 dark:text-zinc-400">
              You finished <span className="font-medium text-zinc-800 dark:text-zinc-200">{tutorialTitle}</span>. Great work!
            </p>
            <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-500">
              {next ? `Continuing to "${next.title}" in ${countdown}…` : `Returning home in ${countdown}…`}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setTutorialDone(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Review steps
              </button>
              <ShareButton
                text={`I just completed "${tutorialTitle}" on uByte! 🐹`}
                url={typeof window !== "undefined" ? `${window.location.origin}/golang/${tutorialSlug}` : ""}
              />
              {next ? (
                <Link href={`/golang/${next.slug}`} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800">
                  Next: {next.title} →
                </Link>
              ) : (
                <Link href="/" className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800">
                  All Tutorials
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
