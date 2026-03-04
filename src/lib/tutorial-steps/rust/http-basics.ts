import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Simulated Status",
    instruction:
      "In a real Rust project you would use reqwest::blocking::get() and print response.status(). For the runner, create a struct with status: 200 and print it so the output is 200.",
    starter: `fn main() {
    let status = 200u16;
    println!("{}", status);
}`,
    expectedOutput: ["200"],
    hint: "Run the program.",
  },
];
