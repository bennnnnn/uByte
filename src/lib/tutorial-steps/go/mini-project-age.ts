import type { TutorialStep } from "../types";

/**
 * Fallback when content/go/mini-project-age.steps.json is absent.
 * Keep in sync with that file: two-step age mini-project with carryForward.
 */
export const steps: TutorialStep[] = [
  {
    title: "Set an age",
    instruction:
      "Create a variable `age` with `:=` and pick any whole number (for example `28`). Print **one** line that includes that number and the word `years` so it reads like a real sentence.",
    hint: 'age := 28 — then fmt.Println("I am", age, "years old") or similar.',
    starter: `package main

import "fmt"

func main() {
\t// age will hold how many years old someone is (you choose the number).
\t// TODO: use := to create age with a number you like
\t// TODO: fmt.Println a single sentence that includes age and "years"
}`,
    expectedOutput: [],
    successMessage:
      "You stored a number in \`age\` and showed it in a sentence — same idea as every profile or score in an app.",
    carryForward: true,
    codeChecks: [
      { pattern: "age\\s*:=\\s*\\d+", message: "Create age with := and a number, e.g. age := 28" },
      { pattern: "Println\\(", message: "Print a line with fmt.Println" },
      { pattern: "years", flags: "i", message: 'Include the word "years" in your output string(s).' },
      { pattern: "TODO", required: false, message: "Replace the TODO lines with real code." },
    ],
  },
  {
    title: "Jump ten years ahead",
    instruction:
      "Keep your `age` value as-is. Add a **new** variable `futureAge` with `:=` set to `age + 10`. Print `age` on one line and `futureAge` on the next (or two clear lines so both numbers appear).",
    hint: "futureAge := age + 10 — then two Println calls.",
    starter: `package main

import "fmt"

func main() {
\tage := 28 // your age from the last step (change the number if you like)
\tfmt.Println("Current age:", age)

\t// futureAge will be age plus 10 — a second variable so both values stay visible.
\t// TODO: futureAge := age + 10
\t// TODO: print futureAge on its own line
}`,
    expectedOutput: [],
    successMessage:
      "Same program, more story: you reused `age` and expressed a new value without throwing away the old one. That is how small programs grow.",
    codeChecks: [
      { pattern: "futureAge\\s*:=\\s*age\\s*\\+\\s*10", message: "Add futureAge := age + 10" },
      { pattern: "Println\\(.*\\bage\\s*\\)", message: "Print the current age" },
      { pattern: "Println\\(.*futureAge", message: "Print futureAge on another line" },
      { pattern: "TODO", required: false, message: "Replace the TODO lines with real code." },
    ],
  },
];
