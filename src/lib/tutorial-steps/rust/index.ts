import type { TutorialStep } from "../types";
import { steps as gettingStarted } from "./getting-started";
import { steps as variablesAndTypes } from "./variables-and-types";
import { steps as printFormatting } from "./print-formatting";

function placeholderSteps(title: string): TutorialStep[] {
  return [
    {
      title,
      instruction: "This tutorial is being translated to Rust. Try the Go version for now, or check back soon.",
      starter: `fn main() {\n    println!("Hello from Rust");\n}`,
      expectedOutput: ["Hello from Rust"],
    },
  ];
}

export const rustSteps: Record<string, TutorialStep[]> = {
  "getting-started": gettingStarted,
  "variables-and-types": variablesAndTypes,
  "fmt-package": printFormatting,
  "control-flow": placeholderSteps("Control Flow"),
  "loops": placeholderSteps("Loops"),
  "arrays-and-slices": placeholderSteps("Arrays & Slices"),
  "maps": placeholderSteps("HashMap"),
  "functions": placeholderSteps("Functions"),
  "pointers": placeholderSteps("Ownership & References"),
  "structs": placeholderSteps("Structs"),
  "methods": placeholderSteps("Methods & impl"),
  "interfaces": placeholderSteps("Traits"),
  "error-handling": placeholderSteps("Error Handling with Result"),
  "packages-and-modules": placeholderSteps("Crates & Modules"),
  "concurrency": placeholderSteps("Threads & Channels"),
  "testing-basics": placeholderSteps("Testing with #[test]"),
  "http-basics": placeholderSteps("HTTP with reqwest"),
  "json-encoding": placeholderSteps("JSON with serde"),
  "select-statement": placeholderSteps("Iterators & Closures"),
};
