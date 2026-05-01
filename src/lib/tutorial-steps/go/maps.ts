import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "I map ISBNs to book titles",
    instruction:
      "A map is a lookup table — give me an ISBN and I'll give you back the book title. Create a `map[string]string` called `catalog` with three entries: ISBN `\"978-0141439518\"` → `\"Pride and Prejudice\"`, `\"978-0061120084\"` → `\"To Kill a Mockingbird\"`, `\"978-0451524935\"` → `\"1984\"`. Then print the title for the first ISBN.",
    starter: `package main

import "fmt"

func main() {
\t// Hi! Give me a catalog of ISBN -> book title.
\t// I'll look up any key you hand me.
\t// TODO: create a map with isbn -> title for three books
\t// TODO: print the title for ISBN "978-0141439518"
}`,
    expectedOutput: ["978-0141439518", "Pride and Prejudice"],
    hint: 'catalog := map[string]string{"978-0141439518": "Pride and Prejudice", "978-0061120084": "To Kill a Mockingbird", "978-0451524935": "1984"} — then fmt.Println("978-0141439518", catalog["978-0141439518"])',
  },
  {
    title: "Look up if a book is in my catalog",
    instruction:
      "A map lookup returns two values: the result and a boolean `ok`. If the key doesn't exist, `ok` is false. Look up ISBN `\"978-0451524935\"` in the library map and print `\"found\"` if it exists, `\"not found\"` otherwise.",
    starter: `package main

import "fmt"

func main() {
\tlibrary := map[string]string{"978-0141439518": "Pride and Prejudice", "978-0451524935": "1984"}
\t// Ask me: "do you have ISBN 978-0451524935?"
\t// I'll answer with a value and a truth flag.
\t// TODO: look up "978-0451524935" using the two-value form and print "found" or "not found"
\t_ = library
}`,
    expectedOutput: ["found"],
    hint: 'if _, ok := library["978-0451524935"]; ok { fmt.Println("found") } else { fmt.Println("not found") }',
  },
  {
    title: "A book got checked out, remove it from my catalog",
    instruction:
      "Use `delete(map, key)` to remove an entry. Delete ISBN `\"978-0451524935\"` from the library, then try to look it up. Print `\"not available\"` if it's gone.",
    starter: `package main

import "fmt"

func main() {
\tlibrary := map[string]string{"978-0141439518": "Pride and Prejudice", "978-0451524935": "1984"}
\t// That book got checked out. Remove it from my catalog.
\t// Then ask me again — I'll tell you it's gone.
\t// TODO: delete "978-0451524935" from library (it was borrowed)
\t// TODO: check if "978-0451524935" still exists and print "not available" if it doesn't
\t_ = library
}`,
    expectedOutput: ["not available"],
    hint: 'delete(library, "978-0451524935") — then if _, ok := library["978-0451524935"]; !ok { fmt.Println("not available") }',
  },
  {
    title: "Show me every book in the catalog",
    instruction:
      "Use `for range` on a map to iterate over every key-value pair. Loop over the library and print each entry as `\"ISBN: Title\"` on its own line.",
    starter: `package main

import "fmt"

func main() {
\tlibrary := map[string]string{"978-0141439518": "Pride and Prejudice", "978-0061120084": "To Kill a Mockingbird", "978-0451524935": "1984"}
\t// Ask me to tell you everything I know.
\t// range over library and print each "isbn: title"
\t// TODO: range over library and print each "isbn: title"
\t_ = library
}`,
    expectedOutput: ["978-0141439518", "Pride and Prejudice", "To Kill a Mockingbird", "1984"],
    hint: 'for isbn, title := range library { fmt.Printf("%s: %s\\n", isbn, title) }',
  },
  {
    title: "Count how many books per genre",
    instruction:
      "Count how many times each genre appears. Split `\"fiction,non-fiction,fiction,reference,fiction\"` by commas and tally each genre in a `map[string]int`. Print the count for `\"fiction\"`.",
    starter: `package main

import (
\t"fmt"
\t"strings"
)

func main() {
\tgenres := "fiction,non-fiction,fiction,reference,fiction"
\tcounts := map[string]int{}
\t// Split the genres, count each one in my tally map.
\t// Then tell me the count for "fiction".
\t// TODO: split genres by "," and count each genre
\t// TODO: print the count for "fiction"
\t_ = genres
\t_ = counts
}`,
    expectedOutput: ["fiction", "3"],
    hint: 'for _, g := range strings.Split(genres, ",") { counts[g]++ } — fmt.Println("fiction", counts["fiction"])',
  },
];
