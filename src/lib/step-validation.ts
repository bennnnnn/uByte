import type { TutorialStep } from "@/lib/tutorial-steps/types";
import { checkOutput, runCodeChecks, todoNotCompleted } from "@/lib/code-checks";

export type StepFailureKind = "output" | "task" | "compile" | null;
export type FailureKind = StepFailureKind;

export interface StepValidationInput {
  code: string;
  step: TutorialStep;
  runOutput: string;
  hasCompileError: boolean;
}

export interface StepValidationResult {
  passed: boolean;
  failureKind: StepFailureKind;
  message: string | null;
}

/**
 * Client-side step pass/fail (output + codeChecks + TODO starter diff).
 * Server step-check may add additional validation for logged-in users.
 */
export function validateTutorialStep(input: StepValidationInput): StepValidationResult {
  const { code, step, runOutput, hasCompileError } = input;

  if (hasCompileError) {
    return { passed: false, failureKind: "compile", message: null };
  }

  const codeCheckMsg = runCodeChecks(code, step.codeChecks);
  if (codeCheckMsg) {
    return { passed: false, failureKind: "task", message: codeCheckMsg };
  }

  if (todoNotCompleted(code, step.starter)) {
    return {
      passed: false,
      failureKind: "task",
      message: "Replace the TODO comments with your code before continuing.",
    };
  }

  if (!checkOutput(runOutput, step.expectedOutput)) {
    return { passed: false, failureKind: "output", message: null };
  }

  return { passed: true, failureKind: null, message: null };
}
