import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define a Struct",
    instruction:
      "Define a struct Point with two fields x: i32 and y: i32. In main, create a Point { x: 3, y: 4 } and print its x and y.",
    starter: `struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 3, y: 4 };
    // TODO: print p.x and p.y
}`,
    expectedOutput: ["3", "4"],
    hint: "println!(\"{}\", p.x); println!(\"{}\", p.y);",
  },
  {
    title: "Struct with Fields",
    instruction:
      "Define a struct Book with title: String and pages: u32. In main, create Book { title: \"Rust Guide\".to_string(), pages: 200 } and print title and pages.",
    starter: `struct Book {
    title: String,
    pages: u32,
}

fn main() {
    let b = Book {
        title: "Rust Guide".to_string(),
        pages: 200,
    };
    // TODO: print b.title and b.pages
}`,
    expectedOutput: ["Rust Guide", "200"],
    hint: "println!(\"{}\", b.title); println!(\"{}\", b.pages);",
  },
];
