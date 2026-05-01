import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Your First Test",
    instruction:
      "Go tests check your code against expectations. Here we simulate testing inside `main()`. Write a `countBooks(catalog []string) int` function that returns the number of books in a catalog slice, then call it and print `PASS` if the result is 3.",
    starter: `package main

import "fmt"

// TODO: write countBooks(catalog []string) int that returns len(catalog)
func countBooks(catalog []string) int {
	return 0
}

func main() {
	catalog := []string{"The Go Programming Language", "1984", "Brave New World"}
	got := countBooks(catalog)
	if got == 3 {
		fmt.Println("PASS: countBooks returned 3")
	} else {
		fmt.Printf("FAIL: countBooks = %d, want 3\\n", got)
	}
}`,
    expectedOutput: ["PASS"],
    hint: "Change `return 0` to `return len(catalog)` in countBooks.",
  },
  {
    title: "Table-Driven Tests",
    instruction:
      "Table-driven tests let you test many inputs with a single loop. Complete the `lookupByISBN(catalog map[string]string, isbn string) string` function that returns the book title for a given ISBN, or empty string if not found. The table tests five lookups — all must print PASS.",
    starter: `package main

import "fmt"

// TODO: implement lookupByISBN — return catalog[isbn]
func lookupByISBN(catalog map[string]string, isbn string) string {
	return ""
}

func main() {
	catalog := map[string]string{
		"978-0-14-081774-4": "The Go Programming Language",
		"978-0-452-28423-4": "1984",
		"978-0-06-112008-4": "Brave New World",
	}

	cases := []struct {
		isbn string
		want string
	}{
		{"978-0-14-081774-4", "The Go Programming Language"},
		{"978-0-452-28423-4", "1984"},
		{"978-0-06-112008-4", "Brave New World"},
		{"978-0-00-000000-0", ""},
		{"", ""},
	}

	for _, tc := range cases {
		got := lookupByISBN(catalog, tc.isbn)
		if got == tc.want {
			fmt.Printf("PASS: lookupByISBN(%q)\\n", tc.isbn)
		} else {
			fmt.Printf("FAIL: lookupByISBN(%q) = %q, want %q\\n", tc.isbn, got, tc.want)
		}
	}
}`,
    expectedOutput: [
      "PASS: lookupByISBN(\"978-0-14-081774-4\")",
      "PASS: lookupByISBN(\"978-0-452-28423-4\")",
      "PASS: lookupByISBN(\"978-0-06-112008-4\")",
      "PASS: lookupByISBN(\"978-0-00-000000-0\")",
      "PASS: lookupByISBN(\"\")",
    ],
    hint: "Change `return \"\"` to `return catalog[isbn]` in lookupByISBN. Map lookups return the zero value (empty string) for missing keys automatically.",
  },
  {
    title: "Test Helper Functions",
    instruction:
      "Extract repeated book-field checks into a helper. Write a `checkBook(label, gotTitle, wantTitle string, gotPages, wantPages int)` function that prints `PASS [label]` if both fields match, or `FAIL [label]: ...` with details. Then complete `newBook(title string, pages int) (string, int)` and test it using the helper.",
    starter: `package main

import "fmt"

// TODO: return title and pages as a tuple
func newBook(title string, pages int) (string, int) {
	return "", 0
}

// TODO: write checkBook that verifies both title and pages
func checkBook(label, gotTitle, wantTitle string, gotPages, wantPages int) {
}

func main() {
	checkBook("book-1", newBook("The Go Programming Language", 450), "The Go Programming Language", 450)
	checkBook("book-2", newBook("1984", 328), "1984", 328)
	checkBook("book-3", newBook("Brave New World", 311), "Brave New World", 311)
}`,
    expectedOutput: ["PASS [book-1]", "PASS [book-2]", "PASS [book-3]"],
    hint: "newBook returns (title, pages). checkBook: if both match print `PASS [label]`, else print `FAIL [label]: title got %q want %q or pages got %d want %d`.",
  },
  {
    title: "Testing Edge Cases",
    instruction:
      "Great tests exercise edge cases: an empty catalog, a missing book, and duplicate ISBNs. Implement `searchBook(catalog []string, isbn string) int` that returns the index of a book by ISBN in a catalog slice, or -1 if not found. All 5 cases must print PASS.",
    starter: `package main

import "fmt"

// TODO: search for isbn in catalog slice, return index or -1 if not found
func searchBook(catalog []string, isbn string) int {
	return 0
}

func main() {
	full := []string{"978-0-14-081774-4", "978-0-452-28423-4", "978-0-06-112008-4"}
	empty := []string{}
	missingFrom := []string{"978-0-452-28423-4", "978-0-06-112008-4"}

	cases := []struct {
		catalog []string
		isbn    string
		want    int
		label   string
	}{
		{full, "978-0-14-081774-4", 0, "first book"},
		{full, "978-0-06-112008-4", 2, "last book"},
		{empty, "978-0-14-081774-4", -1, "empty catalog"},
		{missingFrom, "978-0-14-081774-4", -1, "missing book"},
		{full, "978-0-00-000000-0", -1, "unknown ISBN"},
	}
	passed := 0
	for _, tc := range cases {
		got := searchBook(tc.catalog, tc.isbn)
		if got == tc.want {
			fmt.Printf("PASS [%s]\\n", tc.label)
			passed++
		} else {
			fmt.Printf("FAIL [%s]: got %d want %d\\n", tc.label, got, tc.want)
		}
	}
	fmt.Printf("%d/5 passed\\n", passed)
}`,
    expectedOutput: ["PASS [first book]", "PASS [last book]", "PASS [empty catalog]", "PASS [missing book]", "PASS [unknown ISBN]", "5/5 passed"],
    hint: "searchBook: loop through catalog with `for i, v := range catalog`, return i if v == isbn. Return -1 after loop if not found.",
  },
  {
    title: "Benchmark: Comparing Search Methods",
    instruction:
      "Benchmarks measure which approach is faster. Compare two search strategies on a large book catalog: linear scan (O(n)) vs map lookup (O(1)). Build a 1000-book catalog, then measure how long each method takes to find 500 random ISBNs. Print which method was faster.",
    starter: `package main

import (
	"fmt"
	"time"
)

// TODO: search linearly through a catalog slice for an ISBN, return title
func linearSearch(catalog []string, isbn string) string {
	return ""
}

// TODO: look up a title by ISBN from a map
func mapLookup(catalog map[string]string, isbn string) string {
	return ""
}

func benchLinear(catalog []string, isbns []string) time.Duration {
	start := time.Now()
	for _, isbn := range isbns {
		linearSearch(catalog, isbn)
	}
	return time.Since(start)
}

func benchMap(catalog map[string]string, isbns []string) time.Duration {
	start := time.Now()
	for _, isbn := range isbns {
		mapLookup(catalog, isbn)
	}
	return time.Since(start)
}

func main() {
	// Build a 1000-book catalog
	n := 1000
	isbns := make([]string, n)
	sliceCatalog := make([]string, n)
	mapCatalog := make(map[string]string, n)
	for i := 0; i < n; i++ {
		isbn := fmt.Sprintf("978-0-00-%04d-0", i)
		title := fmt.Sprintf("Book %d", i)
		isbns[i] = isbn
		sliceCatalog[i] = isbn
		mapCatalog[isbn] = title
	}

	// Search for 500 random-ish ISBNs
	searchKeys := make([]string, 500)
	for i := 0; i < 500; i++ {
		searchKeys[i] = isbns[i*2]
	}

	t1 := benchLinear(sliceCatalog, searchKeys)
	t2 := benchMap(mapCatalog, searchKeys)
	fmt.Printf("linear search:  %v\\n", t1)
	fmt.Printf("map lookup:     %v\\n", t2)
	if t2 < t1 {
		fmt.Println("Winner: map lookup is faster!")
	} else {
		fmt.Println("Winner: linear search is faster!")
	}
}`,
    expectedOutput: ["map lookup", "faster"],
    hint: "linearSearch: loop through catalog, return catalog[i] when matches. mapLookup: just return catalog[isbn]. Map lookup should be dramatically faster.",
  },
];
