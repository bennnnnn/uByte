import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "if Expression",
    instruction:
      "Check if the variable `x` (set to 15) is greater than 10. If it is, print \"greater than 10\".",
    starter: `fn main() {
    let x = 15;
    // TODO: if x > 10, print "greater than 10"
}`,
    expectedOutput: ["greater than 10"],
    hint: "if x > 10 { println!(\"greater than 10\"); }",
  },
  {
    title: "if-else",
    instruction:
      "A student scored 72. If the score is 60 or higher print \"Pass\", otherwise print \"Fail\".",
    starter: `fn main() {
    let score = 72;
    // TODO: print "Pass" or "Fail" based on score
}`,
    expectedOutput: ["Pass"],
    hint: "if score >= 60 { println!(\"Pass\"); } else { println!(\"Fail\"); }",
  },
  {
    title: "match",
    instruction:
      "Given `let day = \"Monday\"`, use a match to set `kind` to \"Weekend\" for Saturday or Sunday, and \"Weekday\" for anything else. Use _ for the default arm, then print kind.",
    starter: `fn main() {
    let day = "Monday";
    let kind = match day {
        "Saturday" | "Sunday" => "Weekend",
        _ => "Weekday",
    };
    // TODO: print kind
}`,
    expectedOutput: ["Weekday"],
    hint: "println!(\"{}\", kind);",
  },
  {
    title: "FizzBuzz",
    instruction:
      "Loop from 1 to 15 (use a range). For multiples of 3 print \"Fizz\", of 5 print \"Buzz\", of both print \"FizzBuzz\", else print the number. Check 15 first.",
    starter: `fn main() {
    for i in 1..=15 {
        // TODO: FizzBuzz logic
        println!("{}", i);
    }
}`,
    expectedOutput: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"],
    hint: "if i % 15 == 0 { println!(\"FizzBuzz\"); } else if i % 3 == 0 { println!(\"Fizz\"); } else if i % 5 == 0 { println!(\"Buzz\"); } else { println!(\"{}\", i); }",
  },
];
