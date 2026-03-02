import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Launch a Goroutine",
    instruction:
      "The `go` keyword launches a goroutine — a lightweight concurrent function. Start a goroutine that prints \"from goroutine\", then sleep for 100ms in main so the goroutine has time to run before the program exits.",
    starter: `package main

import (
	"fmt"
	"time"
)

func main() {
	// TODO: launch a goroutine that prints "from goroutine"
	time.Sleep(100 * time.Millisecond)
}`,
    expectedOutput: ["from goroutine"],
    hint: "go func() { fmt.Println(\"from goroutine\") }()",
  },
  {
    title: "WaitGroup",
    instruction:
      "`sync.WaitGroup` lets you wait for multiple goroutines to finish. Launch 3 goroutines (worker 1, 2, 3) each printing their name, and use a WaitGroup to wait for all of them before exiting.",
    starter: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	for i := 1; i <= 3; i++ {
		// TODO: add 1 to wg, launch goroutine that prints "worker <i>" and calls wg.Done()
	}
	wg.Wait()
}`,
    expectedOutput: ["worker 1", "worker 2", "worker 3"],
    hint: "wg.Add(1) — go func(n int) { defer wg.Done(); fmt.Printf(\"worker %d\\n\", n) }(i)",
  },
  {
    title: "Channel Send and Receive",
    instruction:
      "Channels let goroutines communicate. Create an unbuffered `chan int`, launch a goroutine that sends `42` on the channel, then receive and print the value in main.",
    starter: `package main

import "fmt"

func main() {
	ch := make(chan int)
	// TODO: launch goroutine that sends 42 on ch
	// TODO: receive from ch and print it
}`,
    expectedOutput: ["42"],
    hint: "go func() { ch <- 42 }() — fmt.Println(<-ch)",
  },
  {
    title: "Buffered Channel",
    instruction:
      "A buffered channel `make(chan T, n)` can hold up to `n` values without a receiver ready. Create a buffered channel of size 3, send \"a\", \"b\", \"c\" to it without goroutines, then receive and print all three.",
    starter: `package main

import "fmt"

func main() {
	ch := make(chan string, 3)
	// TODO: send "a", "b", "c" to ch
	// TODO: receive all three and print each
}`,
    expectedOutput: ["a", "b", "c"],
    hint: "ch <- \"a\"; ch <- \"b\"; ch <- \"c\" — fmt.Println(<-ch); fmt.Println(<-ch); fmt.Println(<-ch)",
  },
  {
    title: "Select Statement",
    instruction:
      "`select` waits on multiple channel operations and runs whichever is ready first. Two channels are provided. Send a value on `done` from a goroutine and use `select` to print \"done\" when it arrives.",
    starter: `package main

import "fmt"

func main() {
	done := make(chan bool)
	other := make(chan bool)

	go func() {
		done <- true
	}()

	// TODO: use select to wait on done or other; when done fires print "done"
}`,
    expectedOutput: ["done"],
    hint: "select { case <-done: fmt.Println(\"done\") case <-other: fmt.Println(\"other\") }",
  },
];
