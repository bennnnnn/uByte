"use client";

import { useState, useEffect } from "react";
import AiFeedbackCard from "@/components/AiFeedbackCard";
import type { PracticeProblem } from "@/lib/practice/types";
import type { CodeReviewSchema } from "@/lib/ai/code-review-client";

export type VerdictState = {
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

interface OutputPanelProps {
  verdict: VerdictState;
  output: string | null;
  outputIsError: boolean;
  outputHeight: number;
  problem: PracticeProblem;
  aiLoading: boolean;
  aiError: string | null;
  aiUpgradeRequired: boolean;
  aiLoginRequired: boolean;
  aiFeedback: { friendly_one_liner: string; hint: string; next_step: string; minimal_patch?: string } | null;
  onRequestAI: () => void;
  onClearAI: () => void;
  codeReview: CodeReviewSchema | null;
  codeReviewLoading: boolean;
  codeReviewUpgrade: boolean;
  onRequestCodeReview: () => void;
  onClearCodeReview: () => void;
  interviewMode: boolean;
}

export function OutputPanel({
  verdict,
  output,
  outputIsError,
  outputHeight,
  problem,
  aiLoading,
  aiError,
  aiUpgradeRequired,
  aiLoginRequired,
  aiFeedback,
  onRequestAI,
  onClearAI,
  codeReview,
  codeReviewLoading,
  codeReviewUpgrade,
  onRequestCodeReview,
  onClearCodeReview,
  interviewMode,
}: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<"console" | "tests">("console");
  const [selectedCase, setSelectedCase] = useState<number>(
    verdict?.type === "wrong_answer" ? (verdict.passedCases ?? 0) : 0
  );

  useEffect(() => {
    if (verdict) setActiveTab("tests");
    else setActiveTab("console");
  }, [verdict?.type]);

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
      {/* Tab bar */}
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

        {/* AI hint button — hidden while a hint is already visible */}
        {verdict && verdict.type !== "accepted" && verdict.submissionId != null && !aiFeedback && (
          <div className="ml-auto px-3">
            {aiLoginRequired ? (
              <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-800 dark:bg-indigo-950/40">
                <span className="text-xs text-indigo-600 dark:text-indigo-400">
                  💡 Sign in for AI hints —
                </span>
                <a href="/signup" className="text-xs font-bold text-indigo-700 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-300">
                  Sign up free →
                </a>
                <a href="/login" className="text-xs text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400">
                  Log in
                </a>
              </div>
            ) : aiUpgradeRequired ? (
              <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-800 dark:bg-indigo-950/40">
                <span className="text-xs text-indigo-600 dark:text-indigo-400">
                  💡 5 free hints used —
                </span>
                <a href="/pricing" className="text-xs font-bold text-indigo-700 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-300">
                  Upgrade for unlimited →
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={onRequestAI}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-40 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/70"
              >
                {aiLoading ? <><span className="animate-spin">⟳</span> Thinking…</> : <>💡 Get hint</>}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* Console tab */}
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

            {/* Compile / runtime error from submit */}
            {verdict && (verdict.type === "compile_error" || verdict.type === "runtime_error") && verdict.output && (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                    {verdict.type === "compile_error" ? "Compile Error" : "Runtime Error"}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {verdict.output}
                </pre>
              </>
            )}
          </div>
        )}

        {/* Test Cases tab */}
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

                {/* Wrong Answer / Accepted: chip row + per-case detail */}
                {(verdict.type === "accepted" || verdict.type === "wrong_answer") && totalCases > 0 && (
                  <div className="p-4">
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

                {verdict.type === "compile_error" && (
                  <div className="p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">Compiler Output</p>
                    <pre className="whitespace-pre-wrap break-words rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                      {verdict.output || "Compilation failed — no output captured."}
                    </pre>
                    <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">Fix the errors above, then submit again.</p>
                  </div>
                )}

                {verdict.type === "runtime_error" && (
                  <div className="p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">Runtime Error</p>
                    <pre className="whitespace-pre-wrap break-words rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                      {verdict.output || "Your code crashed — no stderr captured."}
                    </pre>
                    <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">Fix the runtime error above, then submit again.</p>
                  </div>
                )}

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

                {verdict.type === "error" && (
                  <div className="p-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">Submission Error</p>
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{verdict.message}</p>
                    </div>
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

                {/* Catch-all */}
                {verdict.type !== "accepted" &&
                  verdict.type !== "wrong_answer" &&
                  verdict.type !== "compile_error" &&
                  verdict.type !== "runtime_error" &&
                  verdict.type !== "tle" &&
                  verdict.type !== "error" && (
                  <div className="p-4">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                      <p className="text-xs font-mono text-zinc-500">verdict: {verdict.type}</p>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{verdict.message}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* AI feedback */}
        {aiLoading && (
          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="animate-pulse text-xs text-zinc-400 dark:text-zinc-500">🤖 Analyzing your code…</p>
          </div>
        )}
        {aiError && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-xs text-red-600 dark:text-red-400">{aiError}</p>
          </div>
        )}
        {aiFeedback && (
          <div className="border-t border-indigo-200 bg-indigo-50/60 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-950/30">
            <AiFeedbackCard feedback={aiFeedback} onClear={onClearAI} />
          </div>
        )}

        {/* Code review / Interview debrief */}
        {codeReviewLoading && (
          <div className="border-t border-violet-200 px-4 py-3 dark:border-violet-800">
            <p className="animate-pulse text-xs text-violet-500 dark:text-violet-400">
              {interviewMode ? "🎤 Generating your interview debrief…" : "🔍 Reviewing your code…"}
            </p>
          </div>
        )}
        {codeReviewUpgrade && !codeReview && (
          <div className="border-t border-violet-200 bg-violet-50/60 px-4 py-3 dark:border-violet-800 dark:bg-violet-950/20">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">AI code review is a Pro feature</p>
            <a href="/pricing" className="mt-1 inline-block text-xs font-bold text-violet-600 underline underline-offset-2 hover:text-violet-500 dark:text-violet-400">
              Upgrade to Pro →
            </a>
          </div>
        )}
        {codeReview && (
          <div className="border-t border-violet-200 bg-violet-50/40 px-4 py-4 dark:border-violet-800 dark:bg-violet-950/20">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                {interviewMode ? "🎤 Interview Debrief" : "🔍 Code Review"}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${codeReview.score >= 7 ? "text-emerald-600 dark:text-emerald-400" : codeReview.score >= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                  {codeReview.score}/10
                </span>
                <button onClick={onClearCodeReview} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">✕</button>
              </div>
            </div>
            <p className="mb-3 text-sm text-zinc-700 dark:text-zinc-300">{codeReview.summary}</p>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white px-3 py-2 dark:bg-zinc-800">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Time</span>
                <p className="font-mono text-zinc-800 dark:text-zinc-200">{codeReview.time_complexity}</p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 dark:bg-zinc-800">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Space</span>
                <p className="font-mono text-zinc-800 dark:text-zinc-200">{codeReview.space_complexity}</p>
              </div>
            </div>
            {codeReview.strengths.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ Strengths</p>
                <ul className="space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {codeReview.strengths.map((s, i) => <li key={`str-${i}`}>• {s}</li>)}
                </ul>
              </div>
            )}
            {codeReview.improvements.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-xs font-semibold text-amber-600 dark:text-amber-400">↑ Improvements</p>
                <ul className="space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {codeReview.improvements.map((s, i) => <li key={`imp-${i}`}>• {s}</li>)}
                </ul>
              </div>
            )}
            {codeReview.code_style && (
              <p className="text-xs italic text-zinc-500 dark:text-zinc-500">{codeReview.code_style}</p>
            )}
          </div>
        )}

        {/* "Get interview debrief" button — interview simulation only */}
        {interviewMode && !codeReview && !codeReviewLoading && verdict && (
          <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
            <button
              type="button"
              onClick={onRequestCodeReview}
              disabled={codeReviewLoading}
              className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
            >
              <span>🔍</span>
              Get interview debrief
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
