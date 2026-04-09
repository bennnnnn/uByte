import type { TutorialStep } from "../types";

/**
 * Example cumulative lesson: each step builds on the learner’s code.
 * Step 1 uses `carryForward` so "Next step" keeps their editor contents.
 */
export const steps: TutorialStep[] = [
  {
    title: "Set age to 80",
    instruction:
      "In `main`, declare an integer variable `age` with value `80` using `:=`. Print `age` so the output shows `80`.",
    successMessage:
      "Great — you have `age` in place.\nClick **Next step**: your code stays in the editor so you can build on it.",
    starter: `package main

import "fmt"

func main() {
	// TODO: age := 80 and print age
}`,
    expectedOutput: ["80"],
    hint: "Use `age := 80` then `fmt.Println(age)`.",
    codeChecks: [
      { pattern: "\\b80\\b", message: "Use the literal value 80 for `age`." },
    ],
  },
  {
    title: "Add 10 years",
    carryForward: true,
    instruction:
      "Keep your existing code. Add 10 to `age` (for example `age = age + 10` or `age += 10`). Print `age` again. Your output should show both `80` and `90` from the two lines you print.",
    successMessage:
      "That is how small steps stack into a real program — same file, new goal each time.",
    starter: `package main

import "fmt"

func main() {
	age := 80
	fmt.Println(age)
}`,
    expectedOutput: ["80", "90"],
    hint: "After the first `fmt.Println(age)`, update `age`, then call `fmt.Println(age)` again.",
    codeChecks: [
      {
        pattern: "\\+=|age\\s*=\\s*age\\s*\\+\\s*10|age\\s*=\\s*10\\s*\\+\\s*age",
        message: "Add 10 to `age` with `age = age + 10` or `age += 10`.",
      },
    ],
  },
];
