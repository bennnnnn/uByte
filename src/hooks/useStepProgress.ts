"use client";

import { useState, useEffect, useRef } from "react";
import type { TutorialStep } from "@/lib/tutorial-steps";
import type { AiFeedbackSchema } from "@/lib/ai/feedback-client";
import { validateTutorialStep } from "@/lib/step-validation";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";
import { parseErrorLines } from "./useCodeEditor";
import { apiFetch } from "@/lib/api-client";
import { trackConversion } from "@/lib/analytics";
import { celebrate } from "@/lib/celebrate";
import { useToast } from "@/components/Toast";

export type Status = "idle" | "running" | "passed" | "failed";
export type FailureKind = "output" | "task" | "compile" | null;

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
  failureKind: FailureKind;
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
  showHint: boolean;
  setShowHint: (v: boolean) => void;
  goToStep: (idx: number, opts?: { editorCode?: string }) => void;
  skipStep: () => void;
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
  const { toggleProgress, incrementStepCount, profile, refreshProfile } = useAuth();
  const isPro = hasPaidAccess(profile?.plan);
  const { toast } = useToast();

  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState<string | null>(null);
  const [outputIsError, setOutputIsError] = useState(false);
  const [failureKind, setFailureKind] = useState<FailureKind>(null);
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackSchema | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedbackUpgrade, setAiFeedbackUpgrade] = useState(false);
  const [aiFeedbackLoginRequired, setAiFeedbackLoginRequired] = useState(false);
  const [failCount, setFailCount] = useState(0);

  // Set to true synchronously the moment a hint fetch starts (before any React re-render),
  // so subsequent auto-trigger checks always see the right value regardless of whether
  // React has re-rendered yet. Reset when the step changes or passes.
  const hintInflightRef = useRef(false);
  // Tracks whether the URL already specified a ?step= param on mount.
  // If it did, we respect it and skip the auto-resume-to-first-incomplete logic.
  const urlHasStepRef = useRef(false);
  // Stores the last failed check's data so the auto-hint useEffect can fire fetchAiFeedback
  // outside of a state updater (React can re-invoke updaters in concurrent mode).
  const pendingAutoHintRef = useRef<{ code: string; output: string; isError: boolean; stepIndex: number; failureKind: FailureKind } | null>(null);
  const [showInlineChat, setShowInlineChat] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const markedRef = useRef(false);

  // ── Auto-hint after 2+ failures — runs as an effect, not inside a state updater ──
  useEffect(() => {
    if (failCount >= 2 && !hintInflightRef.current && pendingAutoHintRef.current) {
      const { code, output, isError, stepIndex, failureKind } = pendingAutoHintRef.current;
      pendingAutoHintRef.current = null;
      fetchAiFeedback(code, output, isError, stepIndex, failureKind);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failCount]);

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
      urlHasStepRef.current = true;
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

        // Auto-resume to the first incomplete step when the URL didn't specify ?step=.
        // This means a user reopening /tutorial/python/functions always lands where they
        // left off rather than back at step 0.
        if (!urlHasStepRef.current && steps.length > 0) {
          const doneSet = new Set([...completed, ...skipped]);
          for (let i = 0; i < steps.length; i++) {
            if (!doneSet.has(i)) {
              if (i > 0) {
                setStepIndex(i);
                setCode(steps[i].starter);
              }
              break;
            }
          }
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [userId, tutorialSlug, lang, steps.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Chapter completion — fires once when the user passes the LAST step ──
  useEffect(() => {
    // markedRef guards against double-firing (e.g. on re-renders or after DB restore).
    // toggleProgress always sends completed=true; ON CONFLICT DO NOTHING makes it safe
    // to call more than once. See AuthProvider.tsx for the two-table progress model.
    if (completedSteps.size === steps.length && steps.length > 0 && !markedRef.current) {
      markedRef.current = true;
      setTutorialDone(true);
      toggleProgress(tutorialSlug, lang).then(() => refreshProfile());
      // Fire analytics only when the tutorial is genuinely finished, not on DB restore.
      trackConversion("completed_tutorial", { lang, slug: tutorialSlug });
    }
  }, [completedSteps, steps.length, tutorialSlug, toggleProgress, lang, refreshProfile]);

  // ── Confetti when tutorial is complete ──
  useEffect(() => {
    if (!tutorialDone) return;
    import("canvas-confetti").then((mod) => mod.default({ particleCount: 120, spread: 80, origin: { y: 0.6 } }));
  }, [tutorialDone]);

  function skipStep() {
    setSkippedSteps((prev) => new Set([...prev, stepIndex]));
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    setStatus("passed");
    setFailureKind(null);
    setFailCount(0);
    setAiFeedbackLoginRequired(false);
    hintInflightRef.current = false;
    pendingAutoHintRef.current = null;
    // Persist to DB as skipped so it's distinguished from genuinely completed steps on refresh
    if (userId != null) {
      apiFetch("/api/progress/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tutorialSlug, stepIndex, lang, skipped: true }),
      }).catch(() => {});
    }
  }

  function goToStep(idx: number, opts?: { editorCode?: string }) {
    setStepIndex(idx);
    const nextStep = steps[idx];
    const carry =
      opts?.editorCode !== undefined &&
      idx > 0 &&
      nextStep?.carryForward === true;
    setCode(carry ? opts.editorCode! : steps[idx].starter);
    setOutput(null);
    setStatus("idle");
    setFailureKind(null);
    setShowHint(false);
    setFailCount(0);
    setAiFeedback(null);
    setAiFeedbackUpgrade(false);
    setAiFeedbackLoginRequired(false);
    hintInflightRef.current = false;
    pendingAutoHintRef.current = null;
    setShowInlineChat(false);
  }

  function getFallbackHint(kind: FailureKind): { hint: string; nextStep: string } {
    switch (kind) {
      case "compile":
        return {
          hint: "Read the compiler message above and fix the line it points to.",
          nextStep: "Make one syntax or type fix, then click Check again.",
        };
      case "task":
        return {
          hint: "Keep the starter comments if they help, but add the code the task asks for where the placeholder points.",
          nextStep: "Follow the validation message above and fill in the missing line or block.",
        };
      default:
        return {
          hint: "Compare your output with the expected output shown below the editor.",
          nextStep: "Fix the difference and click Check again.",
        };
    }
  }

  function fetchAiFeedback(
    userCode: string,
    actualOutput: string,
    isError: boolean,
    currentStepIndex: number,
    currentFailureKind: FailureKind
  ) {
    const fallback = getFallbackHint(currentFailureKind);
    // Guest users — show a sign-in prompt instead of calling the API.
    if (userId == null) {
      setAiFeedbackLoginRequired(true);
      hintInflightRef.current = false;
      return;
    }
    // Free users — show upgrade prompt immediately, no API call needed.
    if (!isPro) {
      setAiFeedbackUpgrade(true);
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
        failureKind: currentFailureKind,
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
            hint: fallback.hint,
            next_step: fallback.nextStep,
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
          hint: fallback.hint,
          next_step: fallback.nextStep,
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
    if (status !== "failed" || hintInflightRef.current || aiFeedbackLoading) return;
    fetchAiFeedback(code, output ?? "", outputIsError, stepIndex, failureKind ?? (outputIsError ? "compile" : "output"));
  }
  async function handleCheck(
    code: string,
    step: TutorialStep,
    setCodeFn: (c: string) => void,
    setErrorLines: (l: Set<number>) => void
  ) {
    setStatus("running");
    setOutput(null);
    setFailureKind(null);
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
        setFailureKind("compile");
        setErrorLines(parseErrorLines(out, lang));
        setStatus("failed");
        pendingAutoHintRef.current = { code, output: out, isError: true, stepIndex, failureKind: "compile" };
        setFailCount((n) => n + 1);
        apiFetch("/api/step-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, tutorialSlug, stepIndex, passed: false }),
        }).catch(() => {});
        return;
      }
      const validation = validateTutorialStep({
        code,
        step,
        runOutput: out,
        hasCompileError: false,
      });
      if (!validation.passed) {
        const failMsg =
          validation.failureKind === "task" && validation.message
            ? validation.message
            : validation.failureKind === "output"
              ? null
              : validation.message;
        setOutputIsError(false);
        setFailureKind(validation.failureKind ?? "output");
        if (failMsg) setOutput(failMsg);
        setStatus("failed");
        pendingAutoHintRef.current = {
          code,
          output: failMsg ?? out,
          isError: false,
          stepIndex,
          failureKind: validation.failureKind ?? "output",
        };
        setFailCount((n) => n + 1);
        apiFetch("/api/step-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, tutorialSlug, stepIndex, passed: false }),
        }).catch(() => {});
        return;
      }

      setStatus("passed");
      setFailureKind(null);
      celebrate(stepIndex === 0);
      toast("Step passed!", "success");
      setFailCount(0);
      setAiFeedback(null);
      setAiFeedbackUpgrade(false);
      setAiFeedbackLoginRequired(false);
      hintInflightRef.current = false;
      pendingAutoHintRef.current = null;
      setCompletedSteps((prev) => new Set([...prev, stepIndex]));
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
    } catch {
      setFailureKind("compile");
      setOutput("Could not reach the compiler. Please try again.");
      setStatus("failed");
    }
  }

  function handleReset(step: TutorialStep, setCodeFn: (c: string) => void, setErrorLines: (l: Set<number>) => void) {
    setCodeFn(step.starter);
    setOutput(null);
    setStatus("idle");
    setFailureKind(null);
    setErrorLines(new Set());
    setAiFeedback(null);
    setAiFeedbackUpgrade(false);
    setAiFeedbackLoginRequired(false);
    hintInflightRef.current = false;
    pendingAutoHintRef.current = null;
  }

  return {
    stepIndex,
    completedSteps,
    skippedSteps,
    status,
    output,
    outputIsError,
    failureKind,
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
    showHint,
    setShowHint,
    goToStep,
    skipStep,
    handleCheck,
    handleReset,
  };
}
