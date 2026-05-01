import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
	{
		title: "Import the strings Package",
		instruction:
			"Go's standard library has a `strings` package for text manipulation. Import `strings` and use `strings.ToUpper(\"the great gatsby\")` to uppercase a book title, then `strings.ToLower(\"THE HOBBIT\")` to lowercase another title. Print both.",
		starter: `package main

import "strings"

func main() {
\t// TODO: print strings.ToUpper("the great gatsby")
\t// TODO: print strings.ToLower("THE HOBBIT")
}`,
		expectedOutput: ["THE GREAT GATSBY", "the hobbit"],
		hint: `fmt.Println(strings.ToUpper("the great gatsby")) — fmt.Println(strings.ToLower("THE HOBBIT"))`,
	},
	{
		title: "Multiple Imports — fmt and math",
		instruction:
			"Load `fmt` and `math` together using a grouped import. Print `math.Sqrt(144)` (square root of 144) as a book-ID calculation, then print `math.Pi` formatted to 2 decimal places as a catalog constant.",
		starter: `package main

import (
\t"fmt"
\t"math"
)

func main() {
\t// TODO: print math.Sqrt(144)
\t// TODO: print math.Pi with 2 decimal places
}`,
		expectedOutput: ["12", "3.14"],
		hint: `fmt.Println(math.Sqrt(144)) — fmt.Printf("%.2f\\n", math.Pi)`,
	},
	{
		title: "Package-Level Variable — Library Config",
		instruction:
			"Variables declared at package level are initialized before `main`. Declare a package-level variable `maxCheckoutDays` set to `14` and print it from `main` so the library knows how long patrons can borrow books.",
		starter: `package main

import "fmt"

var maxCheckoutDays = 14

func main() {
\t// TODO: print the package-level maxCheckoutDays variable
}`,
		expectedOutput: ["14"],
		hint: "fmt.Println(maxCheckoutDays)",
	},
	{
		title: "math/rand — Random Book Suggestion",
		instruction:
			"The `math/rand` package can suggest a random book from the catalog. Use `rand.Intn(1000) + 1` to pick a random book ID between 1 and 1000, store it in a variable, and print the suggestion. Any number 1–1000 passes.",
		starter: `package main

import (
\t"fmt"
\t"math/rand"
)

func main() {
\t// TODO: generate a random book ID (1-1000) and print it as a suggestion
}`,
		expectedOutput: [],
		hint: `bookID := rand.Intn(1000) + 1 — fmt.Println("Suggestion:", bookID)`,
	},
];
