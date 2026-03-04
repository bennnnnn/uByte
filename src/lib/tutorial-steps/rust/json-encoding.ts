import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Build JSON String",
    instruction:
      "Build a JSON string for an object with \"name\": \"Alice\" and \"age\": 30. Use format! and print it (e.g. {\"name\":\"Alice\",\"age\":30}).",
    starter: `fn main() {
    let name = "Alice";
    let age = 30;
    let json = format!(r#"{{"name":"{}","age":{}}}"#, name, age);
    println!("{}", json);
}`,
    expectedOutput: ["{\"name\":\"Alice\",\"age\":30}"],
    hint: "Code is complete — run it.",
  },
];
