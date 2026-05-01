import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Create a Library Map",
    instruction:
      "Maps store key-value pairs. Create a `map[string]string` that maps ISBNs to book titles with three entries: \"978-0141439518\" → \"Pride and Prejudice\", \"978-0061120084\" → \"To Kill a Mockingbird\", \"978-0451524935\" → \"1984\". Then print the title for \"978-0141439518\".",
    starter: `package main

import "fmt"

func main() {
\t// TODO: create a map with isbn -> title for three books
\t// TODO: print the title for ISBN "978-0141439518"
}`,
    expectedOutput: ["978-0141439518", "Pride and Prejudice"],
    hint: "books := map[string]string{\"978-0141439518\": \"Pride and Prejudice\", \"978-0061120084\": \"To Kill a Mockingbird\", \"978-0451524935\": \"1984\"} — fmt.Println(\"978-0141439518\", books[\"978-0141439518\"])",
  },
  {
    title: "Check if a Book Exists",
    instruction:
      "Map lookups return two values: the value and a boolean `ok`. If the key is missing, `ok` is false and the value is the zero value. Look up \"978-0451524935\" in the library map; if found print \"found\", otherwise print \"not found\".",
    starter: `package main

import "fmt"

func main() {
\tlibrary := map[string]string{"978-0141439518": "Pride and Prejudice", "978-0451524935": "1984"}
\t// TODO: look up "978-0451524935" using the two-value form and print "found" or "not found"
\t_ = library
}`,
    expectedOutput: ["found"],
    hint: "if _, ok := library[\"978-0451524935\"]; ok { fmt.Println(\"found\") } else { fmt.Println(\"not found\") }",
  },
  {
    title: "Remove a Borrowed Book",
    instruction:
      "Use the built-in `delete(map, key)` to remove an entry. Delete \"978-0451524935\" from the library (it was borrowed), then try to look it up — print \"not available\" if the key is gone.",
    starter: `package main

import "fmt"

func main() {
\tlibrary := map[string]string{"978-0141439518": "Pride and Prejudice", "978-0451524935": "1984"}
\t// TODO: delete "978-0451524935" from library (it was borrowed)
\t// TODO: check if "978-0451524935" still exists and print "not available" if it doesn't
\t_ = library
}`,
    expectedOutput: ["not available"],
    hint: "delete(library, \"978-0451524935\") — then if _, ok := library[\"978-0451524935\"]; !ok { fmt.Println(\"not available\") }",
  },
  {
    title: "List All Books in the Library",
    instruction:
      "`for range` on a map gives you each key and value. Loop over the library map and print each book's ISBN and title on one line (e.g. \"978-0141439518: Pride and Prejudice\").",
    starter: `package main

import "fmt"

func main() {
\tlibrary := map[string]string{"978-0141439518": "Pride and Prejudice", "978-0061120084": "To Kill a Mockingbird", "978-0451524935": "1984"}
\t// TODO: range over library and print each "isbn: title"
\t_ = library
}`,
    expectedOutput: ["978-0141439518", "Pride and Prejudice", "To Kill a Mockingbird", "1984"],
    hint: "for isbn, title := range library { fmt.Printf(\"%s: %s\\n\", isbn, title) }",
  },
  {
    title: "Count Books per Genre",
    instruction:
      "Count how many books belong to each genre. Split the comma-separated genres string \"fiction,non-fiction,fiction,reference,fiction\" by commas, count each genre, then print the count for \"fiction\".",
    starter: `package main

import (
\t"fmt"
\t"strings"
)

func main() {
\tgenres := "fiction,non-fiction,fiction,reference,fiction"
\tcounts := map[string]int{}
\t// TODO: split genres by "," and count each genre
\t// TODO: print the count for "fiction"
\t_ = genres
\t_ = counts
}`,
    expectedOutput: ["fiction", "3"],
    hint: "for _, g := range strings.Split(genres, \",\") { counts[g]++ } — fmt.Println(\"fiction\", counts[\"fiction\"])",
  },
];
