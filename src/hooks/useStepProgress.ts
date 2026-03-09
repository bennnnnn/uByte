"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { TutorialStep } from "@/lib/tutorial-steps";
import type { CodeCheck } from "@/lib/tutorial-steps/types";
import type { AiFeedbackSchema } from "@/lib/ai/feedback-client";
import { useAuth } from "@/components/AuthProvider";
import { parseErrorLines } from "./useCodeEditor";
import { apiFetch } from "@/lib/api-client";
import { tutorialUrl } from "@/lib/urls";

export type Status = "idle" | "running" | "passed" | "failed";

function checkOutput(output: string, expected: string[]): boolean {
  if (!output.trim()) return false;
  if (expected.length === 0) return true;
  const lower = output.toLowerCase();
  return expected.every((s) => lower.includes(s.toLowerCase()));
}

/** Strip TODO comment lines and collapse whitespace — used for meaningful-change detection. */
function normCode(code: string): string {
  return code
    .split("\n")
    .filter((line) => !/^\s*(\/\/|#)\s*TODO\b/.test(line))
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns true when the starter had TODO comments and the user's code
 * is functionally identical to the starter after stripping those lines.
 * Catches both "left the TODO in" and "just deleted the TODO line" cases.
 */
function todoNotCompleted(code: string, starter: string): boolean {
  if (!/^\s*(\/\/|#)\s*TODO\b/m.test(starter)) return false; // starter had no TODOs
  return normCode(code) === normCode(starter);
}

/** Validate per-step code rules. Returns the first failing message, or null. */
function runCodeChecks(code: string, checks: CodeCheck[] | undefined): string | null {
  if (!checks?.length) return null;
  for (const { pattern, flags = "im", required = true, message } of checks) {
    const matches = new RegExp(pattern, flags).test(code);
    if (required && !matches) return message;
    if (!required && matches) return message;
  }
  return null;
}

async function runCodeRequest(
  currentCode: string,
  lang: string = "go"
): Promise<{ output: string; hasError: boolean }> {
  const res = await apiFetch("/api/run-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: currentCode, language: lang }),
  });
  const data = await res.json();
  if (data.Errors) return { output: data.Errors as string, hasError: true };
  const out = ((data.Events ?? []) as { Kind: string; Message: string }[])
    .filter((e) => e.Kind === "stdout").map((e) => e.Message).join("");
  return { output: out, hasError: false };
}

export interface StepProgressState {
  stepIndex: number;
  completedSteps: Set<number>;
  skippedSteps: Set<number>;
  status: Status;
  output: string | null;
  outputIsError: boolean;
  aiFeedback: AiFeedbackSchema | null;
  setAiFeedback: (v: AiFeedbackSchema | null) => void;
  aiFeedbackLoading: boolean;
  failCount: number;
  showInlineChat: boolean;
  setShowInlineChat: (v: boolean) => void;
  requestHint: (code: string) => void;
  tutorialDone: boolean;
  setTutorialDone: (v: boolean) => void;
  countdown: number;
  showHint: boolean;
  setShowHint: (v: boolean) => void;
  goToStep: (idx: number) => void;
  skipStep: () => void;
  handleRun: (code: string, setErrorLines: (l: Set<number>) => void) => Promise<void>;
  handleCheck: (code: string, step: TutorialStep, setCode: (c: string) => void, setErrorLines: (l: Set<number>) => void) => Promise<void>;
  handleReset: (step: TutorialStep, setCode: (c: string) => void, setErrorLines: (l: Set<number>) => void) => void;
}

export function useStepProgress(
  steps: TutorialStep[],
  lang: string,
  tutorialSlug: string,
  next: { slug: string; title: string } | null,
  setCode: (c: string) => void,
  userId?: number
): StepProgressState {
  const { toggleProgress, progress } = useAuth();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState<string | null>(null);
  const [outputIsError, setOutputIsError] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackSchema | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [showInlineChat, setShowInlineChat] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const markedRef = useRef(false);

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

  // ── Persist last-visited step for ContinueBanner deep-link ──
  useEffect(() => {
    try {
      localStorage.setItem(`last-step-${lang}-${tutorialSlug}`, String(stepIndex));
    } catch { /* ignore */ }
  }, [stepIndex, lang, tutorialSlug]);

  // ── Save last activity for "You left off at..." (logged-in only) ──
  useEffect(() => {
    if (userId == null) return;
    apiFetch("/api/last-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "tutorial", lang, slug: tutorialSlug, step: stepIndex }),
    }).catch(() => {});
  }, [userId, lang, tutorialSlug, stepIndex]);

  // ── Load completed steps from DB (per-question progress) ──
  useEffect(() => {
    if (userId == null || !tutorialSlug) return;
    apiFetch(`/api/progress/steps?slug=${encodeURIComponent(tutorialSlug)}&lang=${encodeURIComponent(lang)}`)
      .then((r) => r.json())
      .then((d) => {
        const completed: number[] = Array.isArray(d?.steps) ? d.steps : [];
        const skipped: number[] = Array.isArray(d?.skippedSteps) ? d.skippedSteps : [];
        setCompletedSteps((prev) => new Set([...prev, ...completed, ...skipped]));
        setSkippedSteps((prev) => new Set([...prev, ...skipped]));
      })
      .catch(() => {});
  }, [userId, tutorialSlug, lang]);

  // ── Tutorial completion ──
  useEffect(() => {
    if (completedSteps.size === steps.length && steps.length > 0 && !markedRef.current && !progress.includes(tutorialSlug)) {
      markedRef.current = true;
      setTutorialDone(true);
      toggleProgress(tutorialSlug, lang);
    }
  }, [completedSteps, steps.length, tutorialSlug, toggleProgress, progress, lang]);

  // ── Auto-advance countdown + confetti ──
  useEffect(() => {
    if (!tutorialDone) return;
    setCountdown(2);
    import("canvas-confetti").then((mod) => mod.default({ particleCount: 120, spread: 80, origin: { y: 0.6 } }));
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [tutorialDone]);

  useEffect(() => {
    if (!tutorialDone || countdown > 0) return;
    router.push(next ? tutorialUrl(lang, next.slug) : "/");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, tutorialDone]);

  // ── Auto-advance to next step after passing ──
  useEffect(() => {
    if (status !== "passed" || stepIndex >= steps.length - 1) return;
    const id = setTimeout(() => {
      const next = stepIndex + 1;
      setStepIndex(next);
      setCode(steps[next].starter);
      setOutput(null);
      setStatus("idle");
      setShowHint(false);
      setShowInlineChat(false);
    }, 2000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stepIndex]);

  function skipStep() {
    setSkippedSteps((prev) => new Set([...prev, stepIndex]));
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    setStatus("passed");
    setFailCount(0);
    // Persist to DB as skipped so it's distinguished from genuinely completed steps on refresh
    if (userId != null) {
      apiFetch("/api/progress/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tutorialSlug, stepIndex, lang, skipped: true }),
      }).catch(() => {});
    }
  }

  function goToStep(idx: number) {
    setStepIndex(idx);
    setCode(steps[idx].starter);
    setOutput(null);
    setStatus("idle");
    setShowHint(false);
    setFailCount(0);
    setAiFeedback(null);
    setShowInlineChat(false);
  }

  function fetchAiFeedback(userCode: string, actualOutput: string, isError: boolean, currentStepIndex: number) {
    setAiFeedbackLoading(true);
    setAiFeedback(null);
    apiFetch("/api/tutorial-hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tutorialSlug,
        stepIndex: currentStepIndex,
        lang,
        code: userCode,
        actualOutput,
        isError,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.friendly_one_liner) setAiFeedback(d as AiFeedbackSchema);
      })
      .catch(() => {})
      .finally(() => setAiFeedbackLoading(false));
  }

  /** Manual "Get hint" — can also be triggered automatically after 2 failures. */
  function requestHint(code: string) {
    if (status !== "failed") return;
    fetchAiFeedback(code, output ?? "", outputIsError, stepIndex);
  }

  async function handleRun(code: string, setErrorLines: (l: Set<number>) => void) {
    setStatus("running");
    setOutput(null);
    setErrorLines(new Set());
    setAiFeedback(null);
    try {
      const { output: out, hasError } = await runCodeRequest(code, lang);
      setOutputIsError(hasError);
      setOutput(out || (hasError ? "Compilation error (see above)" : "(no output)"));
      if (hasError) setErrorLines(parseErrorLines(out));
      setStatus("idle");
    } catch {
      setOutputIsError(true);
      setOutput("Could not reach the Go compiler. Please try again.");
      setStatus("idle");
    }
  }

  async function handleCheck(
    code: string,
    step: TutorialStep,
    setCodeFn: (c: string) => void,
    setErrorLines: (l: Set<number>) => void
  ) {
    setStatus("running");
    setOutput(null);
    setAiFeedback(null);
    setErrorLines(new Set());

    // Auto-snapshot before checking (fire-and-forget, only when logged in)
    if (userId) {
      apiFetch("/api/code-snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tutorialSlug, stepIndex, code, lang }),
      }).catch(() => {});
    }

    // Silently auto-format before checking (supports all languages via /api/format-code)
    try {
      const fmtRes = await apiFetch("/api/format-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: lang }),
      });
      const fmtData = await fmtRes.json();
      if (typeof fmtData?.code === "string" && fmtData.changed) setCodeFn(fmtData.code);
    } catch { /* ignore */ }

    try {
      const { output: out, hasError } = await runCodeRequest(code, lang);
      setOutputIsError(hasError);
      setOutput(out || (hasError ? "Compilation error" : "(no output)"));
        if (hasError) {
        setErrorLines(parseErrorLines(out));
        setStatus("failed");
        setFailCount((n) => {
          const next = n + 1;
          if (next >= 2) fetchAiFeedback(code, out, true, stepIndex);
          return next;
        });
        apiFetch("/api/step-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, tutorialSlug, stepIndex, passed: false }),
        }).catch(() => {});
        return;
      }
      if (checkOutput(out, step.expectedOutput)) {
        // Layer 1: per-step code pattern checks (e.g. must contain a comment, must use a loop)
        const codeCheckMsg = runCodeChecks(code, step.codeChecks);
        // Layer 2: universal starter-diff check (catches "just deleted the TODO" attempts)
        const notDoneMsg = !codeCheckMsg && todoNotCompleted(code, step.starter)
          ? "Output is correct, but you haven't completed the task yet.\nReplace the TODO comment with your actual solution."
          : null;
        const failMsg = codeCheckMsg ?? notDoneMsg;
        if (failMsg) {
          setOutputIsError(false);
          setOutput(failMsg);
          setStatus("failed");
          setFailCount((n) => {
            const next = n + 1;
            if (next >= 2) fetchAiFeedback(code, out, false, stepIndex);
            return next;
          });
          apiFetch("/api/step-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lang, tutorialSlug, stepIndex, passed: false }),
          }).catch(() => {});
          return;
        }
        setStatus("passed");
        setFailCount(0);
        setCompletedSteps((prev) => new Set([...prev, stepIndex]));
        apiFetch("/api/step-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, tutorialSlug, stepIndex, passed: true }),
        }).catch(() => {});
        if (userId != null) {
          apiFetch("/api/progress/steps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: tutorialSlug, stepIndex, lang }),
          }).catch(() => {});
        }
      } else {
        setStatus("failed");
        setFailCount((n) => {
          const next = n + 1;
          if (next >= 2) fetchAiFeedback(code, out, false, stepIndex);
          return next;
        });
        apiFetch("/api/step-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, tutorialSlug, stepIndex, passed: false }),
        }).catch(() => {});
      }
    } catch {
      setOutput("Could not reach the Go compiler. Please try again.");
      setStatus("failed");
    }
  }

  function handleReset(step: TutorialStep, setCodeFn: (c: string) => void, setErrorLines: (l: Set<number>) => void) {
    setCodeFn(step.starter);
    setOutput(null);
    setStatus("idle");
    setErrorLines(new Set());
    setAiFeedback(null);
  }

  return {
    stepIndex,
    completedSteps,
    skippedSteps,
    status,
    output,
    outputIsError,
    aiFeedback,
    setAiFeedback,
    aiFeedbackLoading,
    failCount,
    showInlineChat,
    setShowInlineChat,
    requestHint,
    tutorialDone,
    setTutorialDone,
    countdown,
    showHint,
    setShowHint,
    goToStep,
    skipStep,
    handleRun,
    handleCheck,
    handleReset,
  };
}
