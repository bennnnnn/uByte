import type { TutorialStep } from "../types";

/**
 * Final Capstone: Mini Library CLI App
 *
 * THE STORY: After 20 lessons, you've learned everything you need.
 * Now build a complete mini CLI app for the library — tracking
 * borrowed books and their due dates.
 *
 * This is intentionally shorter — both steps use `carryForward`
 * so you build the program incrementally.
 */
export const steps: TutorialStep[] = [
  {
    title: "Set up the library state",
    instruction:
      "You've learned Go from day 1 — now let's put it all together into a real CLI app. Start by declaring two variables in `main`: `borrowed := 3` (books currently borrowed out) and `daysOverdue := 2`. Print both so the output shows them on separate lines.",
    successMessage:
      "The library state is set up. Click **Next step**: your code stays in the editor so you can build on it.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: borrowed := 3 and daysOverdue := 2
\t// TODO: print both, each on its own line
}`,
    expectedOutput: ["3", "2"],
    hint: "borrowed := 3 — daysOverdue := 2 — fmt.Println(borrowed) — fmt.Println(daysOverdue)",
    codeChecks: [
      { pattern: "\\b3\\b", message: "Set `borrowed` to the value 3." },
      { pattern: "\\b2\\b", message: "Set `daysOverdue` to the value 2." },
    ],
  },
  {
    title: "Check and display status",
    carryForward: true,
    instruction:
      "Keep your existing library state. Now add logic to check if there are overdue books: if `daysOverdue > 0`, print a warning with the number of overdue days. Then print the total borrowed count. Your output should show the original values plus the warning.",
    successMessage:
      "That's it! You've built a real CLI app that tracks library state from scratch. Every previous lesson built toward this moment.",
    starter: `package main

import "fmt"

func main() {
\tborrowed := 3
\tdaysOverdue := 2
\tfmt.Println(borrowed)
\tfmt.Println(daysOverdue)
}`,
    expectedOutput: ["3", "2", "overdue"],
    hint: 'Add: if daysOverdue > 0 { fmt.Println("Overdue by", daysOverdue, "days!") }',
    codeChecks: [
      {
        pattern: "if\\s+",
        message: "Use an if statement to check if daysOverdue > 0.",
      },
    ],
  },
];
