import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Value Receiver — Pages x2",
    instruction:
      "A value receiver gets a copy of the struct. Define a `Book` struct with a `Pages int` field and a `DoublePages() int` method that returns `Pages * 2`. Create a 150-page book and print the doubled page count.",
    starter: `package main

import "fmt"

// TODO: define Book struct with Pages field
// TODO: define DoublePages() method on Book

func main() {
\tb := Book{Pages: 150}
\tfmt.Println(b.DoublePages())
}`,
    expectedOutput: ["300"],
    hint: "func (b Book) DoublePages() int { return b.Pages * 2 }",
  },
  {
    title: "Pointer Receiver — Check Out",
    instruction:
      "A pointer receiver lets a method modify the original struct. Define a `Library` struct with a `BorrowCount int` field and a `CheckOut()` method that increments `BorrowCount`. Create a library, check out a book three times, and print the borrow count.",
    starter: `package main

import "fmt"

// TODO: define Library struct and CheckOut() method with pointer receiver

func main() {
\tl := Library{}
\tl.CheckOut()
\tl.CheckOut()
\tl.CheckOut()
\tfmt.Println(l.BorrowCount)
}`,
    expectedOutput: ["3"],
    hint: "func (l *Library) CheckOut() { l.BorrowCount++ }",
  },
  {
    title: "Stringer — Book Summary",
    instruction:
      "If a type implements `String() string`, `fmt.Println` calls it automatically. Define a `Book` struct with `Title string` and `Author string` fields, and a `String()` method that returns `\"<Title> by <Author>\"`. Print a Book and see the custom summary appear.",
    starter: `package main

import "fmt"

type Book struct {
\tTitle  string
\tAuthor string
}

// TODO: define String() method on Book returning "<Title> by <Author>"

func main() {
\tb := Book{Title: "The Go Programming Language", Author: "Donovan & Kernighan"}
\tfmt.Println(b)
}`,
    expectedOutput: ["The Go Programming Language by Donovan & Kernighan"],
    hint: `func (b Book) String() string { return fmt.Sprintf("%s by %s", b.Title, b.Author) }`,
  },
  {
    title: "Method Chaining — Book Description",
    instruction:
      "Returning `*BookDesc` from each method allows chaining calls. A `BookDesc` with an `Add(s string) *BookDesc` method and a `Build() string` method is provided. Chain two `Add` calls to produce \"Moby Dick by Herman Melville\" then print it.",
    starter: `package main

import "fmt"

type BookDesc struct {
\tresult string
}

func (b *BookDesc) Add(s string) *BookDesc {
\tif b.result != "" {
\t\tb.result += " "
\t}
\tb.result += s
\treturn b
}

func (b *BookDesc) Build() string {
\treturn b.result
}

func main() {
\t// TODO: chain .Add("Moby Dick").Add("by Herman Melville") and print Build()
}`,
    expectedOutput: ["Moby Dick by Herman Melville"],
    hint: `b := &BookDesc{} — fmt.Println(b.Add("Moby Dick").Add("by Herman Melville").Build())`,
  },
];
