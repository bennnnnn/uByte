import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define an Interface",
    instruction:
      "An interface defines a set of method signatures. Any type that has those methods satisfies the interface — no explicit declaration needed. Define a `Speaker` interface with `Speak() string`. Implement it on a `Dog` struct and print the result of calling `Speak()`.",
    starter: `package main

import "fmt"

// TODO: define Speaker interface with Speak() string
// TODO: define Dog struct and implement Speak() returning "Woof"

func main() {
	var s Speaker = Dog{}
	fmt.Println(s.Speak())
}`,
    expectedOutput: ["Woof"],
    hint: "type Speaker interface { Speak() string } — type Dog struct{} — func (d Dog) Speak() string { return \"Woof\" }",
  },
  {
    title: "Implicit Implementation",
    instruction:
      "Both `Dog` and `Cat` implement `Speaker` without any explicit declaration. Create a slice of Speakers containing a Dog and a Cat, loop over it, and print what each one says.",
    starter: `package main

import "fmt"

type Speaker interface {
	Speak() string
}

type Dog struct{}
type Cat struct{}

func (d Dog) Speak() string { return "Woof" }
func (c Cat) Speak() string { return "Meow" }

func main() {
	// TODO: create []Speaker with Dog{} and Cat{}, range over it and print Speak()
}`,
    expectedOutput: ["Meow", "Woof"],
    hint: "animals := []Speaker{Dog{}, Cat{}} — for _, a := range animals { fmt.Println(a.Speak()) }",
  },
  {
    title: "Interface as Parameter",
    instruction:
      "Accepting an interface as a parameter makes a function work with any type that satisfies it. Define `makeNoise(s Speaker)` that calls `fmt.Println(s.Speak())`. Create a `Lion` with `Speak()` returning \"Roar\" and pass it to `makeNoise`.",
    starter: `package main

import "fmt"

type Speaker interface {
	Speak() string
}

// TODO: define makeNoise(s Speaker)
// TODO: define Lion struct and Speak() method returning "Roar"

func main() {
	makeNoise(Lion{})
}`,
    expectedOutput: ["Roar"],
    hint: "func makeNoise(s Speaker) { fmt.Println(s.Speak()) } — type Lion struct{} — func (l Lion) Speak() string { return \"Roar\" }",
  },
  {
    title: "Type Assertion",
    instruction:
      "A type assertion `v.(T)` extracts the concrete type from an interface value. Given a `Speaker` holding a `Dog`, assert it to `Dog` and print the breed field.",
    starter: `package main

import "fmt"

type Speaker interface {
	Speak() string
}

type Dog struct {
	Breed string
}

func (d Dog) Speak() string { return "Woof" }

func main() {
	var s Speaker = Dog{Breed: "Labrador"}
	// TODO: assert s to Dog and print the Breed field
}`,
    expectedOutput: ["Labrador"],
    hint: "d, ok := s.(Dog) — if ok { fmt.Println(d.Breed) }",
  },
  {
    title: "Empty Interface (any)",
    instruction:
      "`any` (alias for `interface{}`) accepts a value of any type. Define `printAny(v any)` that prints the value. Call it with the integer 42 and the string \"hello\".",
    starter: `package main

import "fmt"

// TODO: define printAny(v any) that prints v

func main() {
	printAny(42)
	printAny("hello")
}`,
    expectedOutput: ["42", "hello"],
    hint: "func printAny(v any) { fmt.Println(v) }",
  },
];
