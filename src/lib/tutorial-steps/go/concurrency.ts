import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Launch a Goroutine — Search in Background",
    instruction:
      "In a library, searches shouldn't block you from doing other things. The `go` keyword launches a goroutine — a lightweight concurrent function. Start a goroutine that searches the catalog and prints found, then sleep for 100ms in main so the goroutine has time to finish before the program exits.",
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
    hint: "go func() { fmt.Println(\"book found\") }()",
  },
  {
    title: "WaitGroup — Wait for 3 Concurrent Searches",
    instruction:
      "Three library patrons are searching the catalog at the same time. `sync.WaitGroup` lets you wait for multiple goroutines to finish. Launch 3 goroutines (patron 1, 2, 3) each printing their search result, and use a WaitGroup to wait for all of them before closing the library.",
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
    hint: "wg.Add(1) — go func(n int) { defer wg.Done(); fmt.Printf(\"patron %d found a book\\n\", n) }(i)",
  },
  {
    title: "Channel — Get Search Result Back",
    instruction:
      "Channels let goroutines communicate results back to you. A patron searches for a book and sends the catalog number back. Create an unbuffered `chan string`, launch a goroutine that sends \"Book #42\" on the channel, then receive and print the result in main.",
    starter: `package main

import "fmt"

func main() {
\tch := make(chan string)
\t// TODO: launch goroutine that sends "Book #42" on ch
\t// TODO: receive from ch and print it
}`,
    expectedOutput: ["Book #42"],
    hint: "go func() { ch <- \"Book #42\" }() — fmt.Println(<-ch)",
  },
  {
    title: "Buffered Channel — Queue of Book Requests",
    instruction:
      "A buffered channel `make(chan T, n)` can hold up to `n` requests without someone immediately picking them up — like a request queue at the library. Create a buffered channel of size 3, send \"request a\", \"request b\", \"request c\" to it without goroutines (they queue up), then receive and print all three.",
    starter: `package main

import "fmt"

func main() {
\tch := make(chan string, 3)
\t// TODO: send "request a", "request b", "request c" to ch
\t// TODO: receive all three and print each
}`,
    expectedOutput: ["request a", "request b", "request c"],
    hint: "ch <- \"request a\"; ch <- \"request b\"; ch <- \"request c\" — fmt.Println(<-ch); fmt.Println(<-ch); fmt.Println(<-ch)",
  },
  {
    title: "Select — Who Returns First",
    instruction:
      "Two librarians search different sections of the catalog. `select` waits on multiple channel operations and runs whichever is ready first. Two channels are provided. Send a value on `catalog` from a goroutine and use `select` to print \"found first\" when it arrives before the slower search.",
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
    hint: "select { case <-catalog: fmt.Println(\"found first\") case <-archives: fmt.Println(\"archives first\") }",
  },
];
