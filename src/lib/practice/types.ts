import type { SupportedLanguage } from "@/lib/languages/types";

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  hard:   "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
};

/** Topic/category for grouping (e.g. Array, String, Dynamic Programming). */
export type ProblemCategory =
  | "array"
  | "string"
  | "dynamic-programming"
  | "stack"
  | "two-pointers"
  | "sliding-window"
  | "sorting"
  | "hash-map"
  | "binary-search"
  | "greedy"
  | "math";

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
