import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Shelf Numbers (Basic for loop)",
    instruction:
      "Use a basic `for` loop to print shelf numbers 1 through 5. Each shelf number must appear on its own line. The loop pattern is: `for init; condition; post { }`.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: print shelf numbers 1 to 5 using a for loop
}`,
    expectedOutput: ["1", "2", "3", "4", "5"],
    hint: "for i := 1; i <= 5; i++ { fmt.Println(i) }",
  },
  {
    title: "Overdue Countdown (While-style loop)",
    instruction:
      "A book is 3 days overdue. Count down from 3 to 1 using a while-style `for` loop (omit init and post), then print \"Returned!\" after the loop. Print each number on its own line.",
    starter: `package main

import "fmt"

func main() {
\tdays := 3
\t// TODO: loop while days > 0, print days, then decrement
\t// TODO: after the loop, print "Returned!"
\t_ = days
}`,
    expectedOutput: ["3", "2", "1", "Returned!"],
    hint: "for days > 0 { fmt.Println(days); days-- } — then fmt.Println(\"Returned!\")",
  },
  {
    title: "Book Titles (Range over slice)",
    instruction:
      "Range over a slice of book titles and print each one. Use `for range` which gives you an index and a value. Print only the title (ignore the index).",
    starter: `package main

import "fmt"

func main() {
\tbooks := []string{"Dune", "Neuromancer", "Snow Crash"}
\t// TODO: range over books and print each title
\t_ = books
}`,
    expectedOutput: ["Dune", "Neuromancer", "Snow Crash"],
    hint: "for _, title := range books { fmt.Println(title) }",
  },
  {
    title: "Damaged Books (break and continue)",
    instruction:
      "Scan shelves 1 through 6. Skip damaged shelves (even numbers) with `continue` and stop scanning at shelf 5 with `break`. Only print 1, 3, and 5 — the undamaged shelves.",
    starter: `package main

import "fmt"

func main() {
\tfor shelf := 1; shelf <= 6; shelf++ {
\t\t// TODO: if shelf is even, continue (damaged); if shelf > 5, break; else print shelf
\t}
}`,
    expectedOutput: ["1", "3", "5"],
    hint: "if shelf%2 == 0 { continue } — if shelf > 5 { break } — fmt.Println(shelf)",
  },
  {
    title: "Total Pages (Sum with a loop)",
    instruction:
      "Five books have page counts: 120, 340, 275, 190, 410. Sum them with a loop over a slice and print the total pages.",
    starter: `package main

import "fmt"

func main() {
\tpages := []int{120, 340, 275, 190, 410}
\ttotal := 0
\t// TODO: loop over pages and add each to total
\tfmt.Println(total)
}`,
    expectedOutput: ["1335"],
    hint: "for _, p := range pages { total += p }",
  },
];
