import type { PracticeProblem, ProblemCategory } from "./types";
import type { SupportedLanguage } from "@/lib/languages/types";
import { EASY_PROBLEMS } from "./problems-easy";
import { MEDIUM_PROBLEMS } from "./problems-medium";
import { HARD_PROBLEMS } from "./problems-hard";

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
  ...MEDIUM_PROBLEMS,
  ...HARD_PROBLEMS,
];

// ─── Category mapping (slug → category for grouping/filtering) ───────────────

const SLUG_CATEGORY: Record<string, ProblemCategory> = {
  "two-sum": "array",
  "valid-parentheses": "stack",
  "contains-duplicate": "array",
  "best-time-to-buy-sell-stock": "array",
  "reverse-string": "string",
  "climbing-stairs": "dynamic-programming",
  "three-sum": "array",
  "maximum-subarray": "array",
  "longest-substring-without-repeating": "string",
  "merge-intervals": "sorting",
  "trapping-rain-water": "array",
};

const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  array: "Array",
  string: "String",
  "dynamic-programming": "Dynamic Programming",
  stack: "Stack",
  "two-pointers": "Two Pointers",
  "sliding-window": "Sliding Window",
  sorting: "Sorting",
  "hash-map": "Hash Map",
};

export function getCategoryForSlug(slug: string): ProblemCategory | null {
  return SLUG_CATEGORY[slug] ?? null;
}

export function getCategoryLabel(cat: ProblemCategory): string {
  return CATEGORY_LABELS[cat];
}

export function getPracticeCategories(): ProblemCategory[] {
  const set = new Set<ProblemCategory>();
  for (const slug of Object.keys(SLUG_CATEGORY)) {
    const c = SLUG_CATEGORY[slug];
    if (c) set.add(c);
  }
  return Array.from(set).sort((a, b) => CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b]));
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
