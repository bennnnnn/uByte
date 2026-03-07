import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "for Loop",
    instruction:
      "A classic `for` loop has init, condition, and increment. Print numbers 0 through 4, each on its own line.",
    starter: `// TODO: for loop printing 0 to 4
`,
    expectedOutput: ["0", "1", "2", "3", "4"],
    hint: "for (let i = 0; i < 5; i++) { console.log(i); }",
  },
  {
    title: "for...of",
    instruction:
      "`for...of` iterates the values of an iterable. Loop over `[\"apple\", \"banana\", \"cherry\"]` and print each fruit.",
    starter: `const fruits = ["apple", "banana", "cherry"];
// TODO: for...of loop printing each fruit
`,
    expectedOutput: ["apple", "banana", "cherry"],
    hint: "for (const fruit of fruits) { console.log(fruit); }",
  },
  {
    title: "while Loop",
    instruction:
      "A `while` loop keeps running while a condition is true. Start `count = 1` and print it while `count <= 3`, incrementing each time.",
    starter: `let count = 1;
// TODO: while count <= 3, print and increment
`,
    expectedOutput: ["1", "2", "3"],
    hint: "while (count <= 3) { console.log(count); count++; }",
  },
  {
    title: "forEach",
    instruction:
      "Array's `.forEach(callback)` calls the callback for each element. Print each number in `[10, 20, 30]` using `forEach`.",
    starter: `const nums = [10, 20, 30];
// TODO: nums.forEach(...)
`,
    expectedOutput: ["10", "20", "30"],
    hint: "nums.forEach(n => console.log(n));",
  },
  {
    title: "break and continue",
    instruction:
      "`break` exits a loop early; `continue` skips an iteration. Loop from 1 to 10. Skip evens with `continue`, break when you reach 7. You should print 1, 3, 5.",
    starter: `for (let i = 1; i <= 10; i++) {
  // TODO: skip evens, break at 7
  console.log(i);
}`,
    expectedOutput: ["1", "3", "5"],
    hint: "if (i % 2 === 0) continue;\nif (i === 7) break;\nconsole.log(i);",
  },
];
