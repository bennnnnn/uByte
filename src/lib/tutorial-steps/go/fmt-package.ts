import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Println Basics",
    instruction:
      "`fmt.Println()` adds a newline after each call and puts spaces between multiple arguments. Print \"Hello\" on one line and \"World\" on the next line using two Println calls.",
    starter: `package main

import "fmt"

func main() {
	// TODO: print "Hello" on one line
	// TODO: print "World" on the next line
}`,
    expectedOutput: ["Hello", "World"],
    hint: "Two separate fmt.Println() calls, each with one argument.",
  },
  {
    title: "Printf with %s and %d",
    instruction:
      "`fmt.Printf()` formats output using verbs: `%s` for strings and `%d` for integers. Always end with `\\n` for a newline. Print the message \"Name: Alice, Age: 30\" using Printf.",
    starter: `package main

import "fmt"

func main() {
	name := "Alice"
	age := 30
	// TODO: use Printf to print "Name: Alice, Age: 30"
	_ = name
	_ = age
}`,
    expectedOutput: ["Alice", "30"],
    hint: "fmt.Printf(\"Name: %s, Age: %d\\n\", name, age)",
  },
  {
    title: "Float Formatting",
    instruction:
      "Use `%.2f` to print a float with exactly 2 decimal places. Print the value of Pi (3.14159) formatted to 2 decimal places, so the output shows \"3.14\".",
    starter: `package main

import "fmt"

func main() {
	pi := 3.14159
	// TODO: print pi with 2 decimal places using %.2f
	_ = pi
}`,
    expectedOutput: ["3.14"],
    hint: "fmt.Printf(\"%.2f\\n\", pi) will output 3.14.",
  },
  {
    title: "Build a URL with Sprintf",
    instruction:
      "`fmt.Sprintf()` returns a formatted string without printing. Use it to build the URL string `\"http://localhost:8080/api\"` from the variables `host` and `port`, store it, then print it.",
    starter: `package main

import "fmt"

func main() {
	host := "localhost"
	port := 8080
	// TODO: use Sprintf to build "http://localhost:8080/api"
	url := ""
	_ = host
	_ = port
	fmt.Println(url)
}`,
    expectedOutput: ["localhost:8080"],
    hint: "url := fmt.Sprintf(\"http://%s:%d/api\", host, port)",
  },
  {
    title: "Any Type with %v and %T",
    instruction:
      "`%v` prints any value in its default format. `%T` prints the type name. Print the integer 42 and the string \"hello\" each on their own line, showing both the value and its type.",
    starter: `package main

import "fmt"

func main() {
	n := 42
	s := "hello"
	// TODO: for each, print: "<value> is of type <type>"
	_ = n
	_ = s
}`,
    expectedOutput: ["int", "string"],
    hint: "fmt.Printf(\"%v is of type %T\\n\", n, n) — then do the same for s.",
  },
];
