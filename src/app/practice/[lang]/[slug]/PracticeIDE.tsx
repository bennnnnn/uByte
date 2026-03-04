"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import type { PracticeProblem, Difficulty } from "@/lib/practice/types";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getStarterForLanguage, getAllPracticeProblems, getCategoryForSlug, getPracticeCategories } from "@/lib/practice/problems";
import type { ProblemCategory } from "@/lib/practice/types";
import { LANGUAGES } from "@/lib/languages/registry";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { usePanelResize } from "@/hooks/usePanelResize";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButtons from "@/components/AuthButtons";
import ShortcutsModal from "@/components/tutorial/ShortcutsModal";
import ProblemSidebar from "@/components/practice/ProblemSidebar";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  hard:   "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const LANG_ORDER: SupportedLanguage[] = ["go", "python", "cpp", "javascript", "java", "rust"];

interface Props {
  problem: PracticeProblem;
  initialLang: SupportedLanguage;
  /** When set, sidebar shows only problems in this category (matches list filter). */
  categoryFilter?: ProblemCategory | null;
  /** Page number on the list; used for "back to list" link. */
  listPage?: number;
}

/** Three grip dots — identical to InteractiveTutorial */
function GripDots({ vertical }: { vertical?: boolean }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${vertical ? "flex-col gap-0.5" : "gap-0.5"}`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-1 w-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      ))}
    </div>
  );
}

function sortProblemsByCategoryAndDifficulty(
  problems: PracticeProblem[],
  categoryOrder: ProblemCategory[]
): PracticeProblem[] {
  return [...problems].sort((a, b) => {
    const ca = getCategoryForSlug(a.slug) ?? ("array" as ProblemCategory);
    const cb = getCategoryForSlug(b.slug) ?? ("array" as ProblemCategory);
    const ia = categoryOrder.indexOf(ca);
    const ib = categoryOrder.indexOf(cb);
    if (ia !== ib) return ia - ib;
    const diffOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
    return (diffOrder[a.difficulty] ?? 0) - (diffOrder[b.difficulty] ?? 0);
  });
}

export function PracticeIDE({ problem, initialLang, categoryFilter = null, listPage = 1 }: Props) {
  const allProblems = getAllPracticeProblems();
  const categories = getPracticeCategories();
  const sidebarProblems =
    categoryFilter === null || categoryFilter === undefined
      ? allProblems
      : sortProblemsByCategoryAndDifficulty(
          allProblems.filter((p) => getCategoryForSlug(p.slug) === categoryFilter),
          categories
        );
  const [lang, setLang] = useState<SupportedLanguage>(initialLang);
  const [output, setOutput]           = useState<string | null>(null);
  const [running, setRunning]         = useState(false);
  const [outputIsError, setOutputIsError] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab]     = useState<"desc" | "code">("desc");
  const [isMobile, setIsMobile]       = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, PracticeAttemptStatus>>({});
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<{
    type: "accepted" | "wrong_answer" | "compile_error" | "runtime_error" | "tle" | "error";
    message: string;
    output?: string;
    passedCases?: number;
    totalCases?: number;
    submissionId?: number;
    failedInput?: string;
    failedExpected?: string;
    failedActual?: string;
    consecutiveFailures?: number;
  } | null>(null);
  const [aiFeedback, setAiFeedback] = useState<{
    friendly_one_liner: string;
    hint: string;
    next_step: string;
    minimal_patch?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const editor = useCodeEditor(getStarterForLanguage(problem, initialLang), lang);
  const { leftWidth, outputHeight, isDragging, startDragH, startDragV, startDragHTouch, startDragVTouch } = usePanelResize();

  // When language changes, load the starter for the new language
  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (lang !== prevLangRef.current) {
      editor.setCode(getStarterForLanguage(problem, lang));
      setOutput(null);
      prevLangRef.current = lang;
    }
  }, [lang, problem, editor]);

  // Record page view
  useEffect(() => {
    fetch("/api/practice-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: problem.slug }),
      credentials: "same-origin",
    }).catch(() => {});
  }, [problem.slug]);

  // Load attempt statuses for all problems (to show circles in sidebar)
  useEffect(() => {
    fetch("/api/practice-attempt", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (d?.attempts) setStatuses(d.attempts); })
      .catch(() => {});
  }, []);

  // Detect mobile for layout (description panel width)
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Global ? key → shortcuts modal
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

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setOutputIsError(false);
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editor.code, language: lang }),
      });
      const data = await res.json();

      if (res.status === 429) { setOutput("Too many requests. Please wait a moment before running again."); setOutputIsError(true); return; }
      if (res.status === 504) { setOutput("Request timed out. Try simpler or faster code."); setOutputIsError(true); return; }
      if (!res.ok)            { setOutput(data?.Errors ?? data?.error ?? "Run failed."); setOutputIsError(true); return; }

      const out: string[] = [];
      let hasError = false;
      if (data.CompileErrors) { out.push("Compile error:\n" + data.CompileErrors); setOutputIsError(true); hasError = true; }
      if (data.Errors)        { out.push(data.Errors); setOutputIsError(true); hasError = true; }
      if (data.Events)        { for (const e of data.Events) { if (e.Message) out.push(e.Message); } }
      setOutput(out.length ? out.join("\n") : "(no output)");

      // Save attempt status to DB and update local state
      const attemptStatus: PracticeAttemptStatus = hasError ? "failed" : "solved";
      setStatuses((prev) => ({ ...prev, [problem.slug]: attemptStatus }));
      fetch("/api/practice-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ slug: problem.slug, status: attemptStatus }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d?.xpAwarded > 0) {
            setXpToast(d.xpAwarded);
            setTimeout(() => setXpToast(null), 3000);
          }
        })
        .catch(() => {});
    } catch {
      setOutput("Network error. Please try again.");
      setOutputIsError(true);
    } finally {
      setRunning(false);
    }
  }, [editor.code, lang, problem.slug]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setVerdict(null);
    setAiFeedback(null);
    setAiError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ problem_id: problem.slug, code: editor.code, language: lang }),
      });
      const data = await res.json();
      const v = {
        type:                data.verdict,
        message:            data.message,
        output:              data.output,
        passedCases:        data.passedCases,
        totalCases:         data.totalCases,
        submissionId:       data.submission_id,
        failedInput:        data.failedInput,
        failedExpected:     data.failedExpected,
        failedActual:       data.failedActual,
        consecutiveFailures: data.consecutive_failures,
      };
      setVerdict(v);

      if (data.verdict === "accepted") {
        setStatuses((prev) => ({ ...prev, [problem.slug]: "solved" }));
        if (data.xpAwarded > 0) {
          setXpToast(data.xpAwarded);
          setTimeout(() => setXpToast(null), 3500);
        }
      } else if (["wrong_answer", "runtime_error", "compile_error", "tle"].includes(data.verdict)) {
        setStatuses((prev) => ({ ...prev, [problem.slug]: "failed" }));
        if (data.consecutive_failures >= 2 && data.submission_id) {
          setAiLoading(true);
          setAiError(null);
          fetch("/api/ai-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ submission_id: data.submission_id, hint_level: 1 }),
          })
            .then(async (res) => {
              const d = await res.json();
              if (res.ok && d?.friendly_one_liner != null) {
                setAiFeedback({
                  friendly_one_liner: d.friendly_one_liner ?? "",
                  hint: d.hint ?? "",
                  next_step: d.next_step ?? "",
                  minimal_patch: d.minimal_patch,
                });
              } else {
                setAiError(d?.message ?? d?.error ?? "Request failed");
              }
            })
            .catch(() => setAiError("Network error"))
            .finally(() => setAiLoading(false));
        }
      }
    } catch {
      setVerdict({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }, [editor.code, lang, problem.slug]);

  const requestAiFeedback = useCallback(async (hintLevel: number) => {
    const sid = verdict?.submissionId;
    if (!sid) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ submission_id: sid, hint_level: hintLevel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.message ?? data?.error ?? "Request failed");
        return;
      }
      setAiFeedback({
        friendly_one_liner: data.friendly_one_liner ?? "",
        hint: data.hint ?? "",
        next_step: data.next_step ?? "",
        minimal_patch: data.minimal_patch,
      });
    } catch {
      setAiError("Network error");
    } finally {
      setAiLoading(false);
    }
  }, [verdict?.submissionId]);

  function handleReset() {
    editor.setCode(getStarterForLanguage(problem, lang));
    editor.setErrorLines(new Set());
    setOutput(null);
    setOutputIsError(false);
    setVerdict(null);
    setAiFeedback(null);
    setAiError(null);
  }

  /** Tab → 4 spaces indent; Ctrl/Cmd+Enter → run */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = editor.textareaRef.current!;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const next  = editor.code.slice(0, start) + "    " + editor.code.slice(end);
      editor.setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* XP awarded toast */}
      {xpToast !== null && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 animate-bounce">
          <div className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
            <span>⚡</span>
            <span>+{xpToast} XP — first solve!</span>
          </div>
        </div>
      )}

      {/* Drag-cursor overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[52]" style={{ cursor: isDragging === "h" ? "col-resize" : "row-resize" }} />
      )}

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Left: hamburger on mobile (problem list), logo on desktop */}
        <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            aria-label="Open problem list"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-md py-1 pr-2 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 md:flex"
            aria-label="Back to home"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">U</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">uByte</span>
          </Link>
        </div>

        {/* Breadcrumb */}
        <h1 className="min-w-0 max-w-[45%] flex-1 truncate text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100 md:max-w-[40%] md:flex-initial">
          {problem.title}
          <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize align-middle ${DIFFICULTY_STYLES[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </h1>

        {/* Right: theme toggle + user menu */}
        <div className="flex flex-1 justify-end gap-3 md:flex-initial">
          <ThemeToggle className="hidden h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 md:flex" />
          <AuthButtons />
        </div>
      </header>

      {/* Mobile problem list drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[53] md:hidden">
          <div className="absolute inset-0 bg-black/50" aria-hidden onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[min(280px,85vw)] overflow-hidden bg-zinc-50 shadow-xl dark:bg-zinc-900">
            <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Problems</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-3rem)] overflow-y-auto">
              <ProblemSidebar
                problems={sidebarProblems}
                activeSlug={problem.slug}
                lang={lang}
                onCollapse={() => setMobileSidebarOpen(false)}
                statuses={statuses}
                listQuery={{ category: categoryFilter ?? undefined, page: listPage > 1 ? listPage : undefined }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile tab bar — identical style to InteractiveTutorial ─── */}
      <div className="flex shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800 md:hidden">
        {(["desc", "code"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`relative flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              mobileTab === tab
                ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {tab === "desc" ? "Description" : "Code Editor"}
          </button>
        ))}
      </div>

      {/* ── Main split ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Problem list sidebar (desktop) — collapses to a thin expand strip */}
        <aside className="hidden shrink-0 md:flex">
          {sidebarOpen ? (
            <div className="flex w-60">
              <ProblemSidebar
                problems={sidebarProblems}
                activeSlug={problem.slug}
                lang={lang}
                onCollapse={() => setSidebarOpen(false)}
                statuses={statuses}
                listQuery={{ category: categoryFilter ?? undefined, page: listPage > 1 ? listPage : undefined }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              title="Expand problem list"
              className="flex w-8 flex-col items-center justify-center border-r border-zinc-200 bg-zinc-50 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </aside>

        {/* Description panel (left) — same bg as InstructionsSidebar */}
        <aside
          className={`flex min-w-0 flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900 ${
            mobileTab === "desc" ? "flex shrink" : "hidden"
          } md:flex md:shrink-0`}
          style={isMobile ? undefined : { width: leftWidth }}
          suppressHydrationWarning
        >
          {/* Problem body */}
          <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto break-words p-4 md:p-5">
            <h1 className="mb-2 break-words text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {problem.title}
            </h1>
            <span className={`mb-4 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[problem.difficulty]}`}>
              {problem.difficulty}
            </span>

            <p className="mb-5 min-w-0 break-words whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {problem.description}
            </p>

            {problem.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Examples</h3>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="mb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Example {i + 1}</p>
                    <div className="space-y-1 font-mono text-xs">
                      <div><span className="text-zinc-400">Input:  </span><span className="text-zinc-800 dark:text-zinc-200">{ex.input}</span></div>
                      <div><span className="text-zinc-400">Output: </span><span className="text-zinc-800 dark:text-zinc-200">{ex.output}</span></div>
                      {ex.explanation && <div className="mt-1.5 text-zinc-500 dark:text-zinc-400">{ex.explanation}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Prev / Next problem */}
            <div className="mt-6 flex gap-2">
              {(() => {
                const idx  = allProblems.findIndex((p) => p.slug === problem.slug);
                const prev = allProblems[idx - 1];
                const next = allProblems[idx + 1];
                return (
                  <>
                    {prev && (
                      <a href={`/practice/${lang}/${prev.slug}`} className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
                        ← Prev
                      </a>
                    )}
                    {next && (
                      <a href={`/practice/${lang}/${next.slug}`} className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
                        Next →
                      </a>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </aside>

        {/* Horizontal resize handle — identical to InteractiveTutorial */}
        <div
          onMouseDown={startDragH}
          className="group relative hidden w-1 shrink-0 cursor-col-resize bg-zinc-200 transition-colors hover:bg-indigo-400 dark:bg-zinc-800 dark:hover:bg-indigo-600 md:block"
        >
          <GripDots vertical />
        </div>

        {/* ── Right panel: editor + toolbar + output ───────────────── */}
        <div className={`flex-col overflow-hidden ${mobileTab === "code" ? "flex" : "hidden"} md:flex flex-1`}>

          {/* Code editor — identical to InteractiveTutorial */}
          <div className="flex flex-1 overflow-hidden bg-zinc-950 font-mono leading-6">
            <div
              ref={editor.lineNumRef}
              aria-hidden
              className="shrink-0 select-none overflow-hidden border-r border-zinc-800 bg-zinc-900 px-3 py-4 text-right text-zinc-600"
            >
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
              <pre
                ref={editor.preRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre py-4 pl-4 pr-8 text-zinc-100"
                dangerouslySetInnerHTML={{ __html: editor.highlightGo(editor.code) + "\n" }}
              />
              <textarea
                ref={editor.textareaRef}
                value={editor.code}
                onChange={(e) => editor.setCode(e.target.value)}
                onScroll={editor.syncScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="Code editor"
                className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent py-4 pl-4 pr-8 text-transparent caret-white outline-none selection:bg-indigo-900/50"
                suppressHydrationWarning
              />
            </div>
          </div>

          {/* Toolbar — desktop only; mobile uses single bottom bar when on code tab */}
          <div className="hidden shrink-0 items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900 md:flex">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              title="Code language"
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {LANG_ORDER.map((l) => (
                <option key={l} value={l}>{LANGUAGES[l]?.name ?? l}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleRun}
              disabled={running || submitting}
              title="Run code (Ctrl+Enter)"
              className="flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/70"
            >
              {running ? "Running…" : "▶ Run"}
            </button>

            {problem.testCases?.length && (lang === "go" || lang === "python" || lang === "javascript" || lang === "cpp" || lang === "java" || lang === "rust") && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={running || submitting}
                title="Submit solution against test cases"
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Judging…" : "✓ Submit"}
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              title="Reset to starter code"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            >
              Reset
            </button>

            <button
              type="button"
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

          {/* Output / verdict panel — single scroll container */}
          <div
            className="shrink-0 overflow-y-auto overflow-x-hidden bg-zinc-50 dark:bg-zinc-950"
            style={{ height: outputHeight }}
            suppressHydrationWarning
          >
            {/* 1) Verdict banner */}
            {verdict && (
              <div className={`flex items-center gap-3 border-b px-4 py-3 ${
                verdict.type === "accepted"
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                  : verdict.type === "tle"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40"
              }`}>
                <span className="text-xl">
                  {verdict.type === "accepted" ? "✅" : verdict.type === "tle" ? "⏱" : "❌"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${
                    verdict.type === "accepted"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : verdict.type === "tle"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-red-700 dark:text-red-400"
                  }`}>
                    {verdict.message}
                  </p>
                  {verdict.totalCases != null && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {verdict.passedCases}/{verdict.totalCases} test cases passed
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* 2) Judge0 factual block: failing test (WA) + output/error */}
            {verdict && verdict.type === "wrong_answer" && (verdict.failedInput != null || verdict.failedExpected != null || verdict.failedActual != null) && (
              <div className="border-b border-zinc-200 bg-zinc-100/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Failing test</p>
                {verdict.failedInput != null && <p className="text-xs text-zinc-700 dark:text-zinc-300"><span className="text-zinc-500 dark:text-zinc-500">Input:</span> {verdict.failedInput}</p>}
                {verdict.failedExpected != null && <p className="text-xs text-zinc-700 dark:text-zinc-300"><span className="text-zinc-500 dark:text-zinc-500">Expected:</span> {verdict.failedExpected}</p>}
                {verdict.failedActual != null && <p className="text-xs text-amber-700 dark:text-amber-400"><span className="text-zinc-500 dark:text-zinc-500">Got:</span> {verdict.failedActual}</p>}
              </div>
            )}
            <div className="border-b border-zinc-200 px-4 py-3 font-mono text-sm dark:border-zinc-800">
              {!verdict && output === null ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-600">
                  Click <strong>Run</strong> to execute, or <strong>Submit</strong> to grade (all languages).
                </p>
              ) : verdict?.output != null ? (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {verdict.type === "compile_error" ? "Compile Error" : verdict.type === "runtime_error" ? "Runtime Error" : "Output"}
                  </p>
                  <pre className={`whitespace-pre-wrap break-words text-xs ${
                    verdict.type === "accepted" ? "text-emerald-600 dark:text-emerald-400"
                    : verdict.type === "wrong_answer" ? "text-zinc-600 dark:text-zinc-300"
                    : "text-red-600 dark:text-red-400"
                  }`}>
                    {verdict.output}
                  </pre>
                </>
              ) : output !== null ? (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {outputIsError ? "Error" : "Output"}
                  </p>
                  <pre className={`whitespace-pre-wrap break-words text-xs ${outputIsError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {output}
                  </pre>
                </>
              ) : null}
            </div>
            {/* 3) AI action buttons — only when verdict != AC and submission_id exists */}
            {verdict && verdict.type !== "accepted" && verdict.submissionId != null && (
              <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                {verdict.consecutiveFailures != null && verdict.consecutiveFailures >= 2 && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Want a hint?</span>
                )}
                <button type="button" onClick={() => requestAiFeedback(1)} disabled={aiLoading} className="rounded-md bg-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">Hint</button>
                <button type="button" onClick={() => requestAiFeedback(2)} disabled={aiLoading} className="rounded-md bg-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">Explain</button>
                <button type="button" onClick={() => requestAiFeedback(3)} disabled={aiLoading} className="rounded-md bg-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">Suggest fix</button>
                <button type="button" onClick={() => requestAiFeedback(4)} disabled={aiLoading} className="rounded-md bg-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">Teach</button>
              </div>
            )}
            {/* 4) Inline AI — "Analyzing…" only when /api/ai-feedback is in flight */}
            {aiLoading && (
              <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 animate-pulse">Analyzing your code…</p>
              </div>
            )}
            {aiError && (
              <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">{aiError}</p>
            )}
            {aiFeedback && (
              <div className="border-b border-indigo-200 bg-indigo-50/50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-950/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">{aiFeedback.friendly_one_liner}</p>
                    <p className="mt-1.5 text-xs text-zinc-700 dark:text-zinc-300">{aiFeedback.hint}</p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Next: {aiFeedback.next_step}</p>
                    {aiFeedback.minimal_patch && <pre className="mt-2 overflow-x-auto rounded bg-zinc-800 p-2 text-xs text-zinc-100">{aiFeedback.minimal_patch}</pre>}
                  </div>
                  <button type="button" onClick={() => { setAiFeedback(null); setAiError(null); }} title="Clear AI feedback" className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300" aria-label="Clear AI">✕</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom bar — only when on Code tab (not on Instructions) */}
      {mobileTab === "code" && (
        <div className="fixed bottom-0 left-0 right-0 z-[54] flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-3 py-2 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as SupportedLanguage)}
            title="Language"
            className="w-24 shrink-0 rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {LANG_ORDER.map((l) => (
              <option key={l} value={l}>{LANGUAGES[l]?.name ?? l}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRun}
            disabled={running || submitting}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-100 py-2 text-sm font-medium text-green-800 disabled:opacity-50 dark:bg-green-900/40 dark:text-green-300"
          >
            {running ? "…" : "▶ Run"}
          </button>
          {problem.testCases?.length && (lang === "go" || lang === "python" || lang === "javascript" || lang === "cpp" || lang === "java" || lang === "rust") && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={running || submitting}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-indigo-600 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "…" : "✓ Submit"}
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="flex shrink-0 items-center justify-center rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
          >
            Reset
          </button>
        </div>
      )}

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
