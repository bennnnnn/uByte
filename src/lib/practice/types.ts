import type { SupportedLanguage } from "@/lib/languages/types";

export type Difficulty = "easy" | "medium" | "hard";

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface PracticeProblem {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  examples: ProblemExample[];
  /** Starter code per language; used for editor initial value */
  starter: Partial<Record<SupportedLanguage, string>>;
}
