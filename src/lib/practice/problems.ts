/**
 * Interview prep problem registry.
 *
 * HOW TO ADD A NEW PROBLEM:
 *   1. Add it to problems-easy.ts, problems-medium.ts, or problems-hard.ts
 *   2. Include `category` on the definition (e.g. category: "array")
 *      — categories, counts, and filters all derive from the problems automatically
 *   3. Add starter code per language in the `starter` field
 *   4. Optionally add testCases and judgeHarness for auto-grading
 *
 * All counts (total, per-category, per-difficulty) are dynamic.
 * The free drip system (src/lib/db/practice-unlocks.ts) gates access for free users.
 */
import type { PracticeProblem, ProblemCategory, Difficulty } from "./types";
import type { SupportedLanguage } from "@/lib/languages/types";
import { EASY_PROBLEMS } from "./problems-easy";
import { EASY_PROBLEMS_2 } from "./problems-easy-2";
import { MEDIUM_PROBLEMS } from "./problems-medium";
import { MEDIUM_PROBLEMS_2 } from "./problems-medium-2";
import { HARD_PROBLEMS } from "./problems-hard";
import { HARD_PROBLEMS_2 } from "./problems-hard-2";

// ─── Default starters ───────────────────────────────────────────────────────

const DEFAULT_GO = `package main

import "fmt"

func main() {
\t// Your code here
\tfmt.Println()
}`;

const DEFAULT_PYTHON = `# Your code here
def main():
    pass

if __name__ == "__main__":
    main()`;

const DEFAULT_CPP = `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`;

const DEFAULT_JS = `// Your code here\nconsole.log("Hello, World!");`;
const DEFAULT_JAVA = `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`;
const DEFAULT_RUST = `fn main() {\n    // Your code here\n    println!("Hello, World!");\n}`;

// ─── Combined problems ──────────────────────────────────────────────────────

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  ...EASY_PROBLEMS,
  ...EASY_PROBLEMS_2,
  ...MEDIUM_PROBLEMS,
  ...MEDIUM_PROBLEMS_2,
  ...HARD_PROBLEMS,
  ...HARD_PROBLEMS_2,
];

// ─── Category helpers (derived from problem definitions) ─────────────────────

const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  array: "Array",
  string: "String",
  "dynamic-programming": "Dynamic Programming",
  stack: "Stack",
  "two-pointers": "Two Pointers",
  "sliding-window": "Sliding Window",
  sorting: "Sorting",
  "hash-map": "Hash Map",
  "binary-search": "Binary Search",
  greedy: "Greedy",
  math: "Math",
};

export function getCategoryForSlug(slug: string): ProblemCategory | null {
  const problem = PRACTICE_PROBLEMS.find((p) => p.slug === slug);
  return problem?.category ?? null;
}

export function getCategoryLabel(cat: ProblemCategory): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

/** Returns only categories that have at least one problem. */
export function getPracticeCategories(): ProblemCategory[] {
  const set = new Set<ProblemCategory>();
  for (const p of PRACTICE_PROBLEMS) {
    if (p.category) set.add(p.category);
  }
  return Array.from(set).sort((a, b) =>
    (CATEGORY_LABELS[a] ?? a).localeCompare(CATEGORY_LABELS[b] ?? b)
  );
}

// getCategoryCounts and getDifficultyCounts were removed — unused.

// ─── Sorting ─────────────────────────────────────────────────────────────────

export function sortProblemsByCategoryAndDifficulty<T extends { slug: string; difficulty: Difficulty }>(
  problems: T[],
  categoryOrder: ProblemCategory[]
): T[] {
  const diffOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
  return [...problems].sort((a, b) => {
    const ca = getCategoryForSlug(a.slug) ?? ("array" as ProblemCategory);
    const cb = getCategoryForSlug(b.slug) ?? ("array" as ProblemCategory);
    const ia = categoryOrder.indexOf(ca);
    const ib = categoryOrder.indexOf(cb);
    if (ia !== ib) return ia - ib;
    return (diffOrder[a.difficulty] ?? 0) - (diffOrder[b.difficulty] ?? 0);
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getPracticeProblemBySlug(slug: string): PracticeProblem | null {
  return PRACTICE_PROBLEMS.find((p) => p.slug === slug) ?? null;
}

export function getAllPracticeProblems(): PracticeProblem[] {
  return [...PRACTICE_PROBLEMS];
}

export function getStarterForLanguage(
  problem: PracticeProblem,
  lang: SupportedLanguage
): string {
  const code = problem.starter[lang];
  if (code) return code;
  switch (lang) {
    case "go":         return DEFAULT_GO;
    case "python":     return DEFAULT_PYTHON;
    case "cpp":        return DEFAULT_CPP;
    case "javascript": return DEFAULT_JS;
    case "java":       return DEFAULT_JAVA;
    case "rust":       return DEFAULT_RUST;
    default:           return DEFAULT_GO;
  }
}
