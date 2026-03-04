import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Iterator map",
    instruction:
      "Create a vec [1, 2, 3, 4, 5]. Use .iter().map(|n| n * 2).collect::<Vec<_>>() to get doubled values and print each on its own line.",
    starter: `fn main() {
    let nums = vec![1, 2, 3, 4, 5];
    let doubled: Vec<i32> = nums.iter().map(|n| n * 2).collect();
    for d in &doubled {
        println!("{}", d);
    }
}`,
    expectedOutput: ["2", "4", "6", "8", "10"],
    hint: "Run the program.",
  },
  {
    title: "Iterator filter",
    instruction:
      "From vec![1, 2, 3, 4, 5], use .iter().filter(|n| *n % 2 == 0).copied().collect::<Vec<_>>() to get evens. Print each on its own line.",
    starter: `fn main() {
    let nums = vec![1, 2, 3, 4, 5];
    let evens: Vec<i32> = nums.iter().filter(|n| *n % 2 == 0).copied().collect();
    for e in &evens {
        println!("{}", e);
    }
}`,
    expectedOutput: ["2", "4"],
    hint: "Run the program.",
  },
  {
    title: "Sum with iterator",
    instruction:
      "Use .iter().sum::<i32>() on vec![10, 20, 30] to compute the sum and print it.",
    starter: `fn main() {
    let nums = vec![10, 20, 30];
    let sum: i32 = nums.iter().sum();
    println!("{}", sum);
}`,
    expectedOutput: ["60"],
    hint: "Run the program.",
  },
];
