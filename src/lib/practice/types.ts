import type { SupportedLanguage } from "@/lib/languages/types";

export type Difficulty = "easy" | "medium" | "hard";

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
  examples: ProblemExample[];
  /** Starter code per language; used for editor initial value */
  starter: Partial<Record<SupportedLanguage, string>>;
  testCases?: TestCase[];
  judgeHarness?: JudgeHarness;
}
