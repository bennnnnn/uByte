import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define and Call",
    instruction:
      "Define a function `add` that takes two i32s and returns their sum. From main, call add(10, 20) and print the result.",
    starter: `fn add(a: i32, b: i32) -> i32 {
    // TODO: return a + b
}

fn main() {
    println!("{}", add(10, 20));
}`,
    expectedOutput: ["30"],
    hint: "a + b  (no semicolon so it's the return value)",
  },
  {
    title: "Void Function",
    instruction:
      "Define a function `greet` that takes a &str and prints \"Hello, <name>!\". Call greet(\"Rust\") from main.",
    starter: `fn greet(name: &str) {
    // TODO: println! with "Hello, {}!", name
}

fn main() {
    greet("Rust");
}`,
    expectedOutput: ["Hello, Rust!"],
    hint: "println!(\"Hello, {}!\", name);",
  },
  {
    title: "Return Value",
    instruction:
      "Write a function `max` that takes two i32s and returns the larger one. From main, print max(7, 12).",
    starter: `fn max(a: i32, b: i32) -> i32 {
    // TODO: if a > b return a else b
}

fn main() {
    println!("{}", max(7, 12));
}`,
    expectedOutput: ["12"],
    hint: "if a > b { a } else { b }",
  },
];
