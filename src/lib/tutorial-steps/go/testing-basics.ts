import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Your First Test",
    instruction:
      "Go tests are functions that check your code. In real projects they live in `_test.go` files. Here we simulate them in `main()`. Write an `add(a, b int) int` function that returns `a + b`, then call it and print `PASS` if the result is 5.",
    starter: `package main

import "fmt"

// TODO: write add(a, b int) int that returns a + b
func add(a, b int) int {
	return 0
}

func main() {
	result := add(2, 3)
	if result == 5 {
		fmt.Println("PASS: add(2, 3) = 5")
	} else {
		fmt.Printf("FAIL: add(2, 3) = %d, want 5\\n", result)
	}
}`,
    expectedOutput: ["PASS"],
    hint: "Change `return 0` to `return a + b` in the add function.",
  },
  {
    title: "Table-Driven Tests",
    instruction:
      "The most common Go testing pattern: define a slice of `{input, expected}` cases and loop through them. Complete the `multiply` function and the test cases slice so that all four cases print PASS.",
    starter: `package main

import "fmt"

// TODO: implement multiply so it returns a * b
func multiply(a, b int) int {
	return 0
}

func main() {
	cases := []struct {
		a, b int
		want int
	}{
		{2, 3, 6},
		{0, 5, 0},
		{-1, 4, -4},
		{7, 7, 49},
	}

	for _, tc := range cases {
		got := multiply(tc.a, tc.b)
		if got == tc.want {
			fmt.Printf("PASS: multiply(%d, %d) = %d\\n", tc.a, tc.b, got)
		} else {
			fmt.Printf("FAIL: multiply(%d, %d) = %d, want %d\\n", tc.a, tc.b, got, tc.want)
		}
	}
}`,
    expectedOutput: ["PASS: multiply(2, 3)", "PASS: multiply(7, 7)"],
    hint: "Change `return 0` to `return a * b` in multiply.",
  },
  {
    title: "Test Helper Functions",
    instruction:
      "Extract repeated assertion logic into a helper. Write a `check(label string, got, want int)` function that prints `PASS [label]` or `FAIL [label]: got X want Y`. Then implement `subtract(a, b int) int` and test it using the helper.",
    starter: `package main

import "fmt"

func subtract(a, b int) int {
	// TODO: return a - b
	return 0
}

// TODO: write check(label string, got, want int) that prints PASS or FAIL
func check(label string, got, want int) {
}

func main() {
	check("10-3", subtract(10, 3), 7)
	check("5-5", subtract(5, 5), 0)
	check("1-9", subtract(1, 9), -8)
}`,
    expectedOutput: ["PASS [10-3]", "PASS [5-5]", "PASS [1-9]"],
    hint: "subtract returns a - b. check prints `PASS [label]` when got == want, else `FAIL [label]: got X want Y`.",
  },
  {
    title: "Testing Edge Cases",
    instruction:
      "Good tests cover boundaries: below min, above max, and at the limits. Implement `clamp(val, min, max int) int` that keeps `val` within [min, max]. All 5 cases must print PASS.",
    starter: `package main

import "fmt"

// TODO: implement clamp — return min if val < min, max if val > max, else val
func clamp(val, min, max int) int {
	return val
}

func main() {
	cases := []struct {
		val, min, max int
		want          int
		label         string
	}{
		{5, 0, 10, 5, "in range"},
		{-3, 0, 10, 0, "below min"},
		{15, 0, 10, 10, "above max"},
		{0, 0, 10, 0, "at min"},
		{10, 0, 10, 10, "at max"},
	}
	passed := 0
	for _, tc := range cases {
		got := clamp(tc.val, tc.min, tc.max)
		if got == tc.want {
			fmt.Printf("PASS [%s]\\n", tc.label)
			passed++
		} else {
			fmt.Printf("FAIL [%s]: got %d want %d\\n", tc.label, got, tc.want)
		}
	}
	fmt.Printf("%d/5 passed\\n", passed)
}`,
    expectedOutput: ["PASS [in range]", "PASS [below min]", "5/5 passed"],
    hint: "clamp: if val < min return min; if val > max return max; else return val.",
  },
  {
    title: "Benchmark: Measuring Performance",
    instruction:
      "Real Go benchmarks use `testing.B`, but you can measure performance manually with `time.Now()`. Compare string `+` concatenation versus `strings.Builder` by building a 500-char string 1000 times each. Print which method was faster.",
    starter: `package main

import (
	"fmt"
	"strings"
	"time"
)

func buildWithPlus(n int) string {
	// TODO: build a string of n 'x' characters using +=
	result := ""
	return result
}

func buildWithBuilder(n int) string {
	// TODO: build a string of n 'x' characters using strings.Builder
	var sb strings.Builder
	return sb.String()
}

func bench(name string, fn func(int) string) time.Duration {
	start := time.Now()
	for i := 0; i < 1000; i++ {
		fn(500)
	}
	return time.Since(start)
}

func main() {
	t1 := bench("plus", buildWithPlus)
	t2 := bench("builder", buildWithBuilder)
	fmt.Printf("string +:         %v\\n", t1)
	fmt.Printf("strings.Builder:  %v\\n", t2)
	if t2 < t1 {
		fmt.Println("Winner: strings.Builder is faster!")
	} else {
		fmt.Println("Winner: string + is faster!")
	}
}`,
    expectedOutput: ["strings.Builder", "faster"],
    hint: "buildWithPlus: use `result += \"x\"` in a for loop. buildWithBuilder: use `sb.WriteByte('x')` in a for loop, then return `sb.String()`.",
  },
];
