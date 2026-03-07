import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Create a List",
    instruction:
      "Python lists hold ordered collections of items. Create a list `nums` with the values 10, 20, 30, then print the list.",
    starter: `# TODO: create a list with 10, 20, 30 and print it
`,
    expectedOutput: ["[10, 20, 30]"],
    hint: "nums = [10, 20, 30]\nprint(nums)",
  },
  {
    title: "Access and Modify",
    instruction:
      "List elements are accessed by index (starting at 0). You can also update any element. Change the second item in `scores` from 85 to 90, then print `scores`.",
    starter: `scores = [75, 85, 95]
# TODO: change scores[1] to 90, then print scores
`,
    expectedOutput: ["[75, 90, 95]"],
    hint: "scores[1] = 90\nprint(scores)",
  },
  {
    title: "append and pop",
    instruction:
      "`append()` adds to the end; `pop()` removes from the end. Start with `[1, 2, 3]`. Append 4, then pop the last item and print the final list.",
    starter: `items = [1, 2, 3]
# TODO: append 4, then pop, then print
`,
    expectedOutput: ["[1, 2, 3]"],
    hint: "items.append(4)\nitems.pop()\nprint(items)",
  },
  {
    title: "Slicing",
    instruction:
      "A slice `list[start:stop]` gives you a sub-list from index `start` up to (not including) `stop`. Slice `letters` to get just `[\"b\", \"c\", \"d\"]` and print it.",
    starter: `letters = ["a", "b", "c", "d", "e"]
# TODO: slice to get ["b", "c", "d"] and print
`,
    expectedOutput: ["['b', 'c', 'd']"],
    hint: "print(letters[1:4])",
  },
  {
    title: "List Comprehension",
    instruction:
      "List comprehensions are a concise way to build lists. Create a list of the squares of numbers 1–5 using a list comprehension and print it.",
    starter: `# TODO: squares = [x**2 for x in range(1, 6)]
squares = []
print(squares)`,
    expectedOutput: ["[1, 4, 9, 16, 25]"],
    hint: "squares = [x**2 for x in range(1, 6)]",
  },
];
