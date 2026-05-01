import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Shelf Numbers (Basic for loop)",
    instruction:
      "Print shelf numbers 1 through 5, one per line. I've set up `i := 1` — you just need to give me the condition and the increment so I know when to stop and how to count.",
    starter: `package main

import "fmt"

func main() {
\t// I count shelves — tell me when to stop and what to do after each one
\tfor i := 1; /* TODO: condition */; /* TODO: increment */ {
\t\tfmt.Println(i)
\t}
}`,
    expectedOutput: ["1", "2", "3", "4", "5"],
    hint: "for i := 1; i <= 5; i++ { fmt.Println(i) }",
  },
  {
    title: "Overdue Countdown (While-style loop)",
    instruction:
      "A book is 3 days overdue. Count down 3, 2, 1 using a while-style loop (just a condition, no init or post), then print `\"Returned!\"` after the loop.",
    starter: `package main

import "fmt"

func main() {
\tdays := 3
\t// I keep going as long as days > 0 — print days, then subtract 1
\t// TODO: write my loop header (just a condition, that's all I need)
\t{
\t\tfmt.Println(days)
\t\tdays--
\t}
\t// TODO: tell me to announce we're done after the loop
\t_ = days
}`,
    expectedOutput: ["3", "2", "1", "Returned!"],
    hint: "for days > 0 { fmt.Println(days); days-- } — then fmt.Println(\"Returned!\")",
  },
  {
    title: "Book Titles (Range over slice)",
    instruction:
      "I've got a list of books: Dune, Neuromancer, Snow Crash. Use `for range` to loop over them and print each title. I give you both an index and a value — you can ignore the index with `_`.",
    starter: `package main

import "fmt"

func main() {
\tbooks := []string{"Dune", "Neuromancer", "Snow Crash"}
\t// I'll give you each book one by one — tell me what to do with it
\t// TODO: range over books and print each title
\t_ = books
}`,
    expectedOutput: ["Dune", "Neuromancer", "Snow Crash"],
    hint: "for _, title := range books { fmt.Println(title) }",
  },
  {
    title: "Damaged Books (break and continue)",
    instruction:
      "Scan shelves 1 through 6. If a shelf number is even, skip it with `continue` — it's damaged. If it's greater than 5, stop entirely with `break`. Only print 1, 3, and 5.",
    starter: `package main

import "fmt"

func main() {
\tfor shelf := 1; shelf <= 6; shelf++ {
\t\t// TODO: tell me to skip even shelves (they're damaged)
\t\t// TODO: tell me to stop when shelf > 5
\t\t// TODO: otherwise print the shelf number
\t}
}`,
    expectedOutput: ["1", "3", "5"],
    hint: "if shelf%2 == 0 { continue } — if shelf > 5 { break } — fmt.Println(shelf)",
  },
  {
    title: "Total Pages (Sum with a loop)",
    instruction:
      "Five books have page counts: 120, 340, 275, 190, 410. Loop over the slice and add each page count to `total`, then print the total.",
    starter: `package main

import "fmt"

func main() {
\tpages := []int{120, 340, 275, 190, 410}
\ttotal := 0
\t// TODO: loop over pages and add each one to total
\tfmt.Println(total)
}`,
    expectedOutput: ["1335"],
    hint: "for _, p := range pages { total += p }",
  },
];
