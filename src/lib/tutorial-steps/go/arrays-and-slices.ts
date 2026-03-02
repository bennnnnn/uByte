import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Declare a Slice",
    instruction:
      "Slices are Go's dynamic arrays. Declare a slice of strings containing \"go\", \"python\", and \"rust\" using a slice literal, then print the whole slice.",
    starter: `package main

import "fmt"

func main() {
	// TODO: declare a slice of strings with "go", "python", "rust"
	// TODO: print the slice
}`,
    expectedOutput: ["go", "python", "rust"],
    hint: "langs := []string{\"go\", \"python\", \"rust\"} — then fmt.Println(langs)",
  },
  {
    title: "Append to a Slice",
    instruction:
      "The built-in `append` function adds elements to a slice and returns a new slice. Start with a slice of 3 languages, append \"java\", and print the new length using `len()`.",
    starter: `package main

import "fmt"

func main() {
	langs := []string{"go", "python", "rust"}
	// TODO: append "java" to langs
	// TODO: print the length of the new slice
}`,
    expectedOutput: ["4"],
    hint: "langs = append(langs, \"java\") — then fmt.Println(len(langs))",
  },
  {
    title: "Slice a Slice",
    instruction:
      "You can take a sub-slice with `s[low:high]` — it includes index `low` but excludes `high`. From the numbers slice `[1, 2, 3, 4, 5]`, extract and print the middle three elements: 2, 3, and 4.",
    starter: `package main

import "fmt"

func main() {
	nums := []int{1, 2, 3, 4, 5}
	// TODO: slice nums to get [2, 3, 4] and print it
	_ = nums
}`,
    expectedOutput: ["2", "3"],
    hint: "fmt.Println(nums[1:4]) gives [2 3 4]",
  },
  {
    title: "Range to Sum a Slice",
    instruction:
      "Use `for range` to iterate over a slice and accumulate a total. Sum all values in the numbers slice `[1, 2, 3, 4, 5]` and print the result.",
    starter: `package main

import "fmt"

func main() {
	nums := []int{1, 2, 3, 4, 5}
	sum := 0
	// TODO: range over nums and add each value to sum
	fmt.Println(sum)
}`,
    expectedOutput: ["15"],
    hint: "for _, v := range nums { sum += v }",
  },
  {
    title: "2D Slice",
    instruction:
      "A slice of slices creates a 2D grid. Create a 2x2 grid, set the element at row 1, column 1 to 99, then print that single element.",
    starter: `package main

import "fmt"

func main() {
	grid := [][]int{
		{1, 2},
		{3, 4},
	}
	// TODO: set grid[1][1] to 99 and print it
	_ = grid
}`,
    expectedOutput: ["99"],
    hint: "grid[1][1] = 99 — then fmt.Println(grid[1][1])",
  },
];
