import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define a Book Struct",
    instruction:
      "A `struct` groups related fields together into a single type. Define a `Book` struct with `Title string`, `Author string`, and `Pages int` fields. Create a Book with title \"The Go Programming Language\", author \"Donovan & Kernighan\", and 400 pages, then print both Title and Pages on separate lines.",
    starter: `package main

import "fmt"

// TODO: define Book struct with Title, Author, and Pages

func main() {
\t// TODO: create a Book and print Title then Pages
}`,
    expectedOutput: ["The Go Programming Language", "400"],
    hint: "type Book struct { Title string; Author string; Pages int } — b := Book{Title: \"The Go Programming Language\", Author: \"Donovan & Kernighan\", Pages: 400} — fmt.Println(b.Title); fmt.Println(b.Pages)",
  },
  {
    title: "Struct Method (Value Receiver) — Describe",
    instruction:
      "Methods are functions with a receiver. Define a `Describe()` method on `Book` that returns `\"\\\"\" + b.Title + \"\\\" by \" + b.Author + \" (\" + strconv.Itoa(b.Pages) + \" pages)\"`. Create a Book and print the result of calling its `Describe()` method.",
    starter: `package main

import (
\t"fmt"
\t"strconv"
)

type Book struct {
\tTitle  string
\tAuthor string
\tPages  int
}

// TODO: define Describe() method on Book that returns formatted string

func main() {
\tb := Book{Title: "The Go Programming Language", Author: "Donovan & Kernighan", Pages: 400}
\tfmt.Println(b.Describe())
}`,
    expectedOutput: ["\"The Go Programming Language\" by Donovan & Kernighan (400 pages)"],
    hint: `func (b Book) Describe() string { return "\"" + b.Title + "\" by " + b.Author + " (" + strconv.Itoa(b.Pages) + " pages)" }`,
  },
  {
    title: "Nested Structs — Author in Book",
    instruction:
      "Structs can contain other structs as fields. Define an `Author` struct with `Name string` and `Nationality string` fields, then replace the `Author string` field in `Book` with `Author Author`. Create a Book by J.K. Rowling (British) with 500 pages titled \"Harry Potter\" and print the author's nationality.",
    starter: `package main

import "fmt"

// TODO: define Author struct with Name and Nationality
// TODO: redefine Book with Author field as Author struct

func main() {
\tb := Book{
\t\tTitle:  "Harry Potter",
\t\tAuthor: Author{Name: "J.K. Rowling", Nationality: "British"},
\t\tPages:  500,
\t}
\tfmt.Println(b.Author.Nationality)
}`,
    expectedOutput: ["British"],
    hint: "type Author struct { Name string; Nationality string } — type Book struct { Title string; Author Author; Pages int }",
  },
  {
    title: "Anonymous Struct — Library Event",
    instruction:
      "Sometimes you need a one-off struct without defining a named type. Create an anonymous struct inline with `EventName` and `Attendees` fields, set them to \"Author Meetup\" and 42, and print both.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: declare an anonymous struct with EventName and Attendees, then print them
}`,
    expectedOutput: ["Author Meetup", "42"],
    hint: "event := struct{ EventName string; Attendees int }{EventName: \"Author Meetup\", Attendees: 42} — fmt.Println(event.EventName, event.Attendees)",
  },
  {
    title: "Pointer to Struct — Library Catalog",
    instruction:
      "`new(T)` allocates a zeroed struct and returns a pointer to it. Use `new(Book)` to allocate a Book, set the Title field to \"Clean Code\", then print the title.",
    starter: `package main

import "fmt"

type Book struct {
\tTitle  string
\tAuthor string
\tPages  int
}

func main() {
\t// TODO: use new(Book), set Title to "Clean Code", print Title
}`,
    expectedOutput: ["Clean Code"],
    hint: "b := new(Book) — b.Title = \"Clean Code\" — fmt.Println(b.Title)",
  },
];
