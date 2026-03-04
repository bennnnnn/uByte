import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Create and Print Array",
    instruction:
      "Create an array of three integers: 10, 20, 30. Print each element on its own line using a for loop.",
    starter: `fn main() {
    let arr = [10, 20, 30];
    // TODO: for element in arr.iter(), print it
}`,
    expectedOutput: ["10", "20", "30"],
    hint: "for n in &arr { println!(\"{}\", n); }",
  },
  {
    title: "Vec push and len",
    instruction:
      "Create a Vec of strings with Vec::new(). Push \"apple\", \"banana\", \"cherry\". Print the length, then print the element at index 1.",
    starter: `fn main() {
    let mut v: Vec<&str> = Vec::new();
    v.push("apple");
    v.push("banana");
    v.push("cherry");
    // TODO: print v.len() and v[1]
}`,
    expectedOutput: ["3", "banana"],
    hint: "println!(\"{}\", v.len()); println!(\"{}\", v[1]);",
  },
  {
    title: "Sum of Array",
    instruction:
      "Compute the sum of all elements in `let arr = [1, 2, 3, 4, 5];` and print the result.",
    starter: `fn main() {
    let arr = [1, 2, 3, 4, 5];
    let mut sum = 0;
    // TODO: for n in &arr, add to sum, then print sum
}`,
    expectedOutput: ["15"],
    hint: "for n in &arr { sum += n; } println!(\"{}\", sum);",
  },
];
