"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import type { TutorialStep } from "@/lib/tutorial-steps";
import { useAuth } from "@/components/AuthProvider";
import { parseErrorLines } from "./useCodeEditor";

export type Status = "idle" | "running" | "passed" | "failed";

function checkOutput(output: string, expected: string[]): boolean {
  if (!output.trim()) return false;
  if (expected.length === 0) return true;
  const lower = output.toLowerCase();
  return expected.every((s) => lower.includes(s.toLowerCase()));
}

async function runCodeRequest(currentCode: string): Promise<{ output: string; hasError: boolean }> {
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

export interface StepProgressState {
  stepIndex: number;
  completedSteps: Set<number>;
  status: Status;
  output: string | null;
  outputIsError: boolean;
  aiFeedback: string | null;
  failCount: number;
  showInlineChat: boolean;
  setShowInlineChat: (v: boolean) => void;
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
  tutorialSlug: string,
  next: { slug: string; title: string } | null,
  setCode: (c: string) => void
): StepProgressState {
  const { toggleProgress, progress } = useAuth();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState<string | null>(null);
  const [outputIsError, setOutputIsError] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
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

  // ── Tutorial completion ──
  useEffect(() => {
    if (completedSteps.size === steps.length && steps.length > 0 && !markedRef.current && !progress.includes(tutorialSlug)) {
      markedRef.current = true;
      setTutorialDone(true);
      toggleProgress(tutorialSlug);
    }
  }, [completedSteps, steps.length, tutorialSlug, toggleProgress, progress]);

  // ── Auto-advance countdown + confetti ──
  useEffect(() => {
    if (!tutorialDone) return;
    setCountdown(3);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [tutorialDone]);

  useEffect(() => {
    if (!tutorialDone || countdown > 0) return;
    router.push(next ? `/golang/${next.slug}` : "/");
  }, [countdown, tutorialDone, next, router]);

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
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    setStatus("passed");
    setFailCount(0);
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

  function fetchAiFeedback(
    userCode: string,
    error: string,
    outputText: string,
    currentStepIndex: number
  ) {
    fetch("/api/code-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: userCode, error, output: outputText, tutorialSlug, stepIndex: currentStepIndex }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.feedback) setAiFeedback(d.feedback); })
      .catch(() => {});
  }

  async function handleRun(code: string, setErrorLines: (l: Set<number>) => void) {
    setStatus("running");
    setOutput(null);
    setErrorLines(new Set());
    setAiFeedback(null);
    try {
      const { output: out, hasError } = await runCodeRequest(code);
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

    // Silently auto-format before checking
    try {
      const body = new URLSearchParams({ body: code, imports: "true" });
      const fmtRes = await fetch("https://go.dev/_/fmt", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const fmtData = await fmtRes.json();
      if (fmtData.Body && !fmtData.Error) setCodeFn(fmtData.Body);
    } catch { /* ignore */ }

    try {
      const { output: out, hasError } = await runCodeRequest(code);
      setOutputIsError(hasError);
      setOutput(out || (hasError ? "Compilation error" : "(no output)"));
      if (hasError) {
        setErrorLines(parseErrorLines(out));
        setStatus("failed");
        fetchAiFeedback(code, out, "", stepIndex);
        return;
      }
      if (checkOutput(out, step.expectedOutput)) {
        setStatus("passed");
        setFailCount(0);
        setCompletedSteps((prev) => new Set([...prev, stepIndex]));
      } else {
        setStatus("failed");
        setFailCount((n) => n + 1);
        fetchAiFeedback(code, "", out, stepIndex);
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
    status,
    output,
    outputIsError,
    aiFeedback,
    failCount,
    showInlineChat,
    setShowInlineChat,
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
