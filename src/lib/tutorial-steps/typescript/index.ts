/**
 * TypeScript tutorial step definitions.
 * Steps are loaded from content/typescript/<slug>.steps.json at runtime.
 * This file is a fallback only.
 */
import type { TutorialStep } from "../types";

export const typescriptSteps: Record<string, TutorialStep[]> = {
  "getting-started": [
    {
      title: "Your first TypeScript program",
      instruction: "TypeScript adds type annotations to JavaScript. Declare a variable with a type annotation using `: type` syntax.\n\nRun this.",
      starter: 'const message: string = "Hello, TypeScript!";\nconsole.log(message);',
      expectedOutput: ["Hello, TypeScript!"],
      successMessage: "TypeScript compiles to JavaScript. The `: string` annotation tells the compiler what type `message` must hold.",
    },
    {
      title: "Type annotations on functions",
      instruction: "Annotate function parameters and return types.\n\nRun this.",
      starter: "function add(a: number, b: number): number {\n  return a + b;\n}\n\nconsole.log(add(3, 4));",
      expectedOutput: ["7"],
      successMessage: "TypeScript ensures you can't accidentally pass a string where a number is expected.",
    },
  ],
};
