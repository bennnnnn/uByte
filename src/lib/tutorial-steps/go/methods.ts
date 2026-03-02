import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Value Receiver — Area",
    instruction:
      "A value receiver gets a copy of the struct. Define a `Rectangle` struct with `Width` and `Height` fields and an `Area() int` method. Create a 5×10 rectangle and print its area.",
    starter: `package main

import "fmt"

// TODO: define Rectangle struct with Width and Height
// TODO: define Area() method on Rectangle

func main() {
	r := Rectangle{Width: 5, Height: 10}
	fmt.Println(r.Area())
}`,
    expectedOutput: ["50"],
    hint: "func (r Rectangle) Area() int { return r.Width * r.Height }",
  },
  {
    title: "Pointer Receiver — Increment",
    instruction:
      "A pointer receiver lets a method modify the original struct. Define a `Counter` struct with a `Count int` field and an `Increment()` method using a pointer receiver. Create a counter, call Increment three times, and print the count.",
    starter: `package main

import "fmt"

// TODO: define Counter struct and Increment() method with pointer receiver

func main() {
	c := Counter{}
	c.Increment()
	c.Increment()
	c.Increment()
	fmt.Println(c.Count)
}`,
    expectedOutput: ["3"],
    hint: "func (c *Counter) Increment() { c.Count++ }",
  },
  {
    title: "Stringer Interface",
    instruction:
      "If a type implements `String() string`, `fmt.Println` calls it automatically. Define a `Person` struct and a `String()` method that returns `\"<Name> (<Age>)\"`. Print a Person and see the custom format appear.",
    starter: `package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

// TODO: define String() method on Person returning "<Name> (<Age>)"

func main() {
	p := Person{Name: "Alice", Age: 30}
	fmt.Println(p)
}`,
    expectedOutput: ["Alice (30)"],
    hint: "func (p Person) String() string { return fmt.Sprintf(\"%s (%d)\", p.Name, p.Age) }",
  },
  {
    title: "Method Chaining (Builder)",
    instruction:
      "Returning `*Builder` from each method allows chaining calls. A `Builder` with an `Add(s string) *Builder` method and a `Build() string` method is provided. Chain two `Add` calls to produce \"Hello World\" then print it.",
    starter: `package main

import "fmt"

type Builder struct {
	result string
}

func (b *Builder) Add(s string) *Builder {
	if b.result != "" {
		b.result += " "
	}
	b.result += s
	return b
}

func (b *Builder) Build() string {
	return b.result
}

func main() {
	// TODO: chain .Add("Hello").Add("World") and print Build()
}`,
    expectedOutput: ["Hello World"],
    hint: "b := &Builder{} — fmt.Println(b.Add(\"Hello\").Add(\"World\").Build())",
  },
];
