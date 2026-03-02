import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "if Statement",
    instruction:
      "An `if` statement runs a block of code only when a condition is true. Check if the variable `x` (set to 15) is greater than 10. If it is, print \"greater than 10\".",
    starter: `package main

import "fmt"

func main() {
	x := 15
	// TODO: if x > 10, print "greater than 10"
	_ = x
}`,
    expectedOutput: ["greater than 10"],
    hint: "if x > 10 { fmt.Println(\"greater than 10\") }",
  },
  {
    title: "if-else",
    instruction:
      "An `if-else` block runs different code depending on the condition. A student scored 72. If the score is 60 or higher print \"Pass\", otherwise print \"Fail\".",
    starter: `package main

import "fmt"

func main() {
	score := 72
	// TODO: print "Pass" if score >= 60, else print "Fail"
	_ = score
}`,
    expectedOutput: ["Pass"],
    hint: "if score >= 60 { fmt.Println(\"Pass\") } else { fmt.Println(\"Fail\") }",
  },
  {
    title: "if with Init Statement",
    instruction:
      "Go lets you run a short statement before the condition in an `if`. Look up the key \"go\" in the map. If it exists, print \"found\". If not, print \"not found\".",
    starter: `package main

import "fmt"

func main() {
	langs := map[string]int{"go": 2009, "python": 1991}
	// TODO: use if v, ok := langs["go"]; ok { ... }
	_ = langs
}`,
    expectedOutput: ["found"],
    hint: "if v, ok := langs[\"go\"]; ok { fmt.Println(\"found:\", v) } else { fmt.Println(\"not found\") }",
  },
  {
    title: "switch Statement",
    instruction:
      "A `switch` statement is a cleaner alternative to a chain of if-else. Given `day := \"Monday\"`, use a switch to print \"Weekday\" for Monday through Friday and \"Weekend\" for Saturday and Sunday.",
    starter: `package main

import "fmt"

func main() {
	day := "Monday"
	// TODO: switch on day, print "Weekday" or "Weekend"
	_ = day
}`,
    expectedOutput: ["Weekday"],
    hint: "switch day { case \"Monday\", \"Tuesday\", ...: fmt.Println(\"Weekday\") case \"Saturday\", \"Sunday\": fmt.Println(\"Weekend\") }",
  },
  {
    title: "FizzBuzz",
    instruction:
      "Classic FizzBuzz: loop from 1 to 15. For multiples of 3 print \"Fizz\", for multiples of 5 print \"Buzz\", for multiples of both print \"FizzBuzz\", otherwise print the number. Check for FizzBuzz first!",
    starter: `package main

import "fmt"

func main() {
	for i := 1; i <= 15; i++ {
		// TODO: FizzBuzz logic
		fmt.Println(i)
	}
}`,
    expectedOutput: ["Fizz", "Buzz", "FizzBuzz"],
    hint: "Check i%15==0 first for FizzBuzz, then i%3==0 for Fizz, then i%5==0 for Buzz, else print i.",
  },
];
