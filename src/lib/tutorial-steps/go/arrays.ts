import type { TutorialStep } from "../types";

/** TS fallback for the "arrays" tutorial — used when content/go/arrays.steps.json is inaccessible. */
export const steps: TutorialStep[] = [
  {
    title: "Declare an Array",
    instruction: "Declare an array of 3 integers named `nums`, then print the whole array. It should print the zero values.",
    starter: `package main

import "fmt"

func main() {
	// TODO: declare nums as an array of 3 ints
	// TODO: print nums
}`,
    expectedOutput: ["[0 0 0]"],
    hint: "Use `var nums [3]int` and then `fmt.Println(nums)`.",
  },
  {
    title: "Assign by Index",
    instruction: 'Create an array of 3 strings named `colors`. Set index 0 to `"red"`, index 1 to `"green"`, and index 2 to `"blue"`. Print the whole array.',
    starter: `package main

import "fmt"

func main() {
	var colors [3]string
	// TODO: assign red, green, blue by index
	fmt.Println(colors)
}`,
    expectedOutput: ["[red green blue]"],
    hint: "Declare `var colors [3]string`, then assign `colors[0]`, `colors[1]`, and `colors[2]`.",
  },
  {
    title: "First and Last Value",
    instruction: "Create `scores := [4]int{10, 20, 30, 40}`. Print the first value, then print the last value.",
    starter: `package main

import "fmt"

func main() {
	scores := [4]int{10, 20, 30, 40}
	// TODO: print the first value
	// TODO: print the last value
}`,
    expectedOutput: ["10", "40"],
    hint: "The first value is `scores[0]`. The last value is `scores[len(scores)-1]`.",
  },
  {
    title: "Loop Through an Array",
    instruction: "Loop through `[3]int{2, 4, 6}` and print each number on its own line.",
    starter: `package main

import "fmt"

func main() {
	nums := [3]int{2, 4, 6}
	// TODO: loop through nums and print each value
}`,
    expectedOutput: ["2", "4", "6"],
    hint: "Use `for i := 0; i < len(nums); i++ { fmt.Println(nums[i]) }`.",
  },
  {
    title: "Sum an Array",
    instruction: "Sum the values in `[5]int{1, 2, 3, 4, 5}` and print the total.",
    starter: `package main

import "fmt"

func main() {
	nums := [5]int{1, 2, 3, 4, 5}
	sum := 0
	// TODO: add each array element to sum
	fmt.Println(sum)
}`,
    expectedOutput: ["15"],
    hint: "Start with `sum := 0`, then add each element inside a loop.",
  },
];
