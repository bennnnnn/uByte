import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Simple Function — I Greet You",
    instruction:
      "Functions let you write logic once and reuse it. Define `greet(name string) string` that returns `\"Hello, \" + name`. Call it with `\"Ada\"` and print the result.",
    starter: `package main

import "fmt"

// TODO: define greet(name string) string

func main() {
\t// TODO: call greet("Ada") and print the result
}`,
    expectedOutput: ["Hello, Ada"],
    hint: 'func greet(name string) string { return "Hello, " + name }',
  },
  {
    title: "Multiple Return Values — Book and Status",
    instruction:
      "Go functions can return multiple values. Define `findBook(books []string, target string) (string, bool)` — return the book title and `true` if found, or `\"\"` and `false` if not. Search for `\"Dune\"` and print both results.",
    starter: `package main

import "fmt"

// TODO: define findBook(books []string, target string) (string, bool)

func main() {
\tbooks := []string{"Dune", "Neuromancer", "Snow Crash"}
\tbook, found := findBook(books, "Dune")
\tfmt.Println(book, found)
}`,
    expectedOutput: ["Dune", "true"],
    hint: "func findBook(books []string, target string) (string, bool) { for _, b := range books { if b == target { return b, true } }; return \"\", false }",
  },
  {
    title: "Variadic Function — Any Number of Genres",
    instruction:
      "A variadic function accepts any number of arguments using `...type`. Define `listGenres(genres ...string) string` that joins all genres with `\", \"` and returns the result. Call it with `\"Fiction\"`, `\"Sci-Fi\"`, `\"Fantasy\"` and print.",
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
    title: "Named Return Values — First and Last",
    instruction:
      "You can name return values in the signature and use a bare `return`. Define `shelfRange(books []string) (first, last string)` that returns the first and last book. Call it with your books and print both.",
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
    title: "Functions as Values — A Helper's Helper",
    instruction:
      "Functions are values — you can pass them as arguments. Define `formatBook(f func(string) string, title string) string` that calls `f(title)` and returns the result. Call it with a wrap-in-stars function and `\"Dune\"`, then print.",
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
    title: "Closures — I Remember Things",
    instruction:
      "A closure captures variables from its surrounding scope. Define `bookCounter() func() string` that returns a closure. Each call returns `\"Book N\"` where N increments. Call it three times and print each result.",
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
