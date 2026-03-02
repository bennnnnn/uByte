import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define a Struct",
    instruction:
      "A `struct` groups related fields together into a single type. Define a `Person` struct with `Name string` and `Age int` fields. Create a Person with name \"Alice\" and age 30, then print both fields on separate lines.",
    starter: `package main

import "fmt"

// TODO: define Person struct with Name and Age

func main() {
	// TODO: create a Person{Name: "Alice", Age: 30} and print Name then Age
}`,
    expectedOutput: ["Alice", "30"],
    hint: "type Person struct { Name string; Age int } — p := Person{Name: \"Alice\", Age: 30} — fmt.Println(p.Name)",
  },
  {
    title: "Struct Method (Value Receiver)",
    instruction:
      "Methods are functions with a receiver. Define a `Greet()` method on `Person` that returns `\"Hi, \" + p.Name + \"!\"`. Create Alice and print the result of calling her `Greet()` method.",
    starter: `package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

// TODO: define Greet() method on Person that returns "Hi, <Name>!"

func main() {
	p := Person{Name: "Alice", Age: 30}
	fmt.Println(p.Greet())
}`,
    expectedOutput: ["Hi, Alice!"],
    hint: "func (p Person) Greet() string { return \"Hi, \" + p.Name + \"!\" }",
  },
  {
    title: "Nested Structs",
    instruction:
      "Structs can contain other structs as fields. Define an `Address` struct with a `City string` field, then add an `Address` field to `Person`. Create a Person in London and print the city.",
    starter: `package main

import "fmt"

// TODO: define Address struct with City field
// TODO: define Person struct with Name and Address fields

func main() {
	p := Person{
		Name:    "Alice",
		Address: Address{City: "London"},
	}
	fmt.Println(p.Address.City)
}`,
    expectedOutput: ["London"],
    hint: "type Address struct { City string } — type Person struct { Name string; Address Address }",
  },
  {
    title: "Anonymous Struct",
    instruction:
      "Sometimes you need a one-off struct without defining a named type. Create an anonymous struct inline with `Name` and `Score` fields, set them to \"Bob\" and 95, and print both.",
    starter: `package main

import "fmt"

func main() {
	// TODO: declare an anonymous struct with Name and Score, then print them
}`,
    expectedOutput: ["Bob", "95"],
    hint: "entry := struct{ Name string; Score int }{Name: \"Bob\", Score: 95} — fmt.Println(entry.Name, entry.Score)",
  },
  {
    title: "Pointer to Struct",
    instruction:
      "`new(T)` allocates a zeroed struct and returns a pointer to it. Use `new(Person)` to allocate a Person, set the Name field to \"Charlie\", then print the name.",
    starter: `package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func main() {
	// TODO: use new(Person), set Name to "Charlie", print Name
}`,
    expectedOutput: ["Charlie"],
    hint: "p := new(Person) — p.Name = \"Charlie\" — fmt.Println(p.Name)",
  },
];
