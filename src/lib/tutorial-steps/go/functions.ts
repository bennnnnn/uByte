import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define and Call a Function",
    instruction:
      "Functions are declared with `func name(params) returnType { }`. Define a function `greet(name string) string` that returns `\"Hello, \" + name + \"!\"`, then call it with \"Alice\" and print the result.",
    starter: `package main

import "fmt"

// TODO: define greet(name string) string

func main() {
	// TODO: call greet("Alice") and print the result
}`,
    expectedOutput: ["Hello, Alice!"],
    hint: "func greet(name string) string { return \"Hello, \" + name + \"!\" }",
  },
  {
    title: "Multiple Return Values",
    instruction:
      "Go functions can return multiple values — often used to return both a result and an error. Define `divide(a, b float64) (float64, error)` that returns an error if b is zero, otherwise returns a/b. Call it with 10 and 2, then print the result.",
    starter: `package main

import (
	"errors"
	"fmt"
)

// TODO: define divide(a, b float64) (float64, error)

func main() {
	result, err := divide(10, 2)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println(result)
}`,
    expectedOutput: ["5"],
    hint: "func divide(a, b float64) (float64, error) { if b == 0 { return 0, errors.New(\"division by zero\") }; return a / b, nil }",
  },
  {
    title: "Variadic Functions",
    instruction:
      "A variadic function accepts any number of arguments using `...type`. Define `sum(nums ...int) int` that returns the total of all its arguments, then call it with 1, 2, 3, 4, 5 and print the result.",
    starter: `package main

import "fmt"

// TODO: define sum(nums ...int) int

func main() {
	fmt.Println(sum(1, 2, 3, 4, 5))
}`,
    expectedOutput: ["15"],
    hint: "func sum(nums ...int) int { total := 0; for _, n := range nums { total += n }; return total }",
  },
  {
    title: "Named Return Values",
    instruction:
      "Go lets you name return values in the function signature and use a bare `return`. Define `minMax(nums []int) (min, max int)` that returns the smallest and largest value. Call it with `[3, 1, 4, 1, 5]` and print both.",
    starter: `package main

import "fmt"

// TODO: define minMax(nums []int) (min, max int)

func main() {
	min, max := minMax([]int{3, 1, 4, 1, 5})
	fmt.Println(min, max)
}`,
    expectedOutput: ["1", "5"],
    hint: "func minMax(nums []int) (min, max int) { min, max = nums[0], nums[0]; for _, n := range nums { if n < min { min = n }; if n > max { max = n } }; return }",
  },
  {
    title: "Functions as Values",
    instruction:
      "Functions are first-class values in Go — you can pass them as arguments. Define `apply(f func(int) int, x int) int` that calls `f(x)` and returns the result. Call it with a doubling function and 2, then print the result.",
    starter: `package main

import "fmt"

// TODO: define apply(f func(int) int, x int) int

func main() {
	double := func(n int) int { return n * 2 }
	fmt.Println(apply(double, 2))
}`,
    expectedOutput: ["4"],
    hint: "func apply(f func(int) int, x int) int { return f(x) }",
  },
  {
    title: "Closures",
    instruction:
      "A closure is a function that captures variables from its surrounding scope. Define a `counter()` function that returns a function which increments and returns an internal count each time it's called. Call the returned function three times and print each result.",
    starter: `package main

import "fmt"

// TODO: define counter() func() int

func main() {
	next := counter()
	fmt.Println(next())
	fmt.Println(next())
	fmt.Println(next())
}`,
    expectedOutput: ["1", "2", "3"],
    hint: "func counter() func() int { count := 0; return func() int { count++; return count } }",
  },
];
