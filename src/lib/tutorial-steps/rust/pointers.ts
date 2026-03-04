import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Immutable Reference",
    instruction:
      "Create a String `s = String::from(\"hello\")`. Create an immutable reference `r = &s` and print using r.",
    starter: `fn main() {
    let s = String::from("hello");
    let r = &s;
    // TODO: print r
}`,
    expectedOutput: ["hello"],
    hint: "println!(\"{}\", r);",
  },
  {
    title: "Option",
    instruction:
      "Declare `let maybe: Option<i32> = None`. If it is Some(n), print n; otherwise print \"none\".",
    starter: `fn main() {
    let maybe: Option<i32> = None;
    // TODO: match maybe { Some(n) => println n, None => println "none" }
}`,
    expectedOutput: ["none"],
    hint: "match maybe { Some(n) => println!(\"{}\", n), None => println!(\"none\") }",
  },
  {
    title: "Mutable Reference",
    instruction:
      "Create `let mut x = 10`. Take a mutable reference `let r = &mut x`, add 1 through r (*r += 1), then print x.",
    starter: `fn main() {
    let mut x = 10;
    let r = &mut x;
    *r += 1;
    println!("{}", x);
}`,
    expectedOutput: ["11"],
    hint: "The code is already complete — run it.",
  },
];
