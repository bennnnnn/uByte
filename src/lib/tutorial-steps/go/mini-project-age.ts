import type { TutorialStep } from "../types";

/**
 * Final Capstone: Mini Library CLI App
 *
 * After 20 lessons, put it all together into a real CLI app.
 * Both steps use `carryForward` so you build incrementally.
 */
export const steps: TutorialStep[] = [
  {
    title: "Set up the library state",
    instruction:
      "This is it — the final stretch. Create two variables: `borrowed := 3` (books currently borrowed out) and `daysOverdue := 2`. Print them both, each on its own line. This is where your real CLI app starts.",
    successMessage:
      "The library state is set up. Click **Next step** — I'll keep your code right here so we can build on it.",
    starter: `package main

import "fmt"

func main() {
\t// I need to know the library's current state.
\t// Tell me: how many books are borrowed? How many days overdue?
\t// Create both variables, then print them each on their own line.
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
      "Now add an `if` statement: if `daysOverdue > 0`, print a warning like `\"Overdue by 2 days!\"`. The output should show the original numbers plus the warning.",
    successMessage:
      "That's it! You built a real CLI app from scratch. Declaring variables, checking conditions, printing output — you're writing real Go programs now.",
    starter: `package main

import "fmt"

func main() {
\tborrowed := 3
\tdaysOverdue := 2
\tfmt.Println(borrowed)
\tfmt.Println(daysOverdue)
\t// TODO: if daysOverdue > 0, print a warning like "Overdue by 2 days!"
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
