import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "for Loop with range",
    instruction:
      "`range(n)` generates numbers from 0 up to (but not including) n. Use a `for` loop with `range(5)` to print the numbers 0 through 4, each on its own line.",
    starter: `# TODO: loop with range(5) and print each number
`,
    expectedOutput: ["0", "1", "2", "3", "4"],
    hint: "for i in range(5):\n    print(i)",
  },
  {
    title: "Iterating a List",
    instruction:
      "You can loop directly over any list. Loop over `fruits = [\"apple\", \"banana\", \"cherry\"]` and print each fruit.",
    starter: `fruits = ["apple", "banana", "cherry"]
# TODO: print each fruit
`,
    expectedOutput: ["apple", "banana", "cherry"],
    hint: "for fruit in fruits:\n    print(fruit)",
  },
  {
    title: "while Loop",
    instruction:
      "A `while` loop keeps running as long as a condition is true. Start with `count = 1`. Print count and increment it until count exceeds 3. Output should be 1, 2, 3.",
    starter: `count = 1
# TODO: while count <= 3, print count and increment it
`,
    expectedOutput: ["1", "2", "3"],
    hint: "while count <= 3:\n    print(count)\n    count += 1",
  },
  {
    title: "break and continue",
    instruction:
      "`break` exits a loop early; `continue` skips the rest of the current iteration. Loop through numbers 1–10 with `range(1, 11)`. Skip even numbers with `continue`, and stop when you reach 7 with `break`. You should print 1, 3, 5.",
    starter: `for i in range(1, 11):
    # TODO: skip even numbers, break at 7
    print(i)`,
    expectedOutput: ["1", "3", "5"],
    hint: "if i % 2 == 0: continue\nif i == 7: break\nprint(i)",
  },
  {
    title: "enumerate",
    instruction:
      "`enumerate()` gives you both the index and the value as you loop. Loop over `[\"a\", \"b\", \"c\"]` with `enumerate` and print each as `\"0: a\"`, `\"1: b\"`, `\"2: c\"`.",
    starter: `letters = ["a", "b", "c"]
# TODO: use enumerate to print index and letter
`,
    expectedOutput: ["0: a", "1: b", "2: c"],
    hint: "for i, letter in enumerate(letters):\n    print(f\"{i}: {letter}\")",
  },
];
