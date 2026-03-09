"use client";

import { useState, useCallback, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { DIFFICULTY_BADGE, type PracticeProblem, type ProblemCategory } from "@/lib/practice/types";
import type { SupportedLanguage } from "@/lib/languages/types";
import { getStarterForLanguage, getAllPracticeProblems, getCategoryForSlug, getPracticeCategories, sortProblemsByCategoryAndDifficulty } from "@/lib/practice/problems";
import { LANGUAGES } from "@/lib/languages/registry";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { usePanelResize } from "@/hooks/usePanelResize";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButtons from "@/components/AuthButtons";
import ShortcutsModal from "@/components/tutorial/ShortcutsModal";
import ProblemSidebar from "@/components/practice/ProblemSidebar";
import GripDots from "@/components/GripDots";
import type { PracticeAttemptStatus } from "@/lib/db/practice-attempts";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import { useIsMobile } from "@/hooks/useIsMobile";

import { ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";

const LANG_ORDER = ALL_LANGUAGE_KEYS;

// ── Output / Test Cases panel ─────────────────────────────────────────────────

type VerdictState = {
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
} | null;

function OutputPanel({
  verdict,
  output,
  outputIsError,
  outputHeight,
  problem,
  aiLoading,
  aiError,
  aiFeedback,
  onRequestAI,
  onClearAI,
  onExpandPanel,
}: {
  verdict: VerdictState;
  output: string | null;
  outputIsError: boolean;
  outputHeight: number;
  problem: PracticeProblem;
  aiLoading: boolean;
  aiError: string | null;
  aiFeedback: { friendly_one_liner: string; hint: string; next_step: string; minimal_patch?: string } | null;
  onRequestAI: (level: number) => void;
  onClearAI: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"console" | "tests">(
    verdict ? "tests" : "console"
  );
  const [selectedCase, setSelectedCase] = useState<number>(
    verdict?.type === "wrong_answer" ? (verdict.passedCases ?? 0) : 0
  );

  // Sync active tab when verdict changes
  useEffect(() => {
    if (verdict) setActiveTab("tests");
    else setActiveTab("console");
  }, [verdict?.type]);

  // Sync selected case to first failure on new verdict
  useEffect(() => {
    if (verdict?.type === "wrong_answer") {
      setSelectedCase(verdict.passedCases ?? 0);
    } else {
      setSelectedCase(0);
    }
  }, [verdict]);

  const totalCases = verdict?.totalCases ?? problem.testCases?.length ?? 0;
  const passedCases = verdict?.passedCases ?? 0;
  const failedIndex = verdict?.type === "wrong_answer" ? (verdict.passedCases ?? 0) : -1;

  // Test case status for each case
  function caseStatus(idx: number): "pass" | "fail" | "unknown" {
    if (!verdict) return "unknown";
    if (verdict.type === "accepted") return "pass";
    if (verdict.type === "wrong_answer") {
      if (idx < passedCases) return "pass";
      if (idx === failedIndex) return "fail";
      return "unknown";
    }
    return "unknown";
  }

  const verdictColors = verdict
    ? verdict.type === "accepted"
      ? { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" }
      : verdict.type === "tle"
      ? { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" }
      : { bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-400" }
    : null;

  const selectedTestCase = problem.testCases?.[selectedCase];

  return (
    <div
      className="flex shrink-0 flex-col overflow-hidden bg-surface-card"
      style={{ height: outputHeight }}
      suppressHydrationWarning
    >
      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        {(["console", "tests"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === tab
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            {tab === "console" ? "Console" : "Test Cases"}
            {tab === "tests" && verdict && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                verdict.type === "accepted"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
              }`}>
                {verdict.type === "accepted" ? `${totalCases}/${totalCases}` : `${passedCases}/${totalCases}`}
              </span>
            )}
          </button>
        ))}

        {/* AI buttons in tab bar when not accepted */}
        {verdict && verdict.type !== "accepted" && verdict.submissionId != null && (
          <div className="ml-auto flex items-center gap-1 px-2">
            {([[1, "Hint"], [2, "Explain"], [3, "Fix"]] as const).map(([level, label]) => (
              <button
                key={level}
                type="button"
                onClick={() => onRequestAI(level)}
                disabled={aiLoading}
                className="rounded border border-zinc-300 px-2 py-1 text-[10px] font-semibold text-zinc-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
              >
                {aiLoading ? "…" : label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* ── Console tab ─────────────────────────────────────────────── */}
        {activeTab === "console" && (
          <div className="p-4 font-mono">
            {output === null && !verdict ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="mb-2 text-2xl">💻</span>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Click <kbd className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-700">Run</kbd> to execute your code
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  Or <kbd className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-700">Submit</kbd> to run against all hidden test cases
                </p>
              </div>
            ) : output !== null ? (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-widest ${outputIsError ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                    {outputIsError ? "Error" : "Console Output"}
                  </span>
                </div>
                <pre className={`whitespace-pre-wrap break-words rounded-lg p-3 text-xs ${
                  outputIsError
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    : "bg-zinc-900 text-green-400 dark:bg-zinc-950"
                }`}>
                  {output === "(no output)" ? <span className="text-zinc-500">(no output)</span> : output}
                </pre>
                {!outputIsError && output !== "(no output)" && (
                  <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                    This is the output of your <code>main()</code>. Click <strong>Submit</strong> to run against all test cases.
                  </p>
                )}
              </>
            ) : null}

            {/* Compile / runtime error from submit also appears in console */}
            {verdict && (verdict.type === "compile_error" || verdict.type === "runtime_error") && verdict.output && (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                    {verdict.type === "compile_error" ? "Compile Error" : "Runtime Error"}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-red-950/20 p-3 text-xs text-red-300 dark:bg-red-950/40">
                  {verdict.output}
                </pre>
              </>
            )}
          </div>
        )}

        {/* ── Test Cases tab ──────────────────────────────────────────── */}
        {activeTab === "tests" && (
          <div>
            {!verdict ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="mb-2 text-2xl">🧪</span>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Click <kbd className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-700">Submit</kbd> to run against all test cases
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {totalCases} hidden test case{totalCases !== 1 ? "s" : ""}
                </p>
              </div>
            ) : (
              <>
                {/* Verdict banner */}
                {verdictColors && (
                  <div className={`flex items-center gap-3 border-b px-4 py-3 ${verdictColors.bg} ${verdictColors.border}`}>
                    <span className="text-2xl">
                      {verdict.type === "accepted" ? "🎉"
                        : verdict.type === "tle" ? "⏱"
                        : verdict.type === "compile_error" ? "🔧"
                        : verdict.type === "runtime_error" ? "💥"
                        : "❌"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold ${verdictColors.text}`}>{verdict.message}</p>
                      {(verdict.type === "wrong_answer" || verdict.type === "accepted") && totalCases > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                            <div
                              className={`h-full rounded-full ${verdict.type === "accepted" ? "bg-emerald-500" : "bg-red-500"}`}
                              style={{ width: `${totalCases > 0 ? (passedCases / totalCases) * 100 : 0}%` }}
                            />
                          </div>
                          <span className={`shrink-0 text-xs font-semibold ${verdictColors.text}`}>
                            {passedCases} / {totalCases} passed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Wrong Answer / Accepted: chip row + per-case detail ── */}
                {(verdict.type === "accepted" || verdict.type === "wrong_answer") && totalCases > 0 && (
                  <div className="p-4">
                    {/* Chips */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {Array.from({ length: totalCases }).map((_, idx) => {
                        const status = caseStatus(idx);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedCase(idx)}
                            className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all ${
                              selectedCase === idx
                                ? status === "pass"
                                  ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                  : status === "fail"
                                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                                  : "border-zinc-400 bg-zinc-600 text-white"
                                : status === "pass"
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : status === "fail"
                                ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-950/40 dark:text-red-400"
                                : "border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
                            }`}
                          >
                            {status === "pass" ? "✓" : status === "fail" ? "✗" : "—"}
                            <span>Case {idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Per-case detail */}
                    {selectedTestCase && (
                      <div className="space-y-3">
                        <div>
                          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Input</p>
                          <pre className="rounded-lg bg-zinc-100 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                            {selectedTestCase.stdin}
                          </pre>
                        </div>

                        {caseStatus(selectedCase) === "fail" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Expected Output</p>
                              <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 font-mono text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                                {selectedTestCase.expectedOutput}
                              </pre>
                            </div>
                            <div>
                              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Your Output</p>
                              <pre className="rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                                {verdict.failedActual != null && verdict.failedActual !== "" ? verdict.failedActual : "(no output — did your function return a value?)"}
                              </pre>
                            </div>
                          </div>
                        )}

                        {caseStatus(selectedCase) === "pass" && (
                          <div>
                            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Output ✓</p>
                            <pre className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 font-mono text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                              {selectedTestCase.expectedOutput}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Compile error ── */}
                {verdict.type === "compile_error" && (
                  <div className="p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">Compiler Output</p>
                    <pre className="whitespace-pre-wrap break-words rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                      {verdict.output || "Compilation failed — no output captured."}
                    </pre>
                    <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">Fix the errors above, then submit again.</p>
                  </div>
                )}

                {/* ── Runtime error ── */}
                {verdict.type === "runtime_error" && (
                  <div className="p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">Runtime Error</p>
                    <pre className="whitespace-pre-wrap break-words rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                      {verdict.output || "Your code crashed — no stderr captured."}
                    </pre>
                    <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">Fix the runtime error above, then submit again.</p>
                  </div>
                )}

                {/* ── TLE ── */}
                {verdict.type === "tle" && (
                  <div className="p-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Time Limit Exceeded</p>
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                        Your solution took too long. Look for nested loops you can replace with a hash map, prefix sum, or DP table.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Generic error (e.g. missing harness, judge unavailable) ── */}
                {verdict.type === "error" && (
                  <div className="p-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">Submission Error</p>
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{verdict.message}</p>
                    </div>
                    {/* Still show the test cases so the user can inspect what they're up against */}
                    {totalCases > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Test Cases</p>
                        <div className="space-y-2">
                          {problem.testCases?.map((tc, idx) => (
                            <div key={idx} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                              <p className="mb-1 text-[10px] font-semibold text-zinc-400">Case {idx + 1}</p>
                              <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                                <span className="text-zinc-400">Input:</span> {tc.stdin}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── AI feedback ─────────────────────────────────────────────── */}
        {aiLoading && (
          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 animate-pulse dark:text-zinc-500">🤖 Analyzing your code…</p>
          </div>
        )}
        {aiError && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-xs text-red-600 dark:text-red-400">{aiError}</p>
          </div>
        )}
        {aiFeedback && (
          <div className="border-t border-indigo-200 bg-indigo-50/60 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-950/30">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">🤖 {aiFeedback.friendly_one_liner}</p>
                <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">{aiFeedback.hint}</p>
                {aiFeedback.next_step && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold">Next step:</span> {aiFeedback.next_step}
                  </p>
                )}
                {aiFeedback.minimal_patch && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
                    {aiFeedback.minimal_patch}
                  </pre>
                )}
              </div>
              <button
                type="button"
                onClick={onClearAI}
                className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  problem: PracticeProblem;
  initialLang: SupportedLanguage;
  /** When set, sidebar shows only problems in this category (matches list filter). */
  categoryFilter?: ProblemCategory | null;
  /** Page number on the list; used for "back to list" link. */
  listPage?: number;
  /** Status filter on the list (solved / unsolved); preserved in sidebar links. */
  listStatus?: "solved" | "unsolved";
  /** Difficulty filter on the list; preserved in sidebar links. */
  listDifficulty?: string;
}

export function PracticeIDE({ problem, initialLang, categoryFilter = null, listPage = 1, listStatus, listDifficulty }: Props) {
  const allProblems = useMemo(() => getAllPracticeProblems(), []);
  const categories = useMemo(() => getPracticeCategories(), []);
  const sidebarProblems = useMemo(() =>
    categoryFilter === null || categoryFilter === undefined
      ? allProblems
      : sortProblemsByCategoryAndDifficulty(
          allProblems.filter((p) => getCategoryForSlug(p.slug) === categoryFilter),
          categories
        ),
    [allProblems, categories, categoryFilter]
  );
  const { user } = useAuth();
  const [lang, setLang] = useState<SupportedLanguage>(initialLang);
  const [output, setOutput]           = useState<string | null>(null);
  const [running, setRunning]         = useState(false);
  const [outputIsError, setOutputIsError] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab]     = useState<"desc" | "code">("desc");
  const isMobile = useIsMobile();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Bookmark — persistent toggle (load from DB on mount)
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const bookmarked = bookmarkId !== null;

  // Notes (per-problem, persisted in localStorage)
  const [descTab, setDescTab] = useState<"desc" | "notes">("desc");
  const [notes, setNotes] = useState<string>("");
  const notesKey = `practice-notes-${problem.slug}`;

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
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
  const { leftWidth, outputHeight, setOutputHeight, isDragging, startDragH, startDragV, startDragVTouch } = usePanelResize();

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

  // Save last activity for "You left off at..." (logged-in only)
  useEffect(() => {
    fetch("/api/last-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ type: "practice", lang, slug: problem.slug }),
    }).catch(() => {});
  }, [lang, problem.slug]);

  // Load attempt statuses for all problems (to show circles in sidebar)
  useEffect(() => {
    fetch("/api/practice-attempt", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (d?.attempts) setStatuses(d.attempts); })
      .catch(() => {});
  }, []);

  // Load bookmark state for this problem on mount
  useEffect(() => {
    if (!user) return;
    fetch(`/api/bookmarks?lang=${encodeURIComponent(lang)}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        const match = (d?.bookmarks ?? []).find(
          (b: { id: number; tutorial_slug: string }) => b.tutorial_slug === `practice:${problem.slug}`
        );
        setBookmarkId(match?.id ?? null);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, problem.slug]);

  // Load notes: DB for logged-in users, localStorage for guests
  useEffect(() => {
    if (user) {
      fetch(`/api/practice-notes?slug=${encodeURIComponent(problem.slug)}`, { credentials: "same-origin" })
        .then((r) => r.json())
        .then((d) => { if (typeof d?.note === "string") setNotes(d.note); })
        .catch(() => {
          try { setNotes(localStorage.getItem(notesKey) ?? ""); } catch { /* ignore */ }
        });
    } else {
      try { setNotes(localStorage.getItem(notesKey) ?? ""); } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.slug, user?.id]);

  // Keep a ref to user so the debounced save always sees the latest auth state
  const userRef = useRef(user);
  userRef.current = user;

  // Save notes: debounced — DB for logged-in users, localStorage for guests
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (userRef.current) {
        apiFetch("/api/practice-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: problem.slug, note: notes }),
        }).catch(() => {});
      } else {
        try { localStorage.setItem(notesKey, notes); } catch { /* ignore */ }
      }
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, problem.slug]);

  // Elapsed timer — reset when problem changes
  useEffect(() => {
    elapsedRef.current = 0;
    setElapsed(0);
    const id = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [problem.slug]);

  // Keep a ref so handleSubmit/handleRun can always read the latest outputHeight
  // without needing it as a useCallback dependency.
  const outputHeightRef = useRef(outputHeight);
  outputHeightRef.current = outputHeight;

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
      // Expand the panel immediately so chips + detail are visible without scrolling
      setOutputHeight(Math.max(outputHeightRef.current, 400));

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

  const canSubmit = !!problem.testCases?.length;
  const sidebarProps = {
    problems: sidebarProblems,
    activeSlug: problem.slug,
    lang,
    statuses,
    listQuery: { category: categoryFilter ?? undefined, page: listPage > 1 ? listPage : undefined, status: listStatus, difficulty: listDifficulty },
  } as const;

  async function handleBookmark() {
    if (!user || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (bookmarkId !== null) {
        // Unsave
        const res = await apiFetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bookmarkId }),
        });
        if (res.ok) setBookmarkId(null);
      } else {
        // Save
        const res = await apiFetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tutorialSlug: `practice:${problem.slug}`, snippet: editor.code, note: problem.title, lang }),
        });
        if (res.ok) {
          const data = await res.json();
          setBookmarkId(data?.bookmark?.id ?? -1);
        }
      }
    } catch { /* ignore */ }
    finally { setBookmarkLoading(false); }
  }

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
        <h1 className="min-w-0 max-w-[45%] flex-1 truncate text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100 md:max-w-[40%] md:flex-initial" title={problem.title}>
          {problem.title}
          <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize align-middle ${DIFFICULTY_BADGE[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </h1>

        {/* Right: timer + bookmark + theme + user menu */}
        <div className="flex flex-1 justify-end gap-2 md:flex-initial md:gap-3">
          {/* Elapsed timer */}
          <div className="hidden items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-mono text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 sm:flex" title="Time spent on this problem">
            ⏱ {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
          </div>
          {/* Bookmark */}
          {user && (
            <button
              type="button"
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              title={bookmarked ? "Remove bookmark" : "Bookmark this problem"}
              className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors sm:flex disabled:cursor-not-allowed disabled:opacity-60 ${
                bookmarked
                  ? "border-indigo-400 bg-indigo-50 text-indigo-600 hover:border-red-400 hover:bg-red-50 hover:text-red-600 dark:border-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:border-red-600 dark:hover:text-red-400"
                  : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill={bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              {bookmarkLoading ? "…" : bookmarked ? "Saved ✓" : "Save"}
            </button>
          )}
          <ThemeToggle className="hidden h-8 w-8 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 md:flex" />
          <Suspense fallback={<div className="h-9 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />}>
            <AuthButtons />
          </Suspense>
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
              <ProblemSidebar {...sidebarProps} onCollapse={() => setMobileSidebarOpen(false)} />
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
              <ProblemSidebar {...sidebarProps} onCollapse={() => setSidebarOpen(false)} />
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
          className={`flex min-w-0 flex-col overflow-hidden bg-surface-card ${
            mobileTab === "desc" ? "flex shrink" : "hidden"
          } md:flex md:shrink-0`}
          style={isMobile ? undefined : { width: leftWidth }}
          suppressHydrationWarning
        >
          {/* Tab strip: Description | Notes */}
          <div className="flex shrink-0 border-b border-zinc-200 dark:border-zinc-800">
            {(["desc", "notes"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDescTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  descTab === tab
                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {tab === "desc" ? "Description" : "Notes"}
              </button>
            ))}
          </div>

          {/* Description tab */}
          {descTab === "desc" && (
            <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto break-words p-4 md:p-5">
              <h1 className="mb-2 break-words text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {problem.title}
              </h1>
              <span className={`mb-4 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_BADGE[problem.difficulty]}`}>
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
                        <Link
                          href={`/practice/${lang}/${prev.slug}`}
                          scroll={false}
                          className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                        >
                          ← Prev
                        </Link>
                      )}
                      {next && (
                        <Link
                          href={`/practice/${lang}/${next.slug}`}
                          scroll={false}
                          className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                        >
                          Next →
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Notes tab */}
          {descTab === "notes" && (
            <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
              <p className="mb-2 text-xs text-zinc-400 dark:text-zinc-500">
                {user ? "Notes are saved to your account for this problem." : "Sign in to save notes to your account."}
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your approach, observations, or ideas here…"
                className="flex-1 resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-800 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500 dark:focus:border-indigo-600"
              />
            </div>
          )}
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

            {canSubmit && (
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

          {/* Output / verdict panel */}
          <OutputPanel
            verdict={verdict}
            output={output}
            outputIsError={outputIsError}
            outputHeight={outputHeight}
            problem={problem}
            aiLoading={aiLoading}
            aiError={aiError}
            aiFeedback={aiFeedback}
            onRequestAI={requestAiFeedback}
            onClearAI={() => { setAiFeedback(null); setAiError(null); }}
          />
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
          {canSubmit && (
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
