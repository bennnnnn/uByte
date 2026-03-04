import type { SupportedLanguage } from "@/lib/languages/types";

export type Difficulty = "easy" | "medium" | "hard";

/** Topic/category for grouping (e.g. Array, String, Dynamic Programming). */
export type ProblemCategory =
  | "array"
  | "string"
  | "dynamic-programming"
  | "stack"
  | "two-pointers"
  | "sliding-window"
  | "sorting"
  | "hash-map";

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

/** One hidden test case for auto-grading. */
export interface TestCase {
  stdin: string;
  expectedOutput: string;
}

/** Per-language judge harness template. Placeholder {{SOLUTION}} is replaced with the user's extracted code. */
export interface JudgeHarness {
  go?: string;
  python?: string;
  javascript?: string;
  cpp?: string;
  java?: string;
  rust?: string;
}

export interface PracticeProblem {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  /** Optional category for grouping on practice list (e.g. array, string). */
  category?: ProblemCategory;
  examples: ProblemExample[];
  /** Starter code per language; used for editor initial value */
  starter: Partial<Record<SupportedLanguage, string>>;
  testCases?: TestCase[];
  judgeHarness?: JudgeHarness;
}
