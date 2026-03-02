import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Declare with var",
    instruction:
      "The `var` keyword declares a variable with an explicit type. Declare a `string` variable named `name` with the value \"Alice\" and an `int` variable named `age` with the value 30. Print both on separate lines.",
    starter: `package main

import "fmt"

func main() {
	// TODO: declare name (string) = "Alice"
	// TODO: declare age (int) = 30
	// TODO: print name, then print age
}`,
    expectedOutput: ["Alice", "30"],
    hint: "var name string = \"Alice\" — then fmt.Println(name) to print it.",
  },
  {
    title: "Short Declaration",
    instruction:
      "Inside functions, `:=` is the most common way to declare variables. It infers the type automatically. Declare `city` as \"London\" and `population` as 9000000 using `:=`, then print both.",
    starter: `package main

import "fmt"

func main() {
	// TODO: declare city and population using :=
	// TODO: print both
}`,
    expectedOutput: ["London", "9000000"],
    hint: "city := \"London\" and population := 9000000 — Go infers string and int automatically.",
  },
  {
    title: "Zero Values",
    instruction:
      "In Go every variable is initialized to its zero value if no value is given. Declare an `int`, a `bool`, and a `string` without assigning values, then print each. You should see 0, false, and an empty string.",
    starter: `package main

import "fmt"

func main() {
	var n int
	var b bool
	var s string
	// TODO: print n, b, and s
}`,
    expectedOutput: ["0", "false"],
    hint: "fmt.Println(n) prints 0, fmt.Println(b) prints false, fmt.Println(s) prints an empty line.",
  },
  {
    title: "String Operations",
    instruction:
      "The `strings` package provides useful functions for working with strings. Import it and use `strings.ToUpper()` to convert \"hello\" to uppercase, then print the result.",
    starter: `package main

import (
	"fmt"
	"strings"
)

func main() {
	word := "hello"
	// TODO: convert word to uppercase using strings.ToUpper
	// TODO: print the result
	_ = word
}`,
    expectedOutput: ["HELLO"],
    hint: "upper := strings.ToUpper(word) — then fmt.Println(upper).",
  },
  {
    title: "Type Conversion",
    instruction:
      "Go never converts types implicitly — you must do it explicitly. Convert the `int` value 42 to `float64` and print it. Then print its type using `%T`.",
    starter: `package main

import "fmt"

func main() {
	i := 42
	// TODO: convert i to float64 and store in f
	// TODO: print f and its type with fmt.Printf("value: %v, type: %T\n", f, f)
	_ = i
}`,
    expectedOutput: ["42", "float64"],
    hint: "f := float64(i) converts the int. Then fmt.Printf(\"value: %v, type: %T\\n\", f, f) prints both.",
  },
  {
    title: "Constants",
    instruction:
      "Constants are values fixed at compile time, declared with `const`. Declare a constant `Pi` equal to 3.14159 and use it to calculate the area of a circle with radius 5 (area = Pi × r²). Print the result formatted to 2 decimal places.",
    starter: `package main

import "fmt"

const Pi = 3.14159

func main() {
	radius := 5.0
	// TODO: calculate area = Pi * radius * radius
	// TODO: print area with fmt.Printf("Area: %.2f\n", area)
	_ = radius
}`,
    expectedOutput: ["78.54"],
    hint: "area := Pi * radius * radius — then fmt.Printf(\"Area: %.2f\\n\", area).",
  },
];
