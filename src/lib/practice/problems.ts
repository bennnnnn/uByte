import type { PracticeProblem } from "./types";
import type { SupportedLanguage } from "@/lib/languages/types";

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

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" },
    ],
    starter: {
      go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
\t// TODO: return indices of two numbers that add up to target
\treturn nil
}

func main() {
\tnums := []int{2, 7, 11, 15}
\ttarget := 9
\tresult := twoSum(nums, target)
\tfmt.Println(result) // expect [0 1]
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # TODO: return indices of two numbers that add up to target
    return []

if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    print(two_sum(nums, target))  # expect [0, 1]
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // TODO: return indices of two numbers that add up to target
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    for (int i : result) cout << i << " ";
    return 0;
}`,
    },
  },
  {
    slug: "three-sum",
    title: "Three Sum",
    description: "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. The solution set must not contain duplicate triplets.",
    difficulty: "medium",
    examples: [
      { input: "nums = [-1, 0, 1, 2, -1, -4]", output: "[[-1, -1, 2], [-1, 0, 1]]" },
      { input: "nums = [0, 1, 1]", output: "[]" },
    ],
    starter: {
      go: DEFAULT_GO,
      python: DEFAULT_PYTHON,
      cpp: DEFAULT_CPP,
    },
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    description: "Given a string `s` containing just the characters `'(', ')', '{', '}', '[' and ']'`, determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
    difficulty: "easy",
    examples: [
      { input: "s = \"()\"", output: "true" },
      { input: "s = \"()[]{}\"", output: "true" },
      { input: "s = \"(]\"", output: "false" },
    ],
    starter: {
      go: DEFAULT_GO,
      python: DEFAULT_PYTHON,
      cpp: DEFAULT_CPP,
    },
  },
];

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
    case "go":
      return DEFAULT_GO;
    case "python":
      return DEFAULT_PYTHON;
    case "cpp":
      return DEFAULT_CPP;
    default:
      return DEFAULT_GO;
  }
}
