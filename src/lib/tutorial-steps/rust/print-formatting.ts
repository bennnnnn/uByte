import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "println! and print!",
    instruction:
      "Use `println!` to print with a newline and `print!` to print without one. Print `Hello` with `print!`, then `World` with `println!` so the output is `HelloWorld` on a single line.",
    starter: `fn main() {
    // TODO: use print! to print "Hello" without newline
    // TODO: use println! to print "World" with newline
}`,
    expectedOutput: ["HelloWorld"],
    hint: "print!(\"Hello\"); then println!(\"World\");",
  },
  {
    title: "Named and Positional Arguments",
    instruction:
      "Rust format strings support positional `{0}` and named `{name}` arguments. Print `\"Alice is 30 years old\"` using named arguments in `println!`.",
    starter: `fn main() {
    let name = "Alice";
    let age = 30;
    // TODO: print "Alice is 30 years old" using {name} and {age} placeholders
}`,
    expectedOutput: ["Alice is 30 years old"],
    hint: "println!(\"{name} is {age} years old\"); — Rust 1.58+ supports captured identifiers directly.",
  },
  {
    title: "Debug Formatting",
    instruction:
      "Use `{:?}` (or `{:#?}` for pretty-print) to debug-print values that implement `Debug`. Print the tuple `(1, 2, 3)` using `{:?}`.",
    starter: `fn main() {
    let point = (1, 2, 3);
    // TODO: print point using {:?}
}`,
    expectedOutput: ["(1, 2, 3)"],
    hint: "println!(\"{:?}\", point);",
  },
  {
    title: "Number Formatting",
    instruction:
      "Control float precision with `{:.2}`. Compute `22.0_f64 / 7.0` and print the result rounded to 2 decimal places.",
    starter: `fn main() {
    let result = 22.0_f64 / 7.0;
    // TODO: print result with 2 decimal places
}`,
    expectedOutput: ["3.14"],
    hint: "println!(\"{:.2}\", result);",
  },
  {
    title: "Padding and Alignment",
    instruction:
      "Use `{:<10}` for left-align, `{:>10}` for right-align, and `{:^10}` for center — all in a field of 10 characters. Print `\"left\"` left-aligned and `\"right\"` right-aligned.",
    starter: `fn main() {
    // TODO: print "left" left-aligned in 10 characters
    // TODO: print "right" right-aligned in 10 characters
}`,
    expectedOutput: ["left      ", "     right"],
    hint: "println!(\"{:<10}\", \"left\"); and println!(\"{:>10}\", \"right\");",
  },
];
