import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Immutable vs Mutable",
    instruction:
      "Variables in Rust are immutable by default. Use `mut` to make one mutable. Declare `let x = 5;`, then declare `let mut y = 10;` and reassign `y = 20;`. Print both.",
    starter: `fn main() {
    let x = 5;
    let mut y = 10;
    // TODO: reassign y to 20
    // TODO: print x, then print y
}`,
    expectedOutput: ["5", "20"],
    hint: "y = 20; then println!(\"{}\", x); and println!(\"{}\", y);",
  },
  {
    title: "Scalar Types",
    instruction:
      "Rust's scalar types: integers (`i32`, `u32`, `i64`…), floats (`f64`), booleans (`bool`), and characters (`char`). Declare `score: i32 = 42`, `pi: f64 = 3.14`, `active: bool = true`. Print all three.",
    starter: `fn main() {
    let score: i32 = 42;
    let pi: f64 = 3.14;
    let active: bool = true;
    // TODO: print score, pi, and active on separate lines
}`,
    expectedOutput: ["42", "3.14", "true"],
    hint: "println!(\"{}\", score); then println!(\"{}\", pi); then println!(\"{}\", active);",
  },
  {
    title: "String vs &str",
    instruction:
      "Rust has two string types: `&str` (string slice, immutable reference) and `String` (heap-allocated, growable). Declare `let s1: &str = \"hello\";` and `let s2 = String::from(\"world\");`. Print both.",
    starter: `fn main() {
    let s1: &str = "hello";
    let s2 = String::from("world");
    // TODO: print s1, then s2
}`,
    expectedOutput: ["hello", "world"],
    hint: "println!(\"{}\", s1); and println!(\"{}\", s2);",
  },
  {
    title: "Type Inference and Shadowing",
    instruction:
      "Rust infers types and allows shadowing — re-declaring a variable with `let`. Shadow `x = 5` with `let x = x * 2`, then shadow again with `let x = x + 3`. Print the final value.",
    starter: `fn main() {
    let x = 5;
    let x = x * 2;
    // TODO: shadow x again by adding 3
    // TODO: print x
}`,
    expectedOutput: ["13"],
    hint: "let x = x + 3; then println!(\"{}\", x);",
  },
  {
    title: "Constants",
    instruction:
      "Constants use `const`, must have a type annotation, and are always immutable. Declare `const MAX_SCORE: u32 = 100;` and compute `half = MAX_SCORE / 2`. Print half.",
    starter: `fn main() {
    const MAX_SCORE: u32 = 100;
    // TODO: compute half = MAX_SCORE / 2
    // TODO: print half
}`,
    expectedOutput: ["50"],
    hint: "let half = MAX_SCORE / 2; then println!(\"{}\", half);",
  },
  {
    title: "Tuples",
    instruction:
      "Tuples group values of different types. Declare `let tup: (i32, f64, &str) = (42, 3.14, \"Rust\");` and access elements with `.0`, `.1`, `.2`. Print each element on its own line.",
    starter: `fn main() {
    let tup: (i32, f64, &str) = (42, 3.14, "Rust");
    // TODO: print tup.0, tup.1, tup.2
}`,
    expectedOutput: ["42", "3.14", "Rust"],
    hint: "println!(\"{}\", tup.0); println!(\"{}\", tup.1); println!(\"{}\", tup.2);",
  },
];
