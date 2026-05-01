import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "I'm a fixed shelf with 3 spots",
    instruction:
      "Declare an array of 3 strings — think of it as a shelf with 3 slots. Each slot starts empty (zero value). Print the whole array to see those empty slots.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: declare nums as an array of 3 ints
\t// TODO: print nums
}`,
    expectedOutput: ["[0 0 0]"],
    hint: "Use `var nums [3]int` and then `fmt.Println(nums)`.",
  },
  {
    title: "Put Books on My Shelves",
    instruction:
      "Create an array of 3 strings named `colors`. Set index 0 to `\"red\"`, index 1 to `\"green\"`, and index 2 to `\"blue\"`. Print the whole array.",
    starter: `package main

import "fmt"

func main() {
\tvar colors [3]string
\t// TODO: assign red, green, blue by index
\tfmt.Println(colors)
}`,
    expectedOutput: ["[red green blue]"],
    hint: "Declare `var colors [3]string`, then assign `colors[0]`, `colors[1]`, and `colors[2]`.",
  },
  {
    title: "Grab the First and Last Book",
    instruction:
      "Create `scores := [4]int{10, 20, 30, 40}`. Print the first value, then print the last value.",
    starter: `package main

import "fmt"

func main() {
\tscores := [4]int{10, 20, 30, 40}
\t// TODO: print the first value
\t// TODO: print the last value
}`,
    expectedOutput: ["10", "40"],
    hint: "The first value is `scores[0]`. The last value is `scores[len(scores)-1]`.",
  },
  {
    title: "Hand Me Each Book One by One",
    instruction:
      "Loop through `[3]int{2, 4, 6}` and print each number on its own line.",
    starter: `package main

import "fmt"

func main() {
\tnums := [3]int{2, 4, 6}
\t// TODO: loop through nums and print each value
}`,
    expectedOutput: ["2", "4", "6"],
    hint: "Use `for i := 0; i < len(nums); i++ { fmt.Println(nums[i]) }`.",
  },
  {
    title: "Add Up All My Page Counts",
    instruction:
      "Sum the values in `[5]int{1, 2, 3, 4, 5}` and print the total.",
    starter: `package main

import "fmt"

func main() {
\tnums := [5]int{1, 2, 3, 4, 5}
\tsum := 0
\t// TODO: add each array element to sum
\tfmt.Println(sum)
}`,
    expectedOutput: ["15"],
    hint: "Start with `sum := 0`, then add each element inside a loop.",
  },
];
