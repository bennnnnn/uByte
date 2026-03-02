import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Create a Map",
    instruction:
      "Maps store key-value pairs. Create a `map[string]int` with three entries: \"alice\" → 30, \"bob\" → 25, \"carol\" → 35. Then print alice's age.",
    starter: `package main

import "fmt"

func main() {
	// TODO: create a map with alice=30, bob=25, carol=35
	// TODO: print alice's age
}`,
    expectedOutput: ["alice", "30"],
    hint: "ages := map[string]int{\"alice\": 30, \"bob\": 25, \"carol\": 35} — fmt.Println(\"alice\", ages[\"alice\"])",
  },
  {
    title: "Check if a Key Exists",
    instruction:
      "Map lookups return two values: the value and a boolean `ok`. If the key is missing, `ok` is false and the value is the zero value. Look up \"go\" in the langs map; if found print \"found\", otherwise print \"not found\".",
    starter: `package main

import "fmt"

func main() {
	langs := map[string]int{"go": 2009, "python": 1991}
	// TODO: look up "go" using the two-value form and print "found" or "not found"
	_ = langs
}`,
    expectedOutput: ["found"],
    hint: "if _, ok := langs[\"go\"]; ok { fmt.Println(\"found\") } else { fmt.Println(\"not found\") }",
  },
  {
    title: "Delete a Key",
    instruction:
      "Use the built-in `delete(map, key)` to remove an entry. Delete \"bob\" from the ages map, then try to look it up — print \"not found\" if the key is gone.",
    starter: `package main

import "fmt"

func main() {
	ages := map[string]int{"alice": 30, "bob": 25}
	// TODO: delete "bob" from ages
	// TODO: check if "bob" still exists and print "not found" if it doesn't
	_ = ages
}`,
    expectedOutput: ["not found"],
    hint: "delete(ages, \"bob\") — then if _, ok := ages[\"bob\"]; !ok { fmt.Println(\"not found\") }",
  },
  {
    title: "Iterate over a Map",
    instruction:
      "`for range` on a map gives you each key and value. Loop over the scores map and print each player's name and score on one line (e.g. \"alice: 10\").",
    starter: `package main

import "fmt"

func main() {
	scores := map[string]int{"alice": 10, "bob": 20, "carol": 30}
	// TODO: range over scores and print each "name: score"
	_ = scores
}`,
    expectedOutput: ["alice", "bob", "carol"],
    hint: "for name, score := range scores { fmt.Printf(\"%s: %d\\n\", name, score) }",
  },
  {
    title: "Word Count",
    instruction:
      "Count how many times each word appears in a sentence. Split the string \"the cat sat on the mat\" by spaces, count each word, then print the count for \"the\".",
    starter: `package main

import (
	"fmt"
	"strings"
)

func main() {
	sentence := "the cat sat on the mat"
	counts := map[string]int{}
	// TODO: split sentence by " " and count each word
	// TODO: print the count for "the"
	_ = sentence
	_ = counts
}`,
    expectedOutput: ["the", "2"],
    hint: "for _, w := range strings.Split(sentence, \" \") { counts[w]++ } — fmt.Println(\"the\", counts[\"the\"])",
  },
];
