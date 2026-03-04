import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Spawn a Thread",
    instruction:
      "Use std::thread::spawn with a closure that prints \"Hello from thread\". Join the handle, then print \"Main done\".",
    starter: `use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        println!("Hello from thread");
    });
    handle.join().unwrap();
    println!("Main done");
}`,
    expectedOutput: ["Hello from thread", "Main done"],
    hint: "Code is complete — run it.",
  },
  {
    title: "Two Threads",
    instruction:
      "Spawn two threads: one prints \"A\", one prints \"B\". Join both, then print \"End\".",
    starter: `use std::thread;

fn main() {
    let t1 = thread::spawn(|| println!("A"));
    let t2 = thread::spawn(|| println!("B"));
    t1.join().unwrap();
    t2.join().unwrap();
    println!("End");
}`,
    expectedOutput: ["A", "B", "End"],
    hint: "Run the program.",
  },
];
