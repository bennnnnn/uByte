import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Create an Array",
    instruction:
      "JavaScript arrays hold ordered values. Create an array `nums` with `[10, 20, 30]` and print it.",
    starter: `// TODO: const nums = [10, 20, 30]; console.log(nums)
`,
    expectedOutput: ["[ 10, 20, 30 ]"],
    hint: "const nums = [10, 20, 30];\nconsole.log(nums);",
  },
  {
    title: "Access and Update",
    instruction:
      "Arrays are zero-indexed. Change `scores[1]` from 85 to 90, then print the array.",
    starter: `const scores = [75, 85, 95];
// TODO: update scores[1] to 90, then console.log(scores)
`,
    expectedOutput: ["[ 75, 90, 95 ]"],
    hint: "scores[1] = 90;\nconsole.log(scores);",
  },
  {
    title: "push and pop",
    instruction:
      "`push` adds to the end; `pop` removes from the end. Start with `[1, 2, 3]`, push 4, then pop. Print the final array.",
    starter: `const items = [1, 2, 3];
// TODO: push 4, pop, console.log(items)
`,
    expectedOutput: ["[ 1, 2, 3 ]"],
    hint: "items.push(4);\nitems.pop();\nconsole.log(items);",
  },
  {
    title: "slice",
    instruction:
      "`arr.slice(start, end)` returns a new sub-array. Slice `letters` to get `[\"b\", \"c\", \"d\"]` and print it.",
    starter: `const letters = ["a", "b", "c", "d", "e"];
// TODO: slice to get ["b","c","d"] and print
`,
    expectedOutput: ["[ 'b', 'c', 'd' ]"],
    hint: "console.log(letters.slice(1, 4));",
  },
  {
    title: "map and filter",
    instruction:
      "`map` transforms each element; `filter` keeps only matching elements. From `[1,2,3,4,5]`, filter even numbers and then map them to their squares. Print the result.",
    starter: `const nums = [1, 2, 3, 4, 5];
// TODO: filter evens, map to squares, console.log
`,
    expectedOutput: ["[ 4, 16 ]"],
    hint: "console.log(nums.filter(n => n%2===0).map(n => n**2));",
  },
];
