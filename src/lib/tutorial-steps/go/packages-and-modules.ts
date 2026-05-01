import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Import the strings Package",
    instruction:
      "Go's standard library comes with packages for text, math, and more. Import `\"strings\"` and use `strings.ToUpper(\"the great gatsby\")` to shout a title, then `strings.ToLower(\"THE HOBBIT\")` to whisper it. Print both.",
    starter: `package main

import "strings"

func main() {
\t// TODO: print strings.ToUpper("the great gatsby")
\t// TODO: print strings.ToLower("THE HOBBIT")
}`,
    expectedOutput: ["THE GREAT GATSBY", "the hobbit"],
    hint: 'fmt.Println(strings.ToUpper("the great gatsby")) — fmt.Println(strings.ToLower("THE HOBBIT"))',
  },
  {
    title: "Multiple Imports — fmt and math",
    instruction:
      "You can import multiple packages at once using grouped imports. Import `\"fmt\"` and `\"math\"`. Print `math.Sqrt(144)` (square root), then print `math.Pi` formatted to 2 decimal places.",
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
    hint: 'fmt.Println(math.Sqrt(144)) — fmt.Printf("%.2f\\n", math.Pi)',
  },
  {
    title: "Package-Level Variable — Library Config",
    instruction:
      "Variables declared at package level are initialized before `main` runs. A package-level variable `maxCheckoutDays` is set to `14`. Print it from inside main.",
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
      "Use `math/rand` to pick a random book. `rand.Intn(1000) + 1` gives you a random ID between 1 and 1000. Store it and print it.",
    starter: `package main

import (
\t"fmt"
\t"math/rand"
)

func main() {
\t// TODO: generate a random book ID (1-1000) and print it as a suggestion
}`,
    expectedOutput: [],
    hint: 'bookID := rand.Intn(1000) + 1 — fmt.Println("Suggestion:", bookID)',
  },
];
