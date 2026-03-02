import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Import Standard Library Packages",
    instruction:
      "Go's standard library is extensive. Import `strings` and `fmt`. Use `strings.ToUpper(\"hello\")` to get the uppercase version, print it, then print `len(\"hello\")` to confirm the length.",
    starter: `package main

import (
	"fmt"
	"strings"
)

func main() {
	// TODO: print strings.ToUpper("hello")
	// TODO: print len("hello")
}`,
    expectedOutput: ["HELLO", "5"],
    hint: "fmt.Println(strings.ToUpper(\"hello\")) — fmt.Println(len(\"hello\"))",
  },
  {
    title: "Multiple Imports — fmt and math",
    instruction:
      "Use both `fmt` and `math` in the same program. Print `math.Pi` formatted to 2 decimal places, and print `math.Sqrt(16)` (which should be 4).",
    starter: `package main

import (
	"fmt"
	"math"
)

func main() {
	// TODO: print math.Pi with 2 decimal places
	// TODO: print math.Sqrt(16)
}`,
    expectedOutput: ["3.14", "4"],
    hint: "fmt.Printf(\"%.2f\\n\", math.Pi) — fmt.Println(math.Sqrt(16))",
  },
  {
    title: "Package-Level Variables",
    instruction:
      "Variables declared at package level are initialized before `main` runs, like a lightweight form of initialization. A package-level variable `greeting` is already set to \"initialized\". Print it from `main`.",
    starter: `package main

import "fmt"

var greeting = "initialized"

func main() {
	// TODO: print the package-level greeting variable
}`,
    expectedOutput: ["initialized"],
    hint: "fmt.Println(greeting)",
  },
  {
    title: "math/rand — Random Numbers",
    instruction:
      "The `math/rand` package generates pseudo-random numbers. Use `rand.Intn(100) + 1` to get a number between 1 and 100, store it in a variable, and print it. Any number 1-100 passes.",
    starter: `package main

import (
	"fmt"
	"math/rand"
)

func main() {
	// TODO: generate a random number 1-100 and print it
}`,
    expectedOutput: [],
    hint: "n := rand.Intn(100) + 1 — fmt.Println(n)",
  },
];
