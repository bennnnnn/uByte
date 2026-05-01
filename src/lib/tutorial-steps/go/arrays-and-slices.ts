import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "I Can Hold a List of Book Genres",
    instruction:
      "Slices are like arrays that can grow. Declare a slice of strings containing genres: `\"fiction\"`, `\"non-fiction\"`, `\"science\"` — then print the whole slice.",
    starter: `package main

import "fmt"

func main() {
\t// TODO: declare a slice of strings with "fiction", "non-fiction", "science"
\t// TODO: print the slice
}`,
    expectedOutput: ["fiction", "non-fiction", "science"],
    hint: 'genres := []string{"fiction", "non-fiction", "science"} — then fmt.Println(genres)',
  },
  {
    title: "The Library Got New Books — Add Them to Me",
    instruction:
      "Use `append` to add new items to a slice. Start with 3 genres, append `\"history\"`, and print the new length using `len()`.",
    starter: `package main

import "fmt"

func main() {
\tgenres := []string{"fiction", "non-fiction", "science"}
\t// TODO: append "history" to genres
\t// TODO: print the length of the new slice
}`,
    expectedOutput: ["4"],
    hint: 'genres = append(genres, "history") — then fmt.Println(len(genres))',
  },
  {
    title: "Show Me Just the Middle Shelves",
    instruction:
      "You can take a sub-slice with `s[low:high]` — it includes `low` but excludes `high`. From the shelf numbers `[10, 20, 30, 40, 50]`, extract and print the middle three: 20, 30, 40.",
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
    title: "Count All Books on These Shelves",
    instruction:
      "Use `for range` to iterate over a slice and accumulate a total. Sum all values in `[12, 25, 8, 40, 15]` and print the result.",
    starter: `package main

import "fmt"

func main() {
\tcounts := []int{12, 25, 8, 40, 15}
\ttotal := 0
\t// TODO: range over counts and add each value to total
\tfmt.Println(total)
}`,
    expectedOutput: ["100"],
    hint: "for _, v := range counts { total += v }",
  },
  {
    title: "A 2D Grid — Sections and Shelves",
    instruction:
      "A slice of slices creates a 2D grid. Create a 2x2 grid, set the element at row 1, column 1 to 99, then print that single element.",
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
