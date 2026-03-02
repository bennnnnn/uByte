import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Hello, World!",
    instruction:
      "Every Go program needs two things: `package main` to tell the compiler this is an executable, and `func main()` as the entry point where execution starts. The `fmt.Println()` function prints a line of text. Click Run to see your first Go program in action.",
    starter: `package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}`,
    expectedOutput: ["Hello, World!"],
    hint: "The program is already complete — just click Run and watch the output appear.",
  },
  {
    title: "Print Multiple Lines",
    instruction:
      "You can call `fmt.Println()` as many times as you like — each call prints one line. Update the program to print two lines: one that contains the word \"Go\" and one that contains the word \"Gopher\".",
    starter: `package main

import "fmt"

func main() {
	fmt.Println("I am learning Go")
	// TODO: print a second line containing the word "Gopher"
}`,
    expectedOutput: ["Go", "Gopher"],
    hint: "Add a second fmt.Println() call below the first one. Any string containing \"Go\" and \"Gopher\" will pass.",
  },
  {
    title: "Use Printf",
    instruction:
      "`fmt.Printf()` lets you format output using verbs. `%s` inserts a string, `%d` inserts an integer, and `\\n` adds a newline. Use Printf to print the message \"Learning Go version 1\" where the language and version come from variables.",
    starter: `package main

import "fmt"

func main() {
	language := "Go"
	version := 1
	// TODO: use fmt.Printf to print "Learning Go version 1"
	_ = language
	_ = version
}`,
    expectedOutput: ["Learning Go"],
    hint: "fmt.Printf(\"%s version %d\\n\", language, version) will produce the expected output.",
  },
  {
    title: "Use Sprintf",
    instruction:
      "`fmt.Sprintf()` works like Printf but returns a formatted string instead of printing it. This is useful when you need to build a string to store or pass to another function. Build the greeting string \"Hello, Gopher!\" using Sprintf, then print it.",
    starter: `package main

import "fmt"

func main() {
	name := "Gopher"
	// TODO: use fmt.Sprintf to build "Hello, Gopher!" and store it in greeting
	greeting := ""
	_ = name
	fmt.Println(greeting)
}`,
    expectedOutput: ["Hello, Gopher!"],
    hint: "greeting := fmt.Sprintf(\"Hello, %s!\", name) — then the existing fmt.Println(greeting) will print it.",
  },
  {
    title: "Add Comments",
    instruction:
      "Comments explain your code to other developers. Single-line comments start with `//` and are ignored by the compiler. Add a `//` comment above the Println call describing what it does, then make sure the program prints \"Comments done!\".",
    starter: `package main

import "fmt"

func main() {
	// TODO: add a comment here describing what the next line does
	fmt.Println("Comments done!")
}`,
    expectedOutput: ["Comments done!"],
    hint: "A comment looks like: // This prints a confirmation message. The comment doesn't affect what's printed.",
  },
];
