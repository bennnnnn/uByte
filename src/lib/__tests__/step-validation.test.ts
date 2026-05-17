import { describe, it, expect } from "vitest";
import { validateTutorialStep } from "../step-validation";
import type { TutorialStep } from "@/lib/tutorial-steps/types";

const caseStep: TutorialStep = {
  title: "Case sensitivity",
  instruction: "",
  starter: 'Console.log("x");',
  expectedOutput: ["Hello!", "World!"],
  codeChecks: [
    {
      pattern: "Console\\.log|console\\.Log",
      flags: "m",
      required: false,
      message: "Use lowercase: console.log",
    },
  ],
};

describe("validateTutorialStep", () => {
  it("passes correct lowercase JS", () => {
    const result = validateTutorialStep({
      code: 'console.log("Hello!");\nconsole.log("World!");',
      step: caseStep,
      runOutput: "Hello!\nWorld!\n",
      hasCompileError: false,
    });
    expect(result.passed).toBe(true);
  });

  it("fails wrong casing before output check", () => {
    const result = validateTutorialStep({
      code: 'Console.log("Hello!");',
      step: caseStep,
      runOutput: "Hello!\n",
      hasCompileError: false,
    });
    expect(result.passed).toBe(false);
    expect(result.failureKind).toBe("task");
  });
});
