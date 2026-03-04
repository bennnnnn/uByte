import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Assert Logic",
    instruction:
      "Write a function add(a: i32, b: i32) -> i32 that returns a + b. In main, call add(2, 3) and print \"pass\" if the result is 5, else \"fail\".",
    starter: `fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    let result = add(2, 3);
    println!("{}", if result == 5 { "pass" } else { "fail" });
}`,
    expectedOutput: ["pass"],
    hint: "Code is complete — run it.",
  },
  {
    title: "is_even",
    instruction:
      "Write a function is_even(n: i32) -> bool that returns true if n is even. In main, print \"pass\" if is_even(4) is true and is_even(3) is false, else \"fail\".",
    starter: `fn is_even(n: i32) -> bool {
    n % 2 == 0
}

fn main() {
    let ok = is_even(4) && !is_even(3);
    println!("{}", if ok { "pass" } else { "fail" });
}`,
    expectedOutput: ["pass"],
    hint: "Run the program.",
  },
];
