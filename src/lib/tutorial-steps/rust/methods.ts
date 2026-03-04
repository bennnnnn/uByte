import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "impl and Method",
    instruction:
      "Define a struct Counter with count: u32 (start 0). Add an impl with increment(&mut self) that adds 1 and get(&self) that returns count. In main, create Counter::new(), call increment twice, and print get().",
    starter: `struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Self {
        Counter { count: 0 }
    }
    fn increment(&mut self) {
        // TODO: self.count += 1
    }
    fn get(&self) -> u32 {
        self.count
    }
}

fn main() {
    let mut c = Counter::new();
    c.increment();
    c.increment();
    println!("{}", c.get());
}`,
    expectedOutput: ["2"],
    hint: "self.count += 1;",
  },
  {
    title: "Associated Function",
    instruction:
      "Add an associated function double_area that takes a side: u32 and returns side * side * 2. From main, print Counter::double_area(5). (Use a dummy struct or add to an existing one; or just a fn double_area in impl.)",
    starter: `struct Helper;

impl Helper {
    fn double_area(side: u32) -> u32 {
        // TODO: side * side * 2
    }
}

fn main() {
    println!("{}", Helper::double_area(5));
}`,
    expectedOutput: ["50"],
    hint: "side * side * 2",
  },
];
