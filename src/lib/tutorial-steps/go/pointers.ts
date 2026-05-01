import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Address and Dereference",
    instruction:
      "`&x` gives you the memory address of `x`. `*p` dereferences the pointer to get the value back. Declare `book := \"The Great Gatsby\"`, store its address in `p`, then print the value through `*p`.",
    starter: `package main

import "fmt"

func main() {
\tbook := "The Great Gatsby"
\t// TODO: store &book in p, then print *p
\t_ = book
}`,
    expectedOutput: ["The Great Gatsby"],
    hint: 'p := &book — then fmt.Println(*p)',
  },
  {
    title: "Modify via Pointer",
    instruction:
      "Passing a pointer lets a function modify the original variable. Define `increaseCount(p *int)` that increments `*p` by 1. Call it with `&copies` (start at 3), then print copies.",
    starter: `package main

import "fmt"

// TODO: define increaseCount(p *int) that increments *p by 1

func main() {
\tcopies := 3
\tincreaseCount(&copies)
\tfmt.Println(copies)
}`,
    expectedOutput: ["4"],
    hint: "func increaseCount(p *int) { *p++ }",
  },
  {
    title: "Pointer to Struct",
    instruction:
      "Create a `Librarian` struct with a `Name` field, make a pointer to it, set the name to `\"Alice\"` through the pointer, and print the name. Go auto-dereferences struct pointers so you can write `p.Name` directly.",
    starter: `package main

import "fmt"

type Librarian struct {
\tName string
}

func main() {
\tl := &Librarian{Name: "Bob"}
\t// TODO: change l.Name to "Alice" through the pointer, then print it
\t_ = l
}`,
    expectedOutput: ["Alice"],
    hint: 'l.Name = "Alice" — then fmt.Println(l.Name)',
  },
  {
    title: "Swap with Pointers",
    instruction:
      "Implement `swap(a, b *string)` that exchanges two book titles. Start with `shelfA = \"Dune\"` and `shelfB = \"Neuromancer\"`, call swap, then print both — they should be swapped.",
    starter: `package main

import "fmt"

// TODO: define swap(a, b *string)

func main() {
\tshelfA, shelfB := "Dune", "Neuromancer"
\tswap(&shelfA, &shelfB)
\tfmt.Println(shelfA)
\tfmt.Println(shelfB)
}`,
    expectedOutput: ["Neuromancer", "Dune"],
    hint: 'func swap(a, b *string) { *a, *b = *b, *a }',
  },
];
