import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Println — Library Book Titles",
    instruction:
      "`fmt.Println()` adds a newline after each call and spaces between arguments. You're building a library system. Print two book titles — each on its own line using separate Println calls: first \"Go Basics\" then \"Concurrency in Go\".",
    starter: `package main

import "fmt"

func main() {
\t// TODO: print "Go Basics" on one line
\t// TODO: print "Concurrency in Go" on the next line
}`,
    expectedOutput: ["Go Basics", "Concurrency in Go"],
    hint: "Two separate fmt.Println() calls, each with one string argument.",
  },
  {
    title: "Printf — Book Info with %s and %d",
    instruction:
      "`fmt.Printf()` formats output with verbs: `%s` for strings, `%d` for integers. Always end with `\\n` for a newline. Use Printf to print 'Book: Go Basics, 350 pages' using the variables provided.",
    starter: `package main

import "fmt"

func main() {
\tbookTitle := "Go Basics"
\tpageCount := 350
\t// TODO: use Printf to print "Book: Go Basics, 350 pages"
\t_ = bookTitle
\t_ = pageCount
}`,
    expectedOutput: ["Go Basics", "350"],
    hint: "fmt.Printf(\"Book: %s, %d pages\\n\", bookTitle, pageCount)",
  },
  {
    title: "Float Formatting — Book Price",
    instruction:
      "Use `%.2f` to print a float with exactly 2 decimal places — perfect for prices. A book costs 29.9500 dollars. Print just the price formatted as 'Price: $29.95' using Printf.",
    starter: `package main

import "fmt"

func main() {
\tprice := 29.95
\t// TODO: print price with 2 decimal places using %.2f
\t_ = price
}`,
    expectedOutput: ["29.95"],
    hint: "fmt.Printf(\"Price: $%.2f\\n\", price) will output Price: $29.95.",
  },
  {
    title: "Sprintf — Library Card",
    instruction:
      "`fmt.Sprintf()` returns a formatted string without printing — like building a library card label. Build the string 'Library Card: Go Basics - A. Donovan & B. Kernighan' from the variables, store it, then print it.",
    starter: `package main

import "fmt"

func main() {
\ttitle := "Go Basics"
\tauthor1 := "A. Donovan"
\tauthor2 := "B. Kernighan"
\t// TODO: use Sprintf to build "Library Card: Go Basics - A. Donovan & B. Kernighan"
\tcard := ""
\t_ = title
\t_ = author1
\t_ = author2
\tfmt.Println(card)
}`,
    expectedOutput: ["Go Basics", "Donovan", "Kernighan"],
    hint: "card := fmt.Sprintf(\"Library Card: %s - %s & %s\", title, author1, author2)",
  },
  {
    title: "Type Inspection with %v and %T",
    instruction:
      "`%v` prints any value in default format. `%T` prints the type name. Your library has a book title (string) and a shelf number (int). Print each on its own line showing both value and type, like: 'Go Basics is of type string'.",
    starter: `package main

import "fmt"

func main() {
\tbookTitle := "Go Basics"
\tshelfNumber := 42
\t// TODO: for each, print: "<value> is of type <type>"
\t_ = bookTitle
\t_ = shelfNumber
}`,
    expectedOutput: ["string", "int"],
    hint: "fmt.Printf(\"%v is of type %T\\n\", bookTitle, bookTitle) — then do the same for shelfNumber.",
  },
];
