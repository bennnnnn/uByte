import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Launch a Goroutine — Search in the Background",
    instruction:
      "The `go` keyword starts a goroutine — it runs alongside everything else. Start one that prints `\"book found\"`, then sleep for 100ms in main so the goroutine has time to finish before the program exits.",
    starter: `package main

import (
\t"fmt"
\t"time"
)

func main() {
\t// TODO: launch a goroutine that searches and prints "book found"
\ttime.Sleep(100 * time.Millisecond)
}`,
    expectedOutput: ["book found"],
    hint: 'go func() { fmt.Println("book found") }()',
  },
  {
    title: "WaitGroup — 3 Concurrent Searches",
    instruction:
      "`sync.WaitGroup` lets you wait for multiple goroutines. Launch 3 goroutines — each prints `\"patron N found a book\"` and calls `wg.Done()`. Use `wg.Wait()` to wait for all three.",
    starter: `package main

import (
\t"fmt"
\t"sync"
)

func main() {
\tvar wg sync.WaitGroup
\tfor i := 1; i <= 3; i++ {
\t\t// TODO: add 1 to wg, launch goroutine that prints "patron <i> found a book" and calls wg.Done()
\t}
\twg.Wait()
}`,
    expectedOutput: ["patron 1 found a book", "patron 2 found a book", "patron 3 found a book"],
    hint: 'wg.Add(1) — go func(n int) { defer wg.Done(); fmt.Printf("patron %d found a book\\n", n) }(i)',
  },
  {
    title: "Channel — Send Result Back",
    instruction:
      "Channels let goroutines communicate. Create an unbuffered `chan string`, launch a goroutine that sends `\"Book #42\"` on the channel, then receive and print it in main.",
    starter: `package main

import "fmt"

func main() {
\tch := make(chan string)
\t// TODO: launch goroutine that sends "Book #42" on ch
\t// TODO: receive from ch and print it
}`,
    expectedOutput: ["Book #42"],
    hint: 'go func() { ch <- "Book #42" }() — fmt.Println(<-ch)',
  },
  {
    title: "Buffered Channel — Queue Requests",
    instruction:
      "A buffered channel holds up to N values without a receiver. Create `make(chan string, 3)`, send `\"request a\"`, `\"request b\"`, `\"request c\"` (no goroutines needed since there's room), then receive and print all three.",
    starter: `package main

import "fmt"

func main() {
\tch := make(chan string, 3)
\t// TODO: send "request a", "request b", "request c" to ch
\t// TODO: receive all three and print each
}`,
    expectedOutput: ["request a", "request b", "request c"],
    hint: 'ch <- "request a"; ch <- "request b"; ch <- "request c" — fmt.Println(<-ch); fmt.Println(<-ch); fmt.Println(<-ch)',
  },
  {
    title: "Select — First Result Wins",
    instruction:
      "`select` waits on multiple channels and runs whichever is ready first. Two channels are provided: `catalog` and `archives`. A goroutine sends on `catalog`. Use select to print `\"found first\"` when catalog fires.",
    starter: `package main

import "fmt"

func main() {
\tcatalog := make(chan bool)
\tarchives := make(chan bool)

\tgo func() {
\t\tcatalog <- true
\t}()

\t// TODO: use select to wait on catalog or archives; when catalog fires print "found first"
}`,
    expectedOutput: ["found first"],
    hint: 'select { case <-catalog: fmt.Println("found first") case <-archives: fmt.Println("archives first") }',
  },
];
