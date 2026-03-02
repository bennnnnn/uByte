import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Basic for Loop",
    instruction:
      "Go has only one loop keyword: `for`. The classic form is `for init; condition; post { }`. Write a loop that prints the numbers 1 through 5, each on its own line.",
    starter: `package main

import "fmt"

func main() {
	// TODO: print numbers 1 to 5 using a for loop
}`,
    expectedOutput: ["1", "2", "3", "4", "5"],
    hint: "for i := 1; i <= 5; i++ { fmt.Println(i) }",
  },
  {
    title: "While-Style Loop",
    instruction:
      "When you omit the init and post parts, `for` acts like a while loop. Use this style to count down from 3 to 1, printing each number, then print \"Liftoff!\" after the loop.",
    starter: `package main

import "fmt"

func main() {
	n := 3
	// TODO: loop while n > 0, print n, then decrement n
	// TODO: after the loop, print "Liftoff!"
	_ = n
}`,
    expectedOutput: ["3", "2", "1", "Liftoff!"],
    hint: "for n > 0 { fmt.Println(n); n-- } — then fmt.Println(\"Liftoff!\")",
  },
  {
    title: "Range over Slice",
    instruction:
      "`for range` iterates over a slice giving you the index and value. Loop over the fruits slice and print each fruit name on its own line.",
    starter: `package main

import "fmt"

func main() {
	fruits := []string{"apple", "banana", "cherry"}
	// TODO: range over fruits and print each fruit
	_ = fruits
}`,
    expectedOutput: ["apple", "banana", "cherry"],
    hint: "for _, fruit := range fruits { fmt.Println(fruit) }",
  },
  {
    title: "break and continue",
    instruction:
      "`break` exits a loop immediately and `continue` skips to the next iteration. Loop from 1 to 6. Skip even numbers with `continue` and stop if the number exceeds 5 with `break`. You should print only 1, 3, and 5.",
    starter: `package main

import "fmt"

func main() {
	for i := 1; i <= 6; i++ {
		// TODO: if i is even, continue; if i > 5, break; else print i
	}
}`,
    expectedOutput: ["1", "3", "5"],
    hint: "if i%2 == 0 { continue } — if i > 5 { break } — fmt.Println(i)",
  },
  {
    title: "Sum with a Loop",
    instruction:
      "Accumulate a running total with a loop. Sum all integers from 1 to 10 and print the result. The answer should be 55.",
    starter: `package main

import "fmt"

func main() {
	sum := 0
	// TODO: loop from 1 to 10 and add each value to sum
	fmt.Println(sum)
}`,
    expectedOutput: ["55"],
    hint: "for i := 1; i <= 10; i++ { sum += i }",
  },
];
