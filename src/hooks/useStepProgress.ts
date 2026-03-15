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
import { trackConversion } from "@/lib/analytics";
import { celebrate } from "@/lib/celebrate";

export type Status = "idle" | "running" | "passed" | "failed";

function checkOutput(output: string, expected: string[]): boolean {
  if (!output.trim()) return false;
  if (expected.length === 0) return true;
  const lower = output.toLowerCase();
  return expected.every((s) => lower.includes(s.toLowerCase()));
}

/**
 * TODO comment pattern — matches all common single-line comment styles:
 *   // TODO   (C-family, Go, Java, Rust, JS/TS, Swift, Kotlin, C#)
 *   #  TODO   (Python, Ruby, Shell, YAML)
 *   -- TODO   (SQL, Lua, Haskell)
 *   /* TODO   (block comment opener used as a line comment)
 */
const TODO_LINE_RE = /^\s*(\/\/|#|--|\/\*)\s*TODO\b/;

/** Strip TODO comment lines and collapse whitespace — used for meaningful-change detection. */
function normCode(code: string): string {
  return code
    .split("\n")
    .filter((line) => !TODO_LINE_RE.test(line))
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
  // Check all supported comment styles in the starter
  if (!TODO_LINE_RE.test(starter)) return false;
  return normCode(code) === normCode(starter);
}

/**
 * Run a single regex against user code with a hard character limit to prevent
 * ReDoS attacks from pathological patterns on large inputs.
 */
const MAX_CHECK_INPUT = 8_000; // chars — beyond this, truncate before testing

function safeRegexTest(pattern: string, flags: string, input: string): boolean {
  try {
    const safeInput = input.length > MAX_CHECK_INPUT ? input.slice(0, MAX_CHECK_INPUT) : input;
    return new RegExp(pattern, flags).test(safeInput);
  } catch {
    // Invalid regex in steps.json — treat as not matching
    return false;
  }
}

/** Validate per-step code rules. Returns the first failing message, or null. */
function runCodeChecks(code: string, checks: CodeCheck[] | undefined): string | null {
  if (!checks?.length) return null;
  for (const { pattern, flags = "im", required = true, message } of checks) {
    const matches = safeRegexTest(pattern, flags, code);
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
  aiFeedbackUpgrade: boolean;
  aiFeedbackLoginRequired: boolean;
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
  const { toggleProgress, incrementStepCount } = useAuth();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState<string | null>(null);
  const [outputIsError, setOutputIsError] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackSchema | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedbackUpgrade, setAiFeedbackUpgrade] = useState(false);
  const [aiFeedbackLoginRequired, setAiFeedbackLoginRequired] = useState(false);
  const [failCount, setFailCount] = useState(0);

  // Set to true synchronously the moment a hint fetch starts (before any React re-render),
  // so subsequent auto-trigger checks inside setFailCount updaters always see the right value
  // regardless of whether React has re-rendered yet.  Reset when the step changes or passes.
  const hintInflightRef = useRef(false);
  const [showInlineChat, setShowInlineChat] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const markedRef = useRef(false);

  // ── Analytics: fire started_tutorial once per session when user is logged in ──
  useEffect(() => {
    if (!userId || !tutorialSlug) return;
    trackConversion("started_tutorial", { lang, slug: tutorialSlug });
  // Intentionally runs once per tutorial mount — PostHog deduplicates on the server side.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const controller = new AbortController();
    apiFetch("/api/last-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "tutorial", lang, slug: tutorialSlug, step: stepIndex }),
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [userId, lang, tutorialSlug, stepIndex]);

  // ── Restore step progress from DB on mount ──
  useEffect(() => {
    if (userId == null || !tutorialSlug) return;
    const controller = new AbortController();
    apiFetch(`/api/progress/steps?slug=${encodeURIComponent(tutorialSlug)}&lang=${encodeURIComponent(lang)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (controller.signal.aborted) return;
        const completed: number[] = Array.isArray(d?.steps) ? d.steps : [];
        const skipped: number[] = Array.isArray(d?.skippedSteps) ? d.skippedSteps : [];

        if (steps.length > 0 && (completed.length + skipped.length) >= steps.length) {
          markedRef.current = true;
        }
        setCompletedSteps((prev) => new Set([...prev, ...completed, ...skipped]));
        setSkippedSteps((prev) => new Set([...prev, ...skipped]));
      })
      .catch(() => {});
    return () => controller.abort();
  }, [userId, tutorialSlug, lang, steps.length]);

  // ── Chapter completion — fires once when the user passes the LAST step ──
  useEffect(() => {
    // markedRef guards against double-firing (e.g. on re-renders or after DB restore).
    // toggleProgress always sends completed=true; ON CONFLICT DO NOTHING makes it safe
    // to call more than once. See AuthProvider.tsx for the two-table progress model.
    if (completedSteps.size === steps.length && steps.length > 0 && !markedRef.current) {
      markedRef.current = true;
      setTutorialDone(true);
      toggleProgress(tutorialSlug, lang);
      // Fire analytics only when the tutorial is genuinely finished, not on DB restore.
      trackConversion("completed_tutorial", { lang, slug: tutorialSlug });
    }
  }, [completedSteps, steps.length, tutorialSlug, toggleProgress, lang]);

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
    // router is stable (Next.js guarantees it). next, lang, and tutorialUrl are props/constants
    // that don't change during a session — including them would add noise without value.
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
    // steps is a stable prop (content array from JSON, never mutated).
    // State setters (setStepIndex, setCode, etc.) are guaranteed stable by React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stepIndex]);

  function skipStep() {
    setSkippedSteps((prev) => new Set([...prev, stepIndex]));
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    setStatus("passed");
    setFailCount(0);
    setAiFeedbackLoginRequired(false);
    hintInflightRef.current = false;
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
    setAiFeedbackUpgrade(false);
    setAiFeedbackLoginRequired(false);
    hintInflightRef.current = false;
    setShowInlineChat(false);
  }

  function fetchAiFeedback(userCode: string, actualOutput: string, isError: boolean, currentStepIndex: number) {
    // Guest users — show a sign-in prompt instead of calling the API.
    if (userId == null) {
      setAiFeedbackLoginRequired(true);
      hintInflightRef.current = false;
      return;
    }
    hintInflightRef.current = true; // Set synchronously — prevents re-entry before React re-renders.
    setAiFeedbackLoading(true);
    // Keep the existing hint visible while the new one loads — don't blank it eagerly.
    setAiFeedbackUpgrade(false);
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
      .then(async (r) => {
        const d = await r.json();
        if (r.status === 402 && d?.error === "upgrade_required") {
          setAiFeedback(null);
          setAiFeedbackUpgrade(true);
        } else if (d?.friendly_one_liner) {
          setAiFeedback(d as AiFeedbackSchema);
        } else {
          // API returned an unexpected error shape — show a generic fallback
          // so the hint section never silently disappears.
          setAiFeedback({
            friendly_one_liner: "Hint is temporarily unavailable. Check the output above.",
            root_cause: "ai_unavailable",
            evidence: [],
            hint: "Compare your output with the expected output. Look for spacing, capitalisation, or missing characters.",
            next_step: "Fix the difference and click Check again.",
            confidence: 0,
          });
        }
      })
      .catch(() => {
        // Network or parse error — show a fallback so the user isn't left with nothing.
        setAiFeedback({
          friendly_one_liner: "Could not reach the hint service. Check your connection and try again.",
          root_cause: "network_error",
          evidence: [],
          hint: "Review the expected output shown below the editor.",
          next_step: "Fix the difference and click Check again.",
          confidence: 0,
        });
      })
      .finally(() => {
        setAiFeedbackLoading(false);
        hintInflightRef.current = false;
      });
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
    // Intentionally do NOT clear aiFeedback here — Run is a preview, the hint stays relevant.
    try {
      const { output: out, hasError } = await runCodeRequest(code, lang);
      setOutputIsError(hasError);
      setOutput(out || (hasError ? "Compilation error (see above)" : "(no output)"));
      if (hasError) setErrorLines(parseErrorLines(out, lang));
      setStatus("idle");
    } catch {
      setOutputIsError(true);
      setOutput("Could not reach the compiler. Please try again.");
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
    // Intentionally do NOT clear aiFeedback here — keep the hint visible while re-checking.
    // It is only cleared on pass (step done) or when navigating away.
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
        setErrorLines(parseErrorLines(out, lang));
        setStatus("failed");
        setFailCount((n) => {
          const next = n + 1;
          if (next >= 2 && !hintInflightRef.current) {
            fetchAiFeedback(code, out, true, stepIndex);
          }
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
            if (next >= 2 && !hintInflightRef.current) {
              fetchAiFeedback(code, out, false, stepIndex);
            }
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
        celebrate(); // Small confetti burst — fires on every correct step.
        setFailCount(0);
        setAiFeedback(null);          // Step done — clear hint so the next step starts fresh.
        setAiFeedbackUpgrade(false);
        setAiFeedbackLoginRequired(false);
        hintInflightRef.current = false;
        setCompletedSteps((prev) => new Set([...prev, stepIndex]));
        // Increment the in-memory step count so the progress bar updates immediately
        // without waiting for a DB refetch. The DB write happens via /api/progress/steps.
        if (userId != null) incrementStepCount(lang);
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
          if (next >= 2 && !hintInflightRef.current) {
            fetchAiFeedback(code, out, false, stepIndex);
          }
          return next;
        });
        apiFetch("/api/step-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, tutorialSlug, stepIndex, passed: false }),
        }).catch(() => {});
      }
    } catch {
      setOutput("Could not reach the compiler. Please try again.");
      setStatus("failed");
    }
  }

  function handleReset(step: TutorialStep, setCodeFn: (c: string) => void, setErrorLines: (l: Set<number>) => void) {
    setCodeFn(step.starter);
    setOutput(null);
    setStatus("idle");
    setErrorLines(new Set());
    setAiFeedback(null);
    setAiFeedbackUpgrade(false);
    setAiFeedbackLoginRequired(false);
    hintInflightRef.current = false;
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
    aiFeedbackUpgrade,
    aiFeedbackLoginRequired,
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
