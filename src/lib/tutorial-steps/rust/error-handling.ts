import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Result and match",
    instruction:
      "Parse the string \"42\" with s.parse::<i32>(). In a match, if Ok(n) print n, if Err(_) print \"Invalid\". Then parse \"not a number\" and in the match print \"Invalid\" in the Err arm.",
    starter: `fn main() {
    let s1 = "42";
    match s1.parse::<i32>() {
        Ok(n) => println!("{}", n),
        Err(_) => println!("Invalid"),
    }
    let s2 = "not a number";
    match s2.parse::<i32>() {
        Ok(n) => println!("{}", n),
        Err(_) => println!("Invalid"),
    }
}`,
    expectedOutput: ["42", "Invalid"],
    hint: "Code is already set up — run it.",
  },
  {
    title: "Return Result",
    instruction:
      "Write a function divide(a: i32, b: i32) -> Result<i32, String> that returns Ok(a/b) or Err(\"Division by zero\".to_string()) if b is 0. From main, print divide(10, 2).unwrap() and in a match handle divide(5, 0) and print the Err message.",
    starter: `fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        return Err("Division by zero".to_string());
    }
    Ok(a / b)
}

fn main() {
    println!("{}", divide(10, 2).unwrap());
    match divide(5, 0) {
        Ok(n) => println!("{}", n),
        Err(e) => println!("{}", e),
    }
}`,
    expectedOutput: ["5", "Division by zero"],
    hint: "Code is complete — run it.",
  },
];
