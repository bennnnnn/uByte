import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Return an Error from findBook",
    instruction:
      "In Go, errors are values returned like any other. Define `findBook(books []string, name string) (string, error)`. Loop through `books` — if a match is found, return it and `nil`. If no match is found, return an empty string and `fmt.Errorf(\"book \\\"%s\\\" not found\", name)`.",
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
    hint: "func findBook(books []string, name string) (string, error) { for _, b := range books { if b == name { return b, nil } }; return \"\", fmt.Errorf(\"book \\\"%s\\\" not found\", name) }",
  },
  {
    title: "Check the Error Pattern",
    instruction:
      "The `if err != nil` pattern is the standard way to handle errors in Go. Call `findBook` with a missing book and an existing book. For the missing case print the error. For the success case print \"found:\" followed by the book title.",
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
    hint: "if err != nil { fmt.Println(err) } — fmt.Println(\"found:\", result)",
  },
  {
    title: "Custom Error: InvalidISBN",
    instruction:
      "A custom error type gives callers more information. Define an `InvalidISBN` struct with an `ISBN string` and implement the `Error() string` method returning `\"invalid ISBN: \" + e.ISBN`. Then write `checkISBN(isbn string) error` that returns `InvalidISBN{ISBN: isbn}` for empty or short ISBNs, and `nil` otherwise. Print the error.",
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
      "`fmt.Errorf` with `%w` wraps an existing error so callers can unwrap it. Create a base error for a missing book, then wrap it with additional context like `fmt.Errorf(\"shelf %d: %w\", shelfID, err)`. Print the wrapped error.",
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
    hint: "wrapped := fmt.Errorf(\"shelf %d: %w\", shelfID, ErrBookMissing) — fmt.Println(wrapped)",
  },
  {
    title: "errors.Is for Book Lookup",
    instruction:
      "`errors.Is` checks if any error in the chain matches a target. Create a sentinel error `ErrBookNotFound`, wrap it with `fmt.Errorf` adding shelf context, then use `errors.Is` to confirm the original error is in the chain and print the boolean result.",
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
