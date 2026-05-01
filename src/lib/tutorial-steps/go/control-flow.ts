import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "if Statement",
    instruction:
      "A book has 350 pages. Use `if` to check: if it has more than 200 pages, print `\"Long book\"`. I only run the code inside the curly braces when the condition is true.",
    starter: `package main

import "fmt"

func main() {
\tpages := 350
\t// TODO: if pages > 200, print "Long book"
\t_ = pages
}`,
    expectedOutput: ["Long book"],
    hint: 'if pages > 200 { fmt.Println("Long book") }',
  },
  {
    title: "if-else",
    instruction:
      "A young reader wants to borrow a book. If they're 12 or older, print `\"Can borrow\"`. Otherwise print `\"Too young\"`.",
    starter: `package main

import "fmt"

func main() {
\tage := 15
\t// TODO: print "Can borrow" if age >= 12, else print "Too young"
\t_ = age
}`,
    expectedOutput: ["Can borrow"],
    hint: 'if age >= 12 { fmt.Println("Can borrow") } else { fmt.Println("Too young") }',
  },
  {
    title: "if with Init Statement",
    instruction:
      "Go lets you run a short statement before the condition in an `if`. Look up the ISBN `\"978-0-14-312774-1\"` in the books map. If it exists, print `\"Found book: The Great Gatsby\"`. If not, print `\"Book not found\"`.",
    starter: `package main

import "fmt"

func main() {
\tbooks := map[string]string{
\t\t"978-0-14-312774-1": "The Great Gatsby",
\t\t"978-0-06-112008-4": "To Kill a Mockingbird",
\t}
\t// TODO: use if title, ok := books["978-0-14-312774-1"]; ok { ... }
\t_ = books
}`,
    expectedOutput: ["found book: the great gatsby"],
    hint: 'if title, ok := books["978-0-14-312774-1"]; ok { fmt.Println("Found book:", title) } else { fmt.Println("Book not found") }',
  },
  {
    title: "switch Statement",
    instruction:
      "The library is open Monday through Saturday, closed on Sunday. Given `day := \"Saturday\"`, use a `switch` to print `\"Open\"` or `\"Closed\"`.",
    starter: `package main

import "fmt"

func main() {
\tday := "Saturday"
\t// TODO: switch on day, print "Open" for Mon-Sat, "Closed" for Sun
\t_ = day
}`,
    expectedOutput: ["Open"],
    hint: 'switch day { case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday": fmt.Println("Open") case "Sunday": fmt.Println("Closed") }',
  },
  {
    title: "FizzBuzz",
    instruction:
      "March from 1 to 15. For numbers divisible by 3, print `\"Short\"`. For 5, print `\"Medium\"`. For both, print `\"Long\"`. Otherwise print the number. Check for both first!",
    starter: `package main

import "fmt"

func main() {
\tfor i := 1; i <= 15; i++ {
\t\t// TODO: print "Short" for multiples of 3, "Medium" for multiples of 5, "Long" for both, else i
\t\tfmt.Println(i)
\t}
}`,
    expectedOutput: ["Short", "Medium", "Long"],
    hint: "Check i%3==0 && i%5==0 first for Long, then i%3==0 for Short, then i%5==0 for Medium, else print i.",
  },
];
