import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Count Books — Simple Function",
    instruction:
      "Define a function `countBooks(books []string) int` that returns `len(books)`. Then call it with `[\"Dune\", \"Neuromancer\", \"Snow Crash\"]` and print the result.",
    starter: `package main

import "fmt"

// TODO: define countBooks(books []string) int

func main() {
\tbooks := []string{"Dune", "Neuromancer", "Snow Crash"}
\t// TODO: call countBooks(books) and print the result
}`,
    expectedOutput: ["3"],
    hint: "func countBooks(books []string) int { return len(books) }",
  },
  {
    title: "Find Book — Multiple Return Values",
    instruction:
      "Define `findBook(books []string, target string) (int, bool)` that returns the index of the target and `true` if found, or `-1` and `false` if not. Call it with `books` looking for \"Dune\" and print both results.",
    starter: `package main

import "fmt"

// TODO: define findBook(books []string, target string) (int, bool)

func main() {
\tbooks := []string{"Dune", "Neuromancer", "Snow Crash"}
\tidx, found := findBook(books, "Dune")
\tfmt.Println(idx, found)
}`,
    expectedOutput: ["0", "true"],
    hint: "func findBook(books []string, target string) (int, bool) { for i, b := range books { if b == target { return i, true } }; return -1, false }",
  },
  {
    title: "List Genres — Variadic Function",
    instruction:
      "Define `listGenres(genres ...string) string` that joins all genre names into a single comma-separated string. Call it with \"Fiction\", \"Sci-Fi\", \"Fantasy\" and print the result.",
    starter: `package main

import "fmt"

// TODO: define listGenres(genres ...string) string

func main() {
\tfmt.Println(listGenres("Fiction", "Sci-Fi", "Fantasy"))
}`,
    expectedOutput: ["Fiction, Sci-Fi, Fantasy"],
    hint: "func listGenres(genres ...string) string { result := \"\"; for i, g := range genres { if i > 0 { result += \", \" }; result += g }; return result }",
  },
  {
    title: "Shelf Range — Named Return Values",
    instruction:
      "Define `shelfRange(books []string) (first, last string)` that returns the first and last book using named return values and a bare `return`. Call it with `[\"Dune\", \"Neuromancer\", \"Snow Crash\"]` and print both.",
    starter: `package main

import "fmt"

// TODO: define shelfRange(books []string) (first, last string)

func main() {
\tfirst, last := shelfRange([]string{"Dune", "Neuromancer", "Snow Crash"})
\tfmt.Println(first, last)
}`,
    expectedOutput: ["Dune", "Snow Crash"],
    hint: "func shelfRange(books []string) (first, last string) { first, last = books[0], books[len(books)-1]; return }",
  },
  {
    title: "Format Book — Functions as Values",
    instruction:
      "Define `formatBook(f func(string) string, title string) string` that calls `f(title)` and returns the result. Call it with a function that wraps the title in stars and `\"Dune\"`, then print the result.",
    starter: `package main

import "fmt"

// TODO: define formatBook(f func(string) string, title string) string

func main() {
\tstarWrap := func(title string) string { return "*** " + title + " ***" }
\tfmt.Println(formatBook(starWrap, "Dune"))
}`,
    expectedOutput: ["*** Dune ***"],
    hint: "func formatBook(f func(string) string, title string) string { return f(title) }",
  },
  {
    title: "Book Counter — Closures",
    instruction:
      "Define `bookCounter() func() string` that returns a closure. Each call returns `\"Book N\"` where N increments starting from 1. Call it three times and print each result.",
    starter: `package main

import "fmt"

// TODO: define bookCounter() func() string

func main() {
\tnextBook := bookCounter()
\tfmt.Println(nextBook())
\tfmt.Println(nextBook())
\tfmt.Println(nextBook())
}`,
    expectedOutput: ["Book 1", "Book 2", "Book 3"],
    hint: "func bookCounter() func() string { n := 0; return func() string { n++; return fmt.Sprintf(\"Book %d\", n) } }",
  },
];
