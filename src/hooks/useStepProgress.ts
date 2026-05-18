"use client";

import { useState, useEffect, useRef } from "react";
import type { TutorialStep } from "@/lib/tutorial-steps";
import type { AiFeedbackSchema } from "@/lib/ai/feedback-client";
import type { FailureKind } from "@/lib/step-validation";
import { useAuth } from "@/components/AuthProvider";
import { hasPaidAccess } from "@/lib/plans";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/components/Toast";
import { useTutorialAiHints } from "@/hooks/tutorial/useTutorialAiHints";
import { useTutorialStepCheck } from "@/hooks/tutorial/useTutorialStepCheck";
import { useTutorialProgressSync } from "@/hooks/tutorial/useTutorialProgressSync";

export type Status = "idle" | "running" | "passed" | "failed";
export type { FailureKind };

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
  void next;
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
  const [failCount, setFailCount] = useState(0);
  const [showInlineChat, setShowInlineChat] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const markedRef = useRef(false);

  const {
    aiFeedback,
    setAiFeedback,
    aiFeedbackLoading,
    aiFeedbackUpgrade,
    aiFeedbackLoginRequired,
    hintInflightRef,
    pendingAutoHintRef,
    fetchAiFeedback,
    requestHint,
    clearHints,
  } = useTutorialAiHints({
    userId,
    isPro,
    tutorialSlug,
    lang,
    stepIndex,
    status,
    output,
    outputIsError,
    failureKind,
  });

  useTutorialProgressSync({
    steps,
    lang,
    tutorialSlug,
    userId,
    stepIndex,
    completedSteps,
    setCode,
    setStepIndex,
    setCompletedSteps,
    setSkippedSteps,
    markedRef,
    setTutorialDone,
    toggleProgress,
    refreshProfile,
  });

  useEffect(() => {
    if (failCount >= 2 && !hintInflightRef.current && pendingAutoHintRef.current) {
      const pending = pendingAutoHintRef.current;
      pendingAutoHintRef.current = null;
      fetchAiFeedback(
        pending.code,
        pending.output,
        pending.isError,
        pending.stepIndex,
        pending.failureKind,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failCount]);

  useEffect(() => {
    if (!tutorialDone) return;
    import("canvas-confetti").then((mod) => mod.default({ particleCount: 120, spread: 80, origin: { y: 0.6 } }));
  }, [tutorialDone]);

  const { handleCheck } = useTutorialStepCheck({
    lang,
    tutorialSlug,
    stepIndex,
    userId,
    toast,
    onPassed: () => {
      setFailCount(0);
      clearHints();
      setCompletedSteps((prev) => new Set([...prev, stepIndex]));
      if (userId != null) incrementStepCount(lang);
    },
    onFail: ({ code, output: out, isError, failureKind: kind }) => {
      pendingAutoHintRef.current = { code, output: out, isError, stepIndex, failureKind: kind };
      setFailCount((n) => n + 1);
    },
  });

  function skipStep() {
    setSkippedSteps((prev) => new Set([...prev, stepIndex]));
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    setStatus("passed");
    setFailureKind(null);
    setFailCount(0);
    clearHints();
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
      opts?.editorCode !== undefined && idx > 0 && nextStep?.carryForward === true;
    setCode(carry ? opts.editorCode! : steps[idx].starter);
    setOutput(null);
    setStatus("idle");
    setFailureKind(null);
    setShowHint(false);
    setFailCount(0);
    clearHints();
    setShowInlineChat(false);
  }

  async function handleCheckWrapped(
    code: string,
    step: TutorialStep,
    setCodeFn: (c: string) => void,
    setErrorLines: (l: Set<number>) => void,
  ) {
    await handleCheck(code, step, setCodeFn, {
      setStatus,
      setOutput,
      setOutputIsError,
      setFailureKind,
      setErrorLines,
    });
  }

  function handleReset(step: TutorialStep, setCodeFn: (c: string) => void, setErrorLines: (l: Set<number>) => void) {
    setCodeFn(step.starter);
    setOutput(null);
    setStatus("idle");
    setFailureKind(null);
    setErrorLines(new Set());
    clearHints();
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
    handleCheck: handleCheckWrapped,
    handleReset,
  };
}
