import type { TutorialStep } from "../types";

/** TS fallback for the "arrays" tutorial — used when content/go/arrays.steps.json is inaccessible. */
export const steps: TutorialStep[] = [
  {
    title: "Declare a Shelf Array",
    instruction:
      "Declare an array of 3 strings named `shelf` to represent library shelf labels, then print the whole array. It should print the zero values (empty strings).",
    starter: `package main

import "fmt"

func main() {
\t// TODO: declare shelf as an array of 3 strings
\t// TODO: print shelf
}`,
    expectedOutput: ["[  ]"],
    hint: "Use `var shelf [3]string` and then `fmt.Println(shelf)`.",
  },
  {
    title: "Assign Books by Index",
    instruction:
      'Create an array of 3 strings named `books`. Set index 0 to `"Moby Dick"`, index 1 to `"1984"`, and index 2 to `"Pride"`. Print the whole array.',
    starter: `package main

import "fmt"

func main() {
\tvar books [3]string
\t// TODO: assign books by index
\tfmt.Println(books)
}`,
    expectedOutput: ["[Moby Dick 1984 Pride]"],
    hint: "Declare `var books [3]string`, then assign `books[0]`, `books[1]`, and `books[2]`.",
  },
  {
    title: "First and Last Book",
    instruction:
      "Create `shelf := [4]string{\"Dune\", \"Ender\", \"Hobbit\", \"Neuromancer\"}`. Print the first book, then print the last book.",
    starter: `package main

import "fmt"

func main() {
\tshelf := [4]string{"Dune", "Ender", "Hobbit", "Neuromancer"}
\t// TODO: print the first book
\t// TODO: print the last book
}`,
    expectedOutput: ["Dune", "Neuromancer"],
    hint: "The first value is `shelf[0]`. The last value is `shelf[len(shelf)-1]`.",
  },
  {
    title: "Loop Through Book Shelves",
    instruction:
      "Loop through `[3]string{\"Fiction\", \"NonFiction\", \"Reference\"}` and print each shelf section on its own line.",
    starter: `package main

import "fmt"

func main() {
\tsections := [3]string{"Fiction", "NonFiction", "Reference"}
\t// TODO: loop through sections and print each value
}`,
    expectedOutput: ["Fiction", "NonFiction", "Reference"],
    hint: "Use `for i := 0; i < len(sections); i++ { fmt.Println(sections[i]) }`.",
  },
  {
    title: "Sum Book Pages",
    instruction:
      "Sum the page counts in `[5]int{120, 340, 280, 150, 410}` and print the total pages.",
    starter: `package main

import "fmt"

func main() {
\tpages := [5]int{120, 340, 280, 150, 410}
\ttotal := 0
\t// TODO: add each page count to total
\tfmt.Println(total)
}`,
    expectedOutput: ["1300"],
    hint: "Start with `total := 0`, then add each element inside a loop.",
  },
];
