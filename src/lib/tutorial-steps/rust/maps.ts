import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "insert and get",
    instruction:
      "Create a HashMap with &str keys and i32 values. Insert \"Alice\" -> 30 and \"Bob\" -> 25. Print the value for \"Alice\" (use .get().unwrap() or .get().copied().unwrap_or(0)).",
    starter: `use std::collections::HashMap;

fn main() {
    let mut map: HashMap<&str, i32> = HashMap::new();
    map.insert("Alice", 30);
    map.insert("Bob", 25);
    // TODO: print map.get("Alice")
}`,
    expectedOutput: ["30"],
    hint: "println!(\"{}\", map.get(\"Alice\").unwrap());",
  },
  {
    title: "contains_key and entry",
    instruction:
      "Given a map with \"go\" -> 2009 and \"python\" -> 1991, check if \"go\" exists and print \"found\" or \"not found\". Then use .entry(\"java\").or_insert(0) and print the value for \"java\".",
    starter: `use std::collections::HashMap;

fn main() {
    let mut langs: HashMap<&str, i32> = HashMap::new();
    langs.insert("go", 2009);
    langs.insert("python", 1991);
    // TODO: if langs.contains_key("go") print "found" else "not found"
    langs.entry("java").or_insert(0);
    // TODO: print langs.get("java").unwrap()
}`,
    expectedOutput: ["found", "0"],
    hint: "if langs.contains_key(\"go\") { println!(\"found\"); } else { println!(\"not found\"); }",
  },
];
