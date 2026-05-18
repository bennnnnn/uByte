"use client";

import { useRef, useState } from "react";
import type { AiFeedbackSchema } from "@/lib/ai/feedback-client";
import { apiFetch } from "@/lib/api-client";
import type { FailureKind } from "@/lib/step-validation";

export function useTutorialAiHints(opts: {
  userId?: number;
  isPro: boolean;
  tutorialSlug: string;
  lang: string;
  stepIndex: number;
  status: string;
  output: string | null;
  outputIsError: boolean;
  failureKind: FailureKind;
}) {
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackSchema | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedbackUpgrade, setAiFeedbackUpgrade] = useState(false);
  const [aiFeedbackLoginRequired, setAiFeedbackLoginRequired] = useState(false);
  const hintInflightRef = useRef(false);
  const pendingAutoHintRef = useRef<{
    code: string;
    output: string;
    isError: boolean;
    stepIndex: number;
    failureKind: FailureKind;
  } | null>(null);

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
    currentFailureKind: FailureKind,
  ) {
    const fallback = getFallbackHint(currentFailureKind);
    if (opts.userId == null) {
      setAiFeedbackLoginRequired(true);
      hintInflightRef.current = false;
      return;
    }
    if (!opts.isPro) {
      setAiFeedbackUpgrade(true);
      hintInflightRef.current = false;
      return;
    }
    hintInflightRef.current = true;
    setAiFeedbackLoading(true);
    setAiFeedbackUpgrade(false);
    apiFetch("/api/tutorial-hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tutorialSlug: opts.tutorialSlug,
        stepIndex: currentStepIndex,
        lang: opts.lang,
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

  function requestHint(code: string) {
    if (opts.status !== "failed" || hintInflightRef.current || aiFeedbackLoading) return;
    fetchAiFeedback(
      code,
      opts.output ?? "",
      opts.outputIsError,
      opts.stepIndex,
      opts.failureKind ?? (opts.outputIsError ? "compile" : "output"),
    );
  }

  function clearHints() {
    setAiFeedback(null);
    setAiFeedbackUpgrade(false);
    setAiFeedbackLoginRequired(false);
    hintInflightRef.current = false;
    pendingAutoHintRef.current = null;
  }

  return {
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
  };
}
