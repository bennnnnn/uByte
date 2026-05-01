import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Marshal a Book to JSON",
    instruction:
      "JSON turns your Go structs into text any program can read. Add `json:\"title\"` and `json:\"author\"` tags to the Book struct so the JSON keys are lowercase, then call `json.Marshal(b)` and print the result.",
    starter: `package main

import (
\t"encoding/json"
\t"fmt"
)

// TODO: add json tags so fields become "title" and "author" in JSON
type Book struct {
\tTitle  string
\tAuthor string
}

func main() {
\tb := Book{Title: "The Go Programming Language", Author: "Alan Donovan"}

\t// TODO: marshal b to JSON and print it
\tdata, err := json.Marshal(nil)
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t\treturn
\t}
\tfmt.Println(string(data))
}`,
    expectedOutput: ["The Go Programming Language", "Alan Donovan"],
    hint: 'Add backtick tags: `json:"title"` after Title and `json:"author"` after Author. Pass `b` (not nil) to json.Marshal.',
  },
  {
    title: "Unmarshal JSON into a Book",
    instruction:
      "`json.Unmarshal(data, &v)` parses JSON back into a struct. Always pass a pointer. Unmarshal the provided JSON string into a `Book` and print its Title and Author.",
    starter: `package main

import (
\t"encoding/json"
\t"fmt"
)

type Book struct {
\tTitle  string \`json:"title"\`
\tAuthor string \`json:"author"\`
}

func main() {
\tdata := []byte(\`{"title":"1984","author":"George Orwell"}\`)

\t// TODO: declare a Book variable and unmarshal data into it
\tvar b Book
\terr := json.Unmarshal(nil, nil)
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t\treturn
\t}

\tfmt.Println("Title:", b.Title)
\tfmt.Println("Author:", b.Author)
}`,
    expectedOutput: ["Title: 1984", "Author: George Orwell"],
    hint: "Change `json.Unmarshal(nil, nil)` to `json.Unmarshal(data, &b)`.",
  },
  {
    title: "omitempty for Optional Fields",
    instruction:
      "Add `omitempty` to a JSON tag and I'll skip the field when it's empty. Tag `ISBN` with `json:\"isbn,omitempty\"`. Marshal two books — one with an ISBN and one without — and see the difference.",
    starter: `package main

import (
\t"encoding/json"
\t"fmt"
)

type Book struct {
\tTitle  string \`json:"title"\`
\tAuthor string \`json:"author"\`
\t// TODO: add ISBN string with tag json:"isbn,omitempty"
\tISBN string
}

func marshal(b Book) {
\tdata, _ := json.Marshal(b)
\tfmt.Println(string(data))
}

func main() {
\tmarshal(Book{Title: "Dune", Author: "Frank Herbert", ISBN: "978-0-441-17271-9"})
\tmarshal(Book{Title: "Neuromancer", Author: "William Gibson"}) // ISBN empty — should be omitted
}`,
    expectedOutput: ["isbn", "978-0-441-17271-9", "Neuromancer"],
    hint: 'Change `ISBN string` to `ISBN string \`json:"isbn,omitempty"\``. When ISBN is empty, the field won\'t appear in the second line.',
  },
  {
    title: "Encode Maps and Slices",
    instruction:
      "Any Go map or slice can be marshaled directly — no struct wrapper needed. Marshal a `map[string]int` of page counts and a `[]string` of genres, then print both as JSON.",
    starter: `package main

import (
\t"encoding/json"
\t"fmt"
)

func main() {
\tpages := map[string]int{
\t\t"Dune":        412,
\t\t"Neuromancer": 271,
\t}

\tgenres := []string{"sci-fi", "fantasy", "classic"}

\t// TODO: marshal pages and genres separately and print each
\tdata1, _ := json.Marshal(nil)
\tdata2, _ := json.Marshal(nil)

\tfmt.Println("Pages:", string(data1))
\tfmt.Println("Genres:", string(data2))
}`,
    expectedOutput: ["412", "sci-fi", "Genres:", "Pages:"],
    hint: "Pass `pages` and `genres` to json.Marshal instead of nil.",
  },
  {
    title: "Pretty Print with MarshalIndent",
    instruction:
      "`json.MarshalIndent(v, prefix, indent)` adds whitespace so humans can read the structure. Use `\"\"` as prefix and `\"  \"` (two spaces) as indent. Marshal a nested `Library` struct and print the indented result.",
    starter: `package main

import (
\t"encoding/json"
\t"fmt"
)

type Author struct {
\tName string \`json:"name"\`
}

type Book struct {
\tTitle  string \`json:"title"\`
\tAuthor Author \`json:"author"\`
}

type Library struct {
\tName  string \`json:"name"\`
\tBooks []Book \`json:"books"\`
}

func main() {
\tlib := Library{
\t\tName: "Central Library",
\t\tBooks: []Book{
\t\t\t{Title: "Dune", Author: Author{Name: "Frank Herbert"}},
\t\t\t{Title: "1984", Author: Author{Name: "George Orwell"}},
\t\t},
\t}

\t// TODO: use json.MarshalIndent with prefix="" and indent="  " (2 spaces)
\tdata, err := json.Marshal(lib)
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t\treturn
\t}
\tfmt.Println(string(data))
}`,
    expectedOutput: ["  \"name\"", "Dune", "Central Library"],
    hint: 'Change `json.Marshal(lib)` to `json.MarshalIndent(lib, "", "  ")`.',
  },
];
