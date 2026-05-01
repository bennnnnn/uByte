import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define a Book Struct",
    instruction:
      "A struct groups related fields into one type — like a library catalog card with Title, Author, and Pages. Define a `Book` struct with those three fields, create a Book titled `\"The Great Gatsby\"` by `\"F. Scott Fitzgerald\"` with 180 pages, and print the Title and Pages on separate lines.",
    starter: `package main

import "fmt"

// TODO: define Book struct with Title, Author, and Pages

func main() {
\t// TODO: create a Book and print Title then Pages
}`,
    expectedOutput: ["The Great Gatsby", "180"],
    hint: 'type Book struct { Title string; Author string; Pages int } — b := Book{Title: "The Great Gatsby", Author: "F. Scott Fitzgerald", Pages: 180} — fmt.Println(b.Title); fmt.Println(b.Pages)',
  },
  {
    title: "Struct Method (Value Receiver) — Describe",
    instruction:
      "Methods are functions attached to a type. Write a `Describe()` method on `Book` that returns `'\"' + b.Title + '\" by ' + b.Author + ' (' + strconv.Itoa(b.Pages) + ' pages)'`. Create a Book and print the result of Describe().",
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
\tb := Book{Title: "The Great Gatsby", Author: "F. Scott Fitzgerald", Pages: 180}
\tfmt.Println(b.Describe())
}`,
    expectedOutput: ['"The Great Gatsby" by F. Scott Fitzgerald (180 pages)'],
    hint: 'func (b Book) Describe() string { return "\"" + b.Title + "\" by " + b.Author + " (" + strconv.Itoa(b.Pages) + " pages)" }',
  },
  {
    title: "Nested Structs — Author in Book",
    instruction:
      "Structs can contain other structs. Define an `Author` struct with `Name string` and `Nationality string`. Then change `Book` so `Author` is an `Author` struct instead of a string. Create a Book by Jane Austen (British) and print the nationality.",
    starter: `package main

import "fmt"

// TODO: define Author struct with Name and Nationality
// TODO: redefine Book with Author field as Author struct

func main() {
\tb := Book{
\t\tTitle:  "Pride and Prejudice",
\t\tAuthor: Author{Name: "Jane Austen", Nationality: "British"},
\t\tPages:  280,
\t}
\tfmt.Println(b.Author.Nationality)
}`,
    expectedOutput: ["British"],
    hint: "type Author struct { Name string; Nationality string } — type Book struct { Title string; Author Author; Pages int }",
  },
  {
    title: "Anonymous Struct — Library Event",
    instruction:
      "Sometimes you need a one-off struct without defining a named type. Create an anonymous struct with `EventName` and `Attendees` fields, set them to `\"Poetry Reading\"` and 30, and print both.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: declare an anonymous struct with EventName and Attendees, then print them
}`,
    expectedOutput: ["Poetry Reading", "30"],
    hint: 'event := struct{ EventName string; Attendees int }{EventName: "Poetry Reading", Attendees: 30} — fmt.Println(event.EventName, event.Attendees)',
  },
  {
    title: "Pointer to Struct — Library Catalog",
    instruction:
      "Use `new(Book)` to allocate a Book and get a pointer to it. Set the Title field to `\"To Kill a Mockingbird\"` and print it.",
    starter: `package main

import "fmt"

type Book struct {
\tTitle  string
\tAuthor string
\tPages  int
}

func main() {
\t// TODO: use new(Book), set Title to "To Kill a Mockingbird", print Title
}`,
    expectedOutput: ["To Kill a Mockingbird"],
    hint: 'b := new(Book) — b.Title = "To Kill a Mockingbird" — fmt.Println(b.Title)',
  },
];
