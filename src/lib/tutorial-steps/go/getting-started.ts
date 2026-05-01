import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Hello, Library!",
    instruction:
      "The front door: `func main()`. Every Go program has one — it's where Go walks in and starts running.\n\nThis program already works. Click **Run** to see it in action.",
    starter: `package main

import "fmt"

func main() {
\tfmt.Println("Hello, Library!")
}`,
    expectedOutput: ["Hello, Library!"],
    hint: "The program is already complete — just click Run to see it work.",
  },
  {
    title: "Announce Your Library",
    instruction:
      "Now change what I say. The text inside the quotes after `fmt.Println()` is what I shout to the screen. Replace `\"Hello, Library!\"` with `\"Welcome to my library!\"`, then add a second `fmt.Println()` below it that prints the hours: `\"Open daily from 9 AM to 8 PM\"`.",
    starter: `package main

import "fmt"

func main() {
\t// Change what I say — put your library name here
\tfmt.Println("Hello, Library!")
\t// TODO: add a second line showing the library hours
}`,
    expectedOutput: ["Welcome to my library!", "9 AM"],
    hint: 'Change the first line to fmt.Println("Welcome to my library!") and add: fmt.Println("Open daily from 9 AM to 8 PM")',
  },
  {
    title: "Print the Book Count",
    instruction:
      "The library has 1200 books. Use `:=` to create a variable named `books` with the value `1200`, then print a sentence like `\"We have 1200 books!\"` using that variable.",
    starter: `package main

import "fmt"

func main() {
\t// Store the number 1200 in a variable called "books"
\t// Then tell me to print a sentence that includes the count.
\t// TODO: create a variable books := 1200
\t// TODO: print "We have 1200 books!"
}`,
    expectedOutput: ["1200"],
    hint: 'books := 1200 — then fmt.Println("We have", books, "books!")',
  },
  {
    title: "Meet the Librarian",
    instruction:
      "Create two variables: `name := \"Alice\"` (the librarian) and `books := 5000` (the total collection). Print them on separate lines — first her name, then the book count.",
    starter: `package main

import "fmt"

func main() {
\t// Create a variable holding the librarian's name (a string)
\t// Create another holding the book count (a number)
\t// Then print them each on their own line.
\t// TODO: create name := "Alice" and books := 5000
\t// TODO: print name on one line, books on the next
}`,
    expectedOutput: ["Alice", "5000"],
    hint: 'name := "Alice" — books := 5000 — fmt.Println(name) — fmt.Println(books)',
  },
  {
    title: "Add a Comment About Tomorrow",
    instruction:
      "Lines that start with `//` are comments — I skip them completely. They're notes for humans. Add a `//` comment on its own line above the `fmt.Println()` call. Write something like `// This line prints the time`. Then change the message to print `\"Tomorrow at 9 AM\"`.",
    starter: `package main

import "fmt"

func main() {
\t// I skip lines that start with // — they're just notes for humans.
\t// Add a comment above the Println describing what it does.
\t// TODO: add a comment describing the next line
\t// TODO: change this to print "Tomorrow at 9 AM"
\tfmt.Println("PLACEHOLDER")
}`,
    expectedOutput: ["Tomorrow at 9 AM"],
    hint: "// This line prints the time — or any // comment before the Println call.",
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
