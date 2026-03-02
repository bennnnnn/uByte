import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Hello, World!",
    instruction:
      "Every Rust program starts in the `main` function. Use the `println!` macro to print text — the `!` tells you it's a macro, not a regular function. Click Run to see your first Rust program.",
    starter: `fn main() {
    println!("Hello, World!");
}`,
    expectedOutput: ["Hello, World!"],
    hint: "The program is already complete — just click Run and watch the output appear.",
  },
  {
    title: "Print Multiple Lines",
    instruction:
      "Call `println!` multiple times to print multiple lines. Update the program to print two lines: one containing \"Rust\" and one containing \"Beginner\".",
    starter: `fn main() {
    println!("I am learning Rust");
    // TODO: print a second line containing the word "Beginner"
}`,
    expectedOutput: ["Rust", "Beginner"],
    hint: "Add another println! call on the next line.",
  },
  {
    title: "Use Variables",
    instruction:
      "Declare variables with `let`. Rust infers types, but you can annotate them: `let name: &str = \"Rust\";`. Declare `language` as `\"Rust\"` and `version` as `1` (u32). Print \"Learning Rust version 1\".",
    starter: `fn main() {
    let language = "Rust";
    let version: u32 = 1;
    // TODO: print "Learning Rust version 1" using language and version
}`,
    expectedOutput: ["Learning Rust version 1"],
    hint: "println!(\"Learning {} version {}\", language, version);",
  },
  {
    title: "Format Strings",
    instruction:
      "Rust's `println!` uses `{}` as a placeholder. Use `format!` to build a String: `let greeting = format!(\"Hello, {}!\", name);` where `name = \"Learner\"`. Print the greeting.",
    starter: `fn main() {
    let name = "Learner";
    // TODO: use format! to build "Hello, Learner!" then print it
}`,
    expectedOutput: ["Hello, Learner!"],
    hint: "let greeting = format!(\"Hello, {}!\", name); then println!(\"{}\", greeting);",
  },
  {
    title: "Add Comments",
    instruction:
      "Rust supports `//` single-line and `/* */` block comments. Add a `//` comment above the println describing what it does, then ensure the program prints \"Comments done!\".",
    starter: `fn main() {
    // TODO: add a comment here describing what the next line does
    println!("Comments done!");
}`,
    expectedOutput: ["Comments done!"],
    hint: "A comment looks like: // This prints a confirmation message.",
  },
];
