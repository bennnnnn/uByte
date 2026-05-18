"use client";

import type { TutorialStep } from "@/lib/tutorial-steps";
import { validateTutorialStep, type FailureKind } from "@/lib/step-validation";
import { parseErrorLines } from "@/hooks/useCodeEditor";
import { apiFetch } from "@/lib/api-client";
import { celebrate } from "@/lib/celebrate";
import { runCodeRequest } from "./run-code-client";

export type CheckStatus = "idle" | "running" | "passed" | "failed";

export function useTutorialStepCheck(ctx: {
  lang: string;
  tutorialSlug: string;
  stepIndex: number;
  userId?: number;
  onPassed: () => void;
  onFail: (payload: {
    code: string;
    output: string;
    isError: boolean;
    failureKind: FailureKind;
  }) => void;
  toast: (msg: string, type: "success" | "error") => void;
}) {
  async function handleCheck(
    code: string,
    step: TutorialStep,
    setCodeFn: (c: string) => void,
    setters: {
      setStatus: (s: CheckStatus) => void;
      setOutput: (o: string | null) => void;
      setOutputIsError: (v: boolean) => void;
      setFailureKind: (k: FailureKind) => void;
      setErrorLines: (l: Set<number>) => void;
    },
  ) {
    setters.setStatus("running");
    setters.setOutput(null);
    setters.setFailureKind(null);
    setters.setErrorLines(new Set());

    if (ctx.userId) {
      apiFetch("/api/code-snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: ctx.tutorialSlug, stepIndex: ctx.stepIndex, code, lang: ctx.lang }),
      }).catch(() => {});
    }

    try {
      const fmtRes = await apiFetch("/api/format-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: ctx.lang }),
      });
      const fmtData = await fmtRes.json();
      if (typeof fmtData?.code === "string" && fmtData.changed) setCodeFn(fmtData.code);
    } catch {
      /* ignore */
    }

    try {
      const { output: out, hasError } = await runCodeRequest(code, ctx.lang);
      setters.setOutputIsError(hasError);
      setters.setOutput(out || (hasError ? "Compilation error" : "(no output)"));

      if (hasError) {
        setters.setFailureKind("compile");
        setters.setErrorLines(parseErrorLines(out, ctx.lang));
        setters.setStatus("failed");
        ctx.onFail({ code, output: out, isError: true, failureKind: "compile" });
        apiFetch("/api/step-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang: ctx.lang,
            tutorialSlug: ctx.tutorialSlug,
            stepIndex: ctx.stepIndex,
            passed: false,
          }),
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
        setters.setOutputIsError(false);
        setters.setFailureKind(validation.failureKind ?? "output");
        if (failMsg) setters.setOutput(failMsg);
        setters.setStatus("failed");
        ctx.onFail({
          code,
          output: failMsg ?? out,
          isError: false,
          failureKind: validation.failureKind ?? "output",
        });
        apiFetch("/api/step-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang: ctx.lang,
            tutorialSlug: ctx.tutorialSlug,
            stepIndex: ctx.stepIndex,
            passed: false,
          }),
        }).catch(() => {});
        return;
      }

      setters.setStatus("passed");
      setters.setFailureKind(null);
      celebrate(ctx.stepIndex === 0);
      ctx.toast("Step passed!", "success");
      ctx.onPassed();
      apiFetch("/api/step-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: ctx.lang,
          tutorialSlug: ctx.tutorialSlug,
          stepIndex: ctx.stepIndex,
          passed: true,
        }),
      }).catch(() => {});
      if (ctx.userId != null) {
        apiFetch("/api/progress/steps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: ctx.tutorialSlug, stepIndex: ctx.stepIndex, lang: ctx.lang }),
        }).catch(() => {});
      }
    } catch {
      setters.setFailureKind("compile");
      setters.setOutput("Could not reach the compiler. Please try again.");
      setters.setStatus("failed");
    }
  }

  return { handleCheck };
}
