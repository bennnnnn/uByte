import type { TutorialStep } from "../types";

/**
 * Lesson 1: Getting Started
 * 
 * THE STORY: You just joined a small library. Your first task? Print the
 * library's welcome message. Every Go program needs "package main" and
 * "func main()" — that's the door you walk through to start writing code.
 */
export const steps: TutorialStep[] = [
  {
    title: "Hello, Library!",
    instruction:
      "Every Go program has `package main` (tells Go this is an executable) and `func main()` (where execution starts). `fmt.Println()` prints text. The starter code is already complete — just click **Run & check** to see your first program run.",
    starter: `package main

import "fmt"

func main() {
\tfmt.Println("Hello, Library!")
}`,
    expectedOutput: ["Hello, Library!"],
    hint: "The program is complete — just click the Run & check button.",
  },
  {
    title: "Announce Your Library",
    instruction:
      "Great, the program runs! Now make it yours. Change the welcome message to say `\"Welcome to my library!\"` instead. Print it on one line, then add a second `fmt.Println()` that prints `\"Open daily from 9 AM to 8 PM\"`.",
    starter: `package main

import "fmt"

func main() {
\tfmt.Println("Hello, Library!")
\t// TODO: add a second line showing the hours
}`,
    expectedOutput: ["Welcome to my library!", "9 AM"],
    hint: 'Change the first line to fmt.Println("Welcome to my library!") and add: fmt.Println("Open daily from 9 AM to 8 PM")',
  },
  {
    title: "Print the Book Count",
    instruction:
      "You can create variables with `:=` to store values. The library has 1200 books. Create a variable named `books` set to `1200`, then print a single line that says `\"We have 1200 books!\"`.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: create a variable books := 1200
\t// TODO: print "We have 1200 books!"
}`,
    expectedOutput: ["1200"],
    hint: `books := 1200 — then fmt.Println("We have", books, "books!")`,
  },
  {
    title: "Meet the Librarian",
    instruction:
      "Create two variables: `name := \"Alice\"` (the librarian's name) and `books := 5000` (the total collection). Print them on two lines: first the name, then the book count. The output should show Alice and 5000.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: create name := "Alice" and books := 5000
\t// TODO: print name on one line, books on the next
}`,
    expectedOutput: ["Alice", "5000"],
    hint: 'name := "Alice" — books := 5000 — fmt.Println(name) — fmt.Println(books)',
  },
  {
    title: "Add a Comment About Tomorrow",
    instruction:
      "Comments are notes for humans — Go ignores them. Before the `fmt.Println` line, add a single-line `//` comment that says what the line does (e.g. `// Print the librarian's name`). Then make sure the program still prints `\"Comments are useful\"`.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: add a comment describing the next line
\tfmt.Println("Comments are useful")
}`,
    expectedOutput: ["Comments are useful"],
    hint: "// This line prints a message — or any // comment before the Println call.",
    codeChecks: [
      {
        pattern: "^\\s*//(?!\\s*TODO)",
        flags: "m",
        required: true,
        message: "Add a // comment on its own line above the fmt.Println call.",
      },
    ],
  },
];
