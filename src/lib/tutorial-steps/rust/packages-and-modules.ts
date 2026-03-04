import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "use and Vec",
    instruction:
      "Use std::collections (or just Vec from prelude is already there). Create a Vec with vec![\"one\", \"two\"], then print its len() and the first element (v[0]).",
    starter: `fn main() {
    let v = vec!["one", "two"];
    println!("{}", v.len());
    println!("{}", v[0]);
}`,
    expectedOutput: ["2", "one"],
    hint: "Code is complete — run it.",
  },
  {
    title: "HashMap from std",
    instruction:
      "Add use std::collections::HashMap. Create a HashMap, insert \"a\" -> 1 and \"b\" -> 2, then print the value for \"a\".",
    starter: `use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert("a", 1);
    map.insert("b", 2);
    println!("{}", map.get("a").unwrap());
}`,
    expectedOutput: ["1"],
    hint: "Run the program.",
  },
];
