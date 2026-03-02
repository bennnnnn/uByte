import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Basic Select",
    instruction:
      "`select` blocks until one of its channel cases is ready, then runs that case. If multiple are ready at once, it picks one at random. Create two buffered channels, send a value to one of them, then use `select` to receive from whichever is ready.",
    starter: `package main

import "fmt"

func main() {
	ch1 := make(chan string, 1)
	ch2 := make(chan string, 1)

	// TODO: send "one" to ch1
	ch1 <- ""

	// TODO: use select to receive from ch1 or ch2 and print the result
	select {
	case msg := <-ch1:
		fmt.Println("received from ch1:", msg)
	case msg := <-ch2:
		fmt.Println("received from ch2:", msg)
	}
}`,
    expectedOutput: ["received from ch1: one"],
    hint: "Change `ch1 <- \"\"` to `ch1 <- \"one\"`. The select will pick ch1 since it has data.",
  },
  {
    title: "Non-Blocking with Default",
    instruction:
      "Adding a `default` case makes `select` non-blocking: if no channel is ready, `default` runs immediately. This is how you poll a channel without hanging. Try receiving from an empty channel — the default case should print `no data`.",
    starter: `package main

import "fmt"

func main() {
	ch := make(chan int, 1)
	// Note: we don't send anything to ch

	// TODO: use select with a case for <-ch and a default that prints "no data available"
	select {
	case v := <-ch:
		fmt.Println("got:", v)
	}
}`,
    expectedOutput: ["no data available"],
    hint: "Add `default: fmt.Println(\"no data available\")` as a case in the select block.",
  },
  {
    title: "Timeout Pattern",
    instruction:
      "`time.After(d)` returns a channel that fires after duration `d`. Use it with `select` to implement a timeout: receive from a slow channel OR from `time.After(50 * time.Millisecond)`. The slow channel sends after 200ms, so the timeout should fire first.",
    starter: `package main

import (
	"fmt"
	"time"
)

func slowOperation() <-chan string {
	ch := make(chan string, 1)
	go func() {
		time.Sleep(200 * time.Millisecond)
		ch <- "slow result"
	}()
	return ch
}

func main() {
	result := slowOperation()

	// TODO: use select to receive from result or time.After(50 * time.Millisecond)
	// Print "got: <value>" or "timeout: operation took too long"
	select {
	case v := <-result:
		fmt.Println("got:", v)
	}
}`,
    expectedOutput: ["timeout"],
    hint: "Add `case <-time.After(50 * time.Millisecond): fmt.Println(\"timeout: operation took too long\")` to the select.",
  },
  {
    title: "Done Channel Pattern",
    instruction:
      "A `done` channel signals goroutines to stop. The goroutine uses `select` to either do work or exit when `done` is closed. Start a goroutine that counts up and prints each number, then close `done` after a short delay to stop it.",
    starter: `package main

import (
	"fmt"
	"time"
)

func counter(done <-chan struct{}) {
	for i := 1; ; i++ {
		select {
		case <-done:
			fmt.Println("counter stopped at", i-1)
			return
		default:
			fmt.Println("count:", i)
			time.Sleep(30 * time.Millisecond)
		}
	}
}

func main() {
	done := make(chan struct{})

	go counter(done)

	// TODO: sleep 100ms then close(done) to stop the goroutine
	time.Sleep(0)

	time.Sleep(50 * time.Millisecond) // wait for goroutine to print "stopped"
	fmt.Println("main done")
}`,
    expectedOutput: ["count:", "counter stopped", "main done"],
    hint: "Change `time.Sleep(0)` to `time.Sleep(100 * time.Millisecond)` followed by `close(done)`.",
  },
  {
    title: "Fan-In: Merging Channels",
    instruction:
      "Fan-in merges multiple input channels into one output. Each input gets a goroutine that forwards values using `select`. Complete the `merge` function to combine `ch1` and `ch2` into a single output channel and print all received values.",
    starter: `package main

import (
	"fmt"
	"sync"
)

func merge(ch1, ch2 <-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup

	forward := func(ch <-chan int) {
		defer wg.Done()
		for v := range ch {
			out <- v
		}
	}

	wg.Add(2)
	// TODO: start two goroutines calling forward(ch1) and forward(ch2)

	// TODO: start a goroutine that waits for wg then closes out
	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}

func source(vals ...int) <-chan int {
	ch := make(chan int, len(vals))
	for _, v := range vals {
		ch <- v
	}
	close(ch)
	return ch
}

func main() {
	ch1 := source(1, 2, 3)
	ch2 := source(4, 5, 6)
	merged := merge(ch1, ch2)

	total := 0
	for v := range merged {
		fmt.Println("received:", v)
		total += v
	}
	fmt.Println("total:", total)
}`,
    expectedOutput: ["received:", "total: 21"],
    hint: "Add `go forward(ch1)` and `go forward(ch2)` inside merge, before the wait goroutine.",
  },
];
