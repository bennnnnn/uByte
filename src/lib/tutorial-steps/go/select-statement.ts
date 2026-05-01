import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Basic Select — Two Search Channels",
    instruction:
      "`select` waits on multiple channels and runs whichever is ready first. Two channels are set up. Send `\"The Go Programming Language\"` to ch1, then select will pick ch1 since it has data ready and print the result.",
    starter: `package main

import "fmt"

func main() {
\tch1 := make(chan string, 1)
\tch2 := make(chan string, 1)

\t// TODO: send "The Go Programming Language" to ch1
\tch1 <- ""

\t// TODO: use select to receive from ch1 or ch2 and print the result
\tselect {
\tcase msg := <-ch1:
\t\tfmt.Println("found on shelf A:", msg)
\tcase msg := <-ch2:
\t\tfmt.Println("found on shelf B:", msg)
\t}
}`,
    expectedOutput: ["found on shelf A: The Go Programming Language"],
    hint: 'Change `ch1 <- ""` to `ch1 <- "The Go Programming Language"`. Select picks ch1 because it has data ready.',
  },
  {
    title: "Non-Blocking with Default — Empty Catalog",
    instruction:
      "Add a `default` case to `select` and it becomes non-blocking. The catalog channel is empty. Add a default branch that prints `\"catalog is empty\"` so select doesn't wait.",
    starter: `package main

import "fmt"

func main() {
\tcatalog := make(chan string, 1)
\t// Note: we don't send any books to the catalog

\t// TODO: use select with a case for <-catalog and a default that prints "catalog is empty"
\tselect {
\tcase book := <-catalog:
\t\tfmt.Println("checked out:", book)
\t}
}`,
    expectedOutput: ["catalog is empty"],
    hint: 'Add `default: fmt.Println("catalog is empty")` to the select block.',
  },
  {
    title: "Timeout Pattern — Slow Database",
    instruction:
      "`time.After(d)` returns a channel that fires after duration `d`. The `slowDatabase` function takes 200ms but you only want to wait 50ms. Use select with `time.After(50 * time.Millisecond)` so the timeout fires first.",
    starter: `package main

import (
\t"fmt"
\t"time"
)

func slowDatabase() <-chan string {
\tch := make(chan string, 1)
\tgo func() {
\t\ttime.Sleep(200 * time.Millisecond)
\t\tch <- "The Art of Computer Programming"
\t}()
\treturn ch
}

func main() {
\tresult := slowDatabase()

\t// TODO: use select to receive from result or time.After(50 * time.Millisecond)
\t// Print "found: <value>" or "timeout: database query took too long"
\tselect {
\tcase v := <-result:
\t\tfmt.Println("found:", v)
\t}
}`,
    expectedOutput: ["timeout"],
    hint: 'Add `case <-time.After(50 * time.Millisecond): fmt.Println("timeout: database query took too long")` — the timer wins before the database finishes.',
  },
  {
    title: "Done Channel — Stop Gracefully",
    instruction:
      "A `done` channel signals a goroutine to stop. The librarian goroutine shelves books until `done` is closed. Inside the loop, select decides: shelve another book or exit when `done` fires. Sleep 100ms, then `close(done)` to stop her.",
    starter: `package main

import (
\t"fmt"
\t"time"
)

func librarian(done <-chan struct{}) {
\tfor i := 1; ; i++ {
\t\tselect {
\t\tcase <-done:
\t\t\tfmt.Println("librarian stopped after shelving", i-1, "books")
\t\t\treturn
\t\tdefault:
\t\t\tfmt.Println("shelved book #", i)
\t\t\ttime.Sleep(30 * time.Millisecond)
\t\t}
\t}
}

func main() {
\tdone := make(chan struct{})

\tgo librarian(done)

\t// TODO: sleep 100ms then close(done) to stop the librarian goroutine
\ttime.Sleep(0)

\ttime.Sleep(50 * time.Millisecond) // wait for librarian to print "stopped"
\tfmt.Println("library closed")
}`,
    expectedOutput: ["shelved book #", "librarian stopped", "library closed"],
    hint: "Change `time.Sleep(0)` to `time.Sleep(100 * time.Millisecond)`, then add `close(done)` on the next line.",
  },
  {
    title: "Fan-In — Merging Two Catalogs",
    instruction:
      "Fan-in merges multiple input channels into one output. Two catalog searches return books on separate channels. Complete the `merge` function by launching goroutines that forward each catalog's results into a single output channel. Print every merged book and the total count.",
    starter: `package main

import (
\t"fmt"
\t"sync"
)

func merge(cat1, cat2 <-chan string) <-chan string {
\tout := make(chan string)
\tvar wg sync.WaitGroup

\tforward := func(ch <-chan string) {
\t\tdefer wg.Done()
\t\tfor v := range ch {
\t\t\tout <- v
\t\t}
\t}

\twg.Add(2)
\t// TODO: start two goroutines calling forward(cat1) and forward(cat2)

\t// TODO: start a goroutine that waits for wg then closes out
\tgo func() {
\t\twg.Wait()
\t\tclose(out)
\t}()

\treturn out
}

func catalog(vals ...string) <-chan string {
\tch := make(chan string, len(vals))
\tfor _, v := range vals {
\t\tch <- v
\t}
\tclose(ch)
\treturn ch
}

func main() {
\tcat1 := catalog("Dune", "1984", "Moby Dick")
\tcat2 := catalog("Brave New World", "Neuromancer", "The Hobbit")
\tmerged := merge(cat1, cat2)

\tcount := 0
\tfor book := range merged {
\t\tfmt.Println("merged result:", book)
\t\tcount++
\t}
\tfmt.Println("total books found:", count)
}`,
    expectedOutput: ["merged result:", "total books found: 6"],
    hint: "Add `go forward(cat1)` and `go forward(cat2)` inside merge, before the wait goroutine.",
  },
];
