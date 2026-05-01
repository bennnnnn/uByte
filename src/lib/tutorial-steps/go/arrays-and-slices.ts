import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Book Genre Slice",
    instruction:
      "The library tracks genres in a dynamic list. Declare a slice of strings containing \"fiction\", \"nonfiction\", and \"science\" using a slice literal, then print the whole slice.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: declare a slice of strings with "fiction", "nonfiction", "science"
\t// TODO: print the slice
}`,
    expectedOutput: ["fiction", "nonfiction", "science"],
    hint: "genres := []string{\"fiction\", \"nonfiction\", \"science\"} — then fmt.Println(genres)",
  },
  {
    title: "Append New Books",
    instruction:
      "The library just acquired a new category. Start with a slice of 3 genres, append \"history\" using the built-in `append` function, and print the new length with `len()`.",
    starter: `package main

import "fmt"

func main() {
\tgenres := []string{"fiction", "nonfiction", "science"}
\t// TODO: append "history" to genres
\t// TODO: print the length of the new slice
}`,
    expectedOutput: ["4"],
    hint: "genres = append(genres, \"history\") — then fmt.Println(len(genres))",
  },
  {
    title: "Slice a Subset of Bookshelves",
    instruction:
      "You can view a range of shelves with `s[low:high]` — it includes index `low` but excludes `high`. From the shelf numbers slice `[10, 20, 30, 40, 50]`, extract and print the middle three shelves: 20, 30, and 40.",
    starter: `package main

import "fmt"

func main() {
\tshelves := []int{10, 20, 30, 40, 50}
\t// TODO: slice shelves to get [20, 30, 40] and print it
\t_ = shelves
}`,
    expectedOutput: ["20", "30", "40"],
    hint: "fmt.Println(shelves[1:4]) gives [20 30 40]",
  },
  {
    title: "Sum Total Books (Range)",
    instruction:
      "Use `for range` to iterate over a slice and accumulate a total. Sum all book counts in the slice `[12, 25, 8, 40, 15]` and print the total.",
    starter: `package main

import "fmt"

func main() {
\tbooks := []int{12, 25, 8, 40, 15}
\ttotal := 0
\t// TODO: range over books and add each value to total
\tfmt.Println(total)
}`,
    expectedOutput: ["100"],
    hint: "for _, v := range books { total += v }",
  },
  {
    title: "2D Library Grid",
    instruction:
      "A slice of slices creates a 2D grid. Create a 2x2 shelf grid, set the element at row 1, column 1 to 99 (books), then print that single element.",
    starter: `package main

import "fmt"

func main() {
\tgrid := [][]int{
\t\t{1, 2},
\t\t{3, 4},
\t}
\t// TODO: set grid[1][1] to 99 and print it
\t_ = grid
}`,
    expectedOutput: ["99"],
    hint: "grid[1][1] = 99 — then fmt.Println(grid[1][1])",
  },
];
