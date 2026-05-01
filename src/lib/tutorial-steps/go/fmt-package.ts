import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Println — I Shout Things to the Screen",
    instruction:
      "Last lesson you made me talk with Println. Now take it further — I need to announce two book titles. Print `\"Go Basics\"` on one line and `\"Concurrency in Go\"` on the next. Each `fmt.Println()` call gives me a new line to shout from.",
    starter: `package main

import "fmt"

func main() {
\t// Tell the computer to shout "Go Basics" on one line
\t// Then shout "Concurrency in Go" on the next line
\t// TODO: add two fmt.Println() calls
}`,
    expectedOutput: ["Go Basics", "Concurrency in Go"],
    hint: "Two separate fmt.Println() calls, each with one string argument — one per book title.",
  },
  {
    title: "Printf — I Mix Text with Variables",
    instruction:
      "`fmt.Printf()` is like Println but with placeholders. `%s` is where a string goes, `%d` is where a number goes. I've got a book title and page count ready. Use Printf to print `\"Book: Go Basics, 350 pages\"`.",
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
    hint: 'fmt.Printf("Book: %s, %d pages\\n", bookTitle, pageCount) — %s grabs bookTitle, %d grabs pageCount.',
  },
  {
    title: "Float Formatting — I Handle Decimals Too",
    instruction:
      "`%.2f` rounds a decimal to 2 places — perfect for prices. A book costs 29.95 dollars. Use Printf to print it formatted as `\"Price: $29.95\"`.",
    starter: `package main

import "fmt"

func main() {
\tprice := 29.95
\t// TODO: print price with 2 decimal places using %.2f
\t_ = price
}`,
    expectedOutput: ["29.95"],
    hint: 'fmt.Printf("Price: $%.2f\\n", price) will output Price: $29.95.',
  },
  {
    title: "Sprintf — I Hand the String Back Quietly",
    instruction:
      "`fmt.Sprintf()` works like Printf but returns the formatted string instead of printing it — useful for building labels. Build the string `\"Library Card: Go Basics - A. Donovan & B. Kernighan\"`, store it in `card`, then print it.",
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
    hint: 'card := fmt.Sprintf("Library Card: %s - %s & %s", title, author1, author2) — quietly builds the string, then Println shouts it.',
  },
  {
    title: "%v and %T — I Tell You What and Who I Am",
    instruction:
      "`%v` prints a value in its default format. `%T` prints its type name. I've got a book title (string) and a shelf number (int). Print each on its own line showing both, like `\"Go Basics is of type string\"`.",
    starter: `package main

import "fmt"

func main() {
\tbookTitle := "Go Basics"
\tshelfNumber := 42
\t// TODO: for each variable, print: "<value> is of type <type>"
\t_ = bookTitle
\t_ = shelfNumber
}`,
    expectedOutput: ["string", "int"],
    hint: 'fmt.Printf("%v is of type %T\\n", bookTitle, bookTitle) — then do the same for shelfNumber.',
  },
];
