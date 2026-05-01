import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Return an Error from findBook",
    instruction:
      "When something goes wrong, errors tell you what happened instead of crashing. Define `findBook(books []string, name string) (string, error)`. Loop through books — if found, return it and `nil`. If not, return `\"\"` and `fmt.Errorf(\"book '%s' not found\", name)`. Call it with a book that doesn't exist and print the error.",
    starter: `package main

import (
\t"fmt"
)

// TODO: define findBook(books []string, name string) (string, error)

func main() {
\tbooks := []string{"1984", "Brave New World", "Fahrenheit 451"}
\t_, err := findBook(books, "Moby Dick")
\tfmt.Println(err)
}`,
    expectedOutput: ["not found"],
    hint: 'func findBook(books []string, name string) (string, error) { for _, b := range books { if b == name { return b, nil } }; return "", fmt.Errorf("book \"%s\" not found", name) }',
  },
  {
    title: "Check the Error Pattern",
    instruction:
      "The `if err != nil` pattern is how you handle errors in Go. Call `findBook` with a missing book and an existing one. For the error case print it. For the success case print `\"found:\"` and the title.",
    starter: `package main

import "fmt"

func findBook(books []string, name string) (string, error) {
\tfor _, b := range books {
\t\tif b == name {
\t\t\treturn b, nil
\t\t}
\t}
\treturn "", fmt.Errorf("book \"%s\" not found", name)
}

func main() {
\tbooks := []string{"1984", "Brave New World", "Fahrenheit 451"}
\t// TODO: call findBook with "Moby Dick", check err, print error message
\t// TODO: call findBook with "1984", check err, print "found:" and result
}`,
    expectedOutput: ["not found", "found: 1984"],
    hint: 'if err != nil { fmt.Println(err) } — fmt.Println("found:", result)',
  },
  {
    title: "Custom Error: InvalidISBN",
    instruction:
      "Custom error types can carry extra information. Define an `InvalidISBN` struct with `ISBN string`, implement `Error() string` to return `\"invalid ISBN: \" + e.ISBN`. Then write `checkISBN(isbn string) error` that returns the custom error for empty or short ISBNs, and `nil` otherwise. Print the error.",
    starter: `package main

import "fmt"

// TODO: define InvalidISBN struct with ISBN string
// TODO: implement Error() string method

func checkISBN(isbn string) error {
\tif len(isbn) < 10 {
\t\treturn InvalidISBN{ISBN: isbn}
\t}
\treturn nil
}

func main() {
\terr := checkISBN("short")
\tfmt.Println(err)
}`,
    expectedOutput: ["invalid ISBN: short"],
    hint: "type InvalidISBN struct { ISBN string }; func (e InvalidISBN) Error() string { return \"invalid ISBN: \" + e.ISBN }",
  },
  {
    title: "Wrap Errors with %w",
    instruction:
      "`fmt.Errorf` with `%w` wraps an existing error so callers can unwrap it with `errors.Is`. Create a base `ErrBookMissing` error, then wrap it with `fmt.Errorf(\"shelf %d: %w\", shelfID, err)` and print the wrapped message.",
    starter: `package main

import (
\t"errors"
\t"fmt"
)

var ErrBookMissing = errors.New("book not in catalog")

func main() {
\tshelfID := 3
\t// TODO: wrap ErrBookMissing with fmt.Errorf("shelf %d: %w", shelfID, ErrBookMissing) and print it
\t_ = shelfID
}`,
    expectedOutput: ["shelf 3: book not in catalog"],
    hint: 'wrapped := fmt.Errorf("shelf %d: %w", shelfID, ErrBookMissing) — fmt.Println(wrapped)',
  },
  {
    title: "errors.Is for Book Lookup",
    instruction:
      "`errors.Is` checks if any error in a chain matches a target. Create a sentinel `ErrBookNotFound`, wrap it with `fmt.Errorf(\"aisle 7, shelf 3: %w\", err)`, then use `errors.Is` to confirm the original error is present and print the result.",
    starter: `package main

import (
\t"errors"
\t"fmt"
)

var ErrBookNotFound = errors.New("book not found")

func main() {
\twrapped := fmt.Errorf("aisle 7, shelf 3: %w", ErrBookNotFound)
\t// TODO: use errors.Is to check if wrapped contains ErrBookNotFound and print true/false
\t_ = wrapped
}`,
    expectedOutput: ["true"],
    hint: "fmt.Println(errors.Is(wrapped, ErrBookNotFound))",
  },
];
