import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "for over Range",
    instruction:
      "Use a for loop over the range 1..=5 to print the numbers 1 through 5, each on its own line.",
    starter: `fn main() {
    // TODO: for i in 1..=5, print i
}`,
    expectedOutput: ["1", "2", "3", "4", "5"],
    hint: "for i in 1..=5 { println!(\"{}\", i); }",
  },
  {
    title: "while Loop",
    instruction:
      "Use a while loop to count down from 3 to 1, printing each number, then print \"Liftoff!\" after the loop.",
    starter: `fn main() {
    let mut n = 3;
    // TODO: while n > 0, print n and decrement
    // TODO: then print "Liftoff!"
}`,
    expectedOutput: ["3", "2", "1", "Liftoff!"],
    hint: "while n > 0 { println!(\"{}\", n); n -= 1; } then println!(\"Liftoff!\");",
  },
  {
    title: "for over Slice",
    instruction:
      "Loop over the array `let fruits = [\"apple\", \"banana\", \"cherry\"]` and print each fruit on its own line.",
    starter: `fn main() {
    let fruits = ["apple", "banana", "cherry"];
    // TODO: for fruit in fruits.iter() (or &fruits), print fruit
}`,
    expectedOutput: ["apple", "banana", "cherry"],
    hint: "for fruit in &fruits { println!(\"{}\", fruit); }",
  },
  {
    title: "break and continue",
    instruction:
      "Loop from 1 to 6. Use continue to skip even numbers and break if the number exceeds 5. Print only 1, 3, and 5.",
    starter: `fn main() {
    for i in 1..=6 {
        // TODO: continue when i is even, break when i > 5
        println!("{}", i);
    }
}`,
    expectedOutput: ["1", "3", "5"],
    hint: "if i % 2 == 0 { continue; } if i > 5 { break; }",
  },
  {
    title: "Sum in a Loop",
    instruction:
      "Use a for loop over 1..=10 to compute the sum and print the result.",
    starter: `fn main() {
    let mut sum = 0;
    // TODO: for i in 1..=10, add i to sum, then print sum
}`,
    expectedOutput: ["55"],
    hint: "for i in 1..=10 { sum += i; } println!(\"{}\", sum);",
  },
];
