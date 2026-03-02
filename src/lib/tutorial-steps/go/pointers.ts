import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Address and Dereference",
    instruction:
      "`&x` gives you the memory address of `x` (a pointer). `*p` dereferences a pointer to get the value it points to. Declare `x := 42`, store its address in `p`, then print the value via `*p`.",
    starter: `package main

import "fmt"

func main() {
	x := 42
	// TODO: store &x in p, then print *p
	_ = x
}`,
    expectedOutput: ["42"],
    hint: "p := &x — then fmt.Println(*p)",
  },
  {
    title: "Modify via Pointer",
    instruction:
      "Passing a pointer lets a function modify the original variable. Define `double(p *int)` that multiplies the value at `p` by 2. Call it with `&x` where `x` starts at 42, then print `x`.",
    starter: `package main

import "fmt"

// TODO: define double(p *int) that doubles *p

func main() {
	x := 42
	double(&x)
	fmt.Println(x)
}`,
    expectedOutput: ["84"],
    hint: "func double(p *int) { *p = *p * 2 }",
  },
  {
    title: "Pointer to Struct",
    instruction:
      "You can take a pointer to a struct and modify its fields directly — Go automatically dereferences struct pointers for field access. Create a `Person` struct with a `Name` field, make a pointer to it, update the name to \"Alice\" through the pointer, then print the name.",
    starter: `package main

import "fmt"

type Person struct {
	Name string
}

func main() {
	p := &Person{Name: "Bob"}
	// TODO: change p.Name to "Alice" via the pointer, then print it
	_ = p
}`,
    expectedOutput: ["Alice"],
    hint: "p.Name = \"Alice\" — then fmt.Println(p.Name)",
  },
  {
    title: "Swap with Pointers",
    instruction:
      "Implement a `swap(a, b *int)` function that swaps two integers using pointers. Start with `x = 10` and `y = 20`, call swap, then print `x` and `y` to confirm they've been exchanged.",
    starter: `package main

import "fmt"

// TODO: define swap(a, b *int)

func main() {
	x, y := 10, 20
	swap(&x, &y)
	fmt.Println(x)
	fmt.Println(y)
}`,
    expectedOutput: ["20", "10"],
    hint: "func swap(a, b *int) { *a, *b = *b, *a }",
  },
];
