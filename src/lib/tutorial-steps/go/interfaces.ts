import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define an Item Interface",
    instruction:
      "An interface defines what a type CAN do, not what it IS. Define an `Item` interface with `Title() string`. Implement it on a `Book` struct where `Title()` returns `\"The Go Programming Language\"` and print the result. Any type with a `Title()` method automatically satisfies Item — no `implements` keyword needed.",
    starter: `package main

import "fmt"

// TODO: define Item interface with Title() string
// TODO: define Book struct and implement Title() returning "The Go Programming Language"

func main() {
\tvar b Item = Book{}
\tfmt.Println(b.Title())
}`,
    expectedOutput: ["The Go Programming Language"],
    hint: 'type Item interface { Title() string } — type Book struct{} — func (b Book) Title() string { return "The Go Programming Language" }',
  },
  {
    title: "Implicit Implementation (Book and Magazine)",
    instruction:
      "Both `Book` and `Magazine` satisfy `Item` without any explicit declaration — Go interfaces are implicit. Create a slice of `Item` containing a Book and a Magazine, loop over it, and print each title.",
    starter: `package main

import "fmt"

type Item interface {
\tTitle() string
}

type Book struct{}
type Magazine struct{}

func (b Book) Title() string { return "The Go Programming Language" }
func (m Magazine) Title() string { return "National Geographic" }

func main() {
\t// TODO: create []Item with Book{} and Magazine{}, range over it and print Title()
}`,
    expectedOutput: ["National Geographic", "The Go Programming Language"],
    hint: "items := []Item{Book{}, Magazine{}} — for _, i := range items { fmt.Println(i.Title()) }",
  },
  {
    title: "Interface as Parameter (PrintAnyItem)",
    instruction:
      "Accepting an interface as a parameter lets a function work with any type that satisfies it. Define `printItem(i Item)` that calls `fmt.Println(i.Title())`. Create an `Audiobook` with `Title()` returning `\"Atomic Habits\"` and pass it to printItem.",
    starter: `package main

import "fmt"

type Item interface {
\tTitle() string
}

// TODO: define printItem(i Item)
// TODO: define Audiobook struct and Title() method returning "Atomic Habits"

func main() {
\tprintItem(Audiobook{})
}`,
    expectedOutput: ["Atomic Habits"],
    hint: 'func printItem(i Item) { fmt.Println(i.Title()) } — type Audiobook struct{} — func (a Audiobook) Title() string { return "Atomic Habits" }',
  },
  {
    title: "Type Assertion (Get Author from Book)",
    instruction:
      "A type assertion `v.(T)` extracts the concrete type from an interface value. Given an `Item` holding a `Book` with an `Author` field, assert it to `Book` and print the Author.",
    starter: `package main

import "fmt"

type Item interface {
\tTitle() string
}

type Book struct {
\tAuthor string
}

func (b Book) Title() string { return "The Go Programming Language" }

func main() {
\tvar i Item = Book{Author: "Donovan & Kernighan"}
\t// TODO: assert i to Book and print the Author field
}`,
    expectedOutput: ["Donovan & Kernighan"],
    hint: "b, ok := i.(Book) — if ok { fmt.Println(b.Author) }",
  },
  {
    title: "Empty Interface (any)",
    instruction:
      "`any` (alias for `interface{}`) accepts a value of any type — every type in Go satisfies it. Define `showShelfItem(v any)` that prints the value. Call it with `2024` and `\"fiction\"`.",
    starter: `package main

import "fmt"

// TODO: define showShelfItem(v any)

func main() {
\tshowShelfItem(2024)
\tshowShelfItem("fiction")
}`,
    expectedOutput: ["2024", "fiction"],
    hint: "func showShelfItem(v any) { fmt.Println(v) }",
  },
];
