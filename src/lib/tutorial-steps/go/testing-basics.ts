import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Your First Test",
    instruction:
      "Write a `countBooks(catalog []string) int` function that returns the length of the catalog. Call it with 3 books, and print PASS if it returns 3. Tests are how you catch bugs before they reach users.",
    starter: `package main

import "fmt"

// TODO: write countBooks(catalog []string) int that returns len(catalog)
func countBooks(catalog []string) int {
\treturn 0
}

func main() {
\tcatalog := []string{"The Go Programming Language", "1984", "Brave New World"}
\tgot := countBooks(catalog)
\tif got == 3 {
\t\tfmt.Println("PASS: countBooks returned 3")
\t} else {
\t\tfmt.Printf("FAIL: countBooks = %d, want 3\\n", got)
\t}
}`,
    expectedOutput: ["PASS"],
    hint: "Change `return 0` to `return len(catalog)` in countBooks.",
  },
  {
    title: "Table-Driven Tests",
    instruction:
      "Complete `lookupByISBN(catalog map[string]string, isbn string) string` that returns the book title for a given ISBN. The table tests 5 lookups — all must print PASS.",
    starter: `package main

import "fmt"

// TODO: implement lookupByISBN — return catalog[isbn]
func lookupByISBN(catalog map[string]string, isbn string) string {
\treturn ""
}

func main() {
\tcatalog := map[string]string{
\t\t"978-0-14-081774-4": "The Go Programming Language",
\t\t"978-0-452-28423-4": "1984",
\t\t"978-0-06-112008-4": "Brave New World",
\t}

\tcases := []struct {
\t\tisbn string
\t\twant string
\t}{
\t\t{"978-0-14-081774-4", "The Go Programming Language"},
\t\t{"978-0-452-28423-4", "1984"},
\t\t{"978-0-06-112008-4", "Brave New World"},
\t\t{"978-0-00-000000-0", ""},
\t\t{"", ""},
\t}

\tfor _, tc := range cases {
\t\tgot := lookupByISBN(catalog, tc.isbn)
\t\tif got == tc.want {
\t\t\tfmt.Printf("PASS: lookupByISBN(%q)\\n", tc.isbn)
\t\t} else {
\t\t\tfmt.Printf("FAIL: lookupByISBN(%q) = %q, want %q\\n", tc.isbn, got, tc.want)
\t\t}
\t}
}`,
    expectedOutput: [
      "PASS: lookupByISBN(\"978-0-14-081774-4\")",
      "PASS: lookupByISBN(\"978-0-452-28423-4\")",
      "PASS: lookupByISBN(\"978-0-06-112008-4\")",
      "PASS: lookupByISBN(\"978-0-00-000000-0\")",
      "PASS: lookupByISBN(\"\")",
    ],
    hint: "Change `return \"\"` to `return catalog[isbn]`. Maps return the zero value (empty string) for missing keys automatically.",
  },
  {
    title: "Test Helper Functions",
    instruction:
      "Write a `checkBook(label, gotTitle, wantTitle string, gotPages, wantPages int)` helper that prints `PASS [label]` if both fields match, or `FAIL [label]:` with details. Then complete `newBook` to return its arguments as a tuple and test it.",
    starter: `package main

import "fmt"

// TODO: return title and pages as a tuple
func newBook(title string, pages int) (string, int) {
\treturn "", 0
}

// TODO: write checkBook that verifies both title and pages
func checkBook(label, gotTitle, wantTitle string, gotPages, wantPages int) {
}

func main() {
\tcheckBook("book-1", newBook("The Go Programming Language", 450), "The Go Programming Language", 450)
\tcheckBook("book-2", newBook("1984", 328), "1984", 328)
\tcheckBook("book-3", newBook("Brave New World", 311), "Brave New World", 311)
}`,
    expectedOutput: ["PASS [book-1]", "PASS [book-2]", "PASS [book-3]"],
    hint: "newBook returns (title, pages). In checkBook: if both match print `PASS [label]`, else print `FAIL [label]: ...` with details.",
  },
  {
    title: "Testing Edge Cases",
    instruction:
      "Implement `searchBook(catalog []string, isbn string) int` that returns the index of an ISBN, or -1 if not found. Tests include an empty catalog, a missing book, and unknown ISBNs. All 5 must pass.",
    starter: `package main

import "fmt"

// TODO: search for isbn in catalog slice, return index or -1 if not found
func searchBook(catalog []string, isbn string) int {
\treturn 0
}

func main() {
\tfull := []string{"978-0-14-081774-4", "978-0-452-28423-4", "978-0-06-112008-4"}
\tempty := []string{}
\tmissingFrom := []string{"978-0-452-28423-4", "978-0-06-112008-4"}

\tcases := []struct {
\t\tcatalog []string
\t\tisbn    string
\t\twant    int
\t\tlabel   string
\t}{
\t\t{full, "978-0-14-081774-4", 0, "first book"},
\t\t{full, "978-0-06-112008-4", 2, "last book"},
\t\t{empty, "978-0-14-081774-4", -1, "empty catalog"},
\t\t{missingFrom, "978-0-14-081774-4", -1, "missing book"},
\t\t{full, "978-0-00-000000-0", -1, "unknown ISBN"},
\t}
\tpassed := 0
\tfor _, tc := range cases {
\t\tgot := searchBook(tc.catalog, tc.isbn)
\t\tif got == tc.want {
\t\t\tfmt.Printf("PASS [%s]\\n", tc.label)
\t\t\tpassed++
\t\t} else {
\t\t\tfmt.Printf("FAIL [%s]: got %d want %d\\n", tc.label, got, tc.want)
\t\t}
\t}
\tfmt.Printf("%d/5 passed\\n", passed)
}`,
    expectedOutput: ["PASS [first book]", "PASS [last book]", "PASS [empty catalog]", "PASS [missing book]", "PASS [unknown ISBN]", "5/5 passed"],
    hint: "searchBook: loop through catalog with `for i, v := range catalog`, return i if v == isbn. Return -1 after the loop if not found.",
  },
  {
    title: "Benchmark: Comparing Search Methods",
    instruction:
      "Compare linear scan (walking aisle by aisle) vs map lookup (digital index). Complete both search functions, then measure which is faster on a 1000-book catalog with 500 searches.",
    starter: `package main

import (
\t"fmt"
\t"time"
)

// TODO: search linearly through a catalog slice for an ISBN, return title
func linearSearch(catalog []string, isbn string) string {
\treturn ""
}

// TODO: look up a title by ISBN from a map
func mapLookup(catalog map[string]string, isbn string) string {
\treturn ""
}

func benchLinear(catalog []string, isbns []string) time.Duration {
\tstart := time.Now()
\tfor _, isbn := range isbns {
\t\tlinearSearch(catalog, isbn)
\t}
\treturn time.Since(start)
}

func benchMap(catalog map[string]string, isbns []string) time.Duration {
\tstart := time.Now()
\tfor _, isbn := range isbns {
\t\tmapLookup(catalog, isbn)
\t}
\treturn time.Since(start)
}

func main() {
\t// Build a 1000-book catalog
\tn := 1000
\tisbns := make([]string, n)
\tsliceCatalog := make([]string, n)
\tmapCatalog := make(map[string]string, n)
\tfor i := 0; i < n; i++ {
\t\tisbn := fmt.Sprintf("978-0-00-%04d-0", i)
\t\ttitle := fmt.Sprintf("Book %d", i)
\t\tisbns[i] = isbn
\t\tsliceCatalog[i] = isbn
\t\tmapCatalog[isbn] = title
\t}

\t// Search for 500 random-ish ISBNs
\tsearchKeys := make([]string, 500)
\tfor i := 0; i < 500; i++ {
\t\tsearchKeys[i] = isbns[i*2]
\t}

\tt1 := benchLinear(sliceCatalog, searchKeys)
\tt2 := benchMap(mapCatalog, searchKeys)
\tfmt.Printf("linear search:  %v\\n", t1)
\tfmt.Printf("map lookup:     %v\\n", t2)
\tif t2 < t1 {
\t\tfmt.Println("Winner: map lookup is faster")
\t} else {
\t\tfmt.Println("Winner: linear search is faster")
\t}
}`,
    expectedOutput: ["map lookup", "faster"],
    hint: "linearSearch: loop through catalog, return catalog[i] when ISBN matches. mapLookup: just return catalog[isbn]. Maps win every time on large collections.",
  },
];
