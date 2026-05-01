import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
	{
		title: "Address and Dereference",
		instruction:
			"`&book` gives you the memory address of `book` (a pointer). `*p` dereferences a pointer to get the value it points to. Declare `book := \"The Great Gatsby\"`, store its address in `p`, then print the value via `*p`.",
		starter: `package main

import "fmt"

func main() {
	book := "The Great Gatsby"
	// TODO: store &book in p, then print *p
	_ = book
}`,
		expectedOutput: ["The Great Gatsby"],
		hint: 'p := &book — then fmt.Println(*p)',
	},
	{
		title: "Modify via Pointer",
		instruction:
			"Passing a pointer lets a function modify the original variable. Define `increaseCount(p *int)` that increments the value at `p` by 1. Call it with `&copies` where `copies` starts at 3, then print `copies`.",
		starter: `package main

import "fmt"

// TODO: define increaseCount(p *int) that increments *p by 1

func main() {
	copies := 3
	increaseCount(&copies)
	fmt.Println(copies)
}`,
		expectedOutput: ["4"],
		hint: "func increaseCount(p *int) { *p++ }",
	},
	{
		title: "Pointer to Struct",
		instruction:
			"You can take a pointer to a struct and modify its fields directly — Go automatically dereferences struct pointers for field access. Create a `Librarian` struct with a `Name` field, make a pointer to it, update the name to \"Alice\" through the pointer, then print the name.",
		starter: `package main

import "fmt"

type Librarian struct {
	Name string
}

func main() {
	l := &Librarian{Name: "Bob"}
	// TODO: change l.Name to "Alice" via the pointer, then print it
	_ = l
}`,
		expectedOutput: ["Alice"],
		hint: 'l.Name = "Alice" — then fmt.Println(l.Name)',
	},
	{
		title: "Swap with Pointers",
		instruction:
			"Implement a `swap(a, b *string)` function that swaps two book titles using pointers. Start with `shelfA = \"Dune\"` and `shelfB = \"Neuromancer\"`, call swap, then print both to confirm they've been exchanged.",
		starter: `package main

import "fmt"

// TODO: define swap(a, b *string)

func main() {
	shelfA, shelfB := "Dune", "Neuromancer"
	swap(&shelfA, &shelfB)
	fmt.Println(shelfA)
	fmt.Println(shelfB)
}`,
		expectedOutput: ["Neuromancer", "Dune"],
		hint: 'func swap(a, b *string) { *a, *b = *b, *a }',
	},
];
