import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Return an Error",
    instruction:
      "In Go, errors are values returned like any other. Define `divide(a, b float64) (float64, error)`. When `b` is zero, return `0` and `fmt.Errorf(\"cannot divide by zero\")`. Otherwise return the result and `nil`.",
    starter: `package main

import (
	"fmt"
)

// TODO: define divide(a, b float64) (float64, error)

func main() {
	_, err := divide(10, 0)
	fmt.Println(err)
}`,
    expectedOutput: ["cannot divide by zero"],
    hint: "func divide(a, b float64) (float64, error) { if b == 0 { return 0, fmt.Errorf(\"cannot divide by zero\") }; return a / b, nil }",
  },
  {
    title: "Check an Error",
    instruction:
      "The `if err != nil` pattern is the standard way to handle errors in Go. Call `divide(10, 0)` and `divide(10, 2)`. For the zero case print the error; for the success case print \"success:\" followed by the result.",
    starter: `package main

import "fmt"

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, fmt.Errorf("cannot divide by zero")
	}
	return a / b, nil
}

func main() {
	// TODO: call divide(10, 0), check err, print error message
	// TODO: call divide(10, 2), check err, print "success:" and result
}`,
    expectedOutput: ["Error:", "success: 5"],
    hint: "if err != nil { fmt.Println(\"Error:\", err) } — fmt.Println(\"success:\", result)",
  },
  {
    title: "Custom Error Type",
    instruction:
      "A custom error type gives callers more information. Define a `ValidationError` struct with a `Field string` and implement the `Error() string` method returning `\"ValidationError: \" + e.Field`. Return one and print it.",
    starter: `package main

import "fmt"

// TODO: define ValidationError struct with Field string
// TODO: implement Error() string method

func validate(name string) error {
	if name == "" {
		return ValidationError{Field: "name"}
	}
	return nil
}

func main() {
	err := validate("")
	fmt.Println(err)
}`,
    expectedOutput: ["ValidationError"],
    hint: "func (e ValidationError) Error() string { return \"ValidationError: \" + e.Field }",
  },
  {
    title: "Wrap Errors with %w",
    instruction:
      "`fmt.Errorf` with `%w` wraps an existing error so callers can unwrap it. Create a base error, wrap it with `fmt.Errorf(\"wrapped: %w\", base)`, then print the wrapped error.",
    starter: `package main

import (
	"errors"
	"fmt"
)

func main() {
	base := errors.New("connection refused")
	// TODO: wrap base with fmt.Errorf("wrapped: %w", base) and print it
	_ = base
}`,
    expectedOutput: ["wrapped:"],
    hint: "wrapped := fmt.Errorf(\"wrapped: %w\", base) — fmt.Println(wrapped)",
  },
  {
    title: "errors.Is",
    instruction:
      "`errors.Is` checks if any error in the chain matches a target. Create a sentinel error `ErrNotFound`, wrap it with `fmt.Errorf`, then use `errors.Is` to confirm the original error is present and print `true`.",
    starter: `package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

func main() {
	wrapped := fmt.Errorf("db: %w", ErrNotFound)
	// TODO: use errors.Is to check if wrapped contains ErrNotFound and print true/false
	_ = wrapped
}`,
    expectedOutput: ["true"],
    hint: "fmt.Println(errors.Is(wrapped, ErrNotFound))",
  },
];
