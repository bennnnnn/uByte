import type { TutorialStep } from "../types";
import { steps as gettingStarted } from "./getting-started";
import { steps as variablesAndTypes } from "./variables-and-types";
import { steps as printFormatting } from "./print-formatting";

function placeholderSteps(title: string): TutorialStep[] {
  return [
    {
      title,
      instruction: "This tutorial is being translated to Java. Try the Go version for now, or check back soon.",
      starter: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java");\n    }\n}`,
      expectedOutput: ["Hello from Java"],
    },
  ];
}

export const javaSteps: Record<string, TutorialStep[]> = {
  "getting-started": gettingStarted,
  "variables-and-types": variablesAndTypes,
  "fmt-package": printFormatting,
  "control-flow": placeholderSteps("Control Flow"),
  "loops": placeholderSteps("Loops"),
  "arrays-and-slices": placeholderSteps("Arrays & ArrayList"),
  "maps": placeholderSteps("HashMap & Maps"),
  "functions": placeholderSteps("Methods & Functions"),
  "pointers": placeholderSteps("References & Memory"),
  "structs": placeholderSteps("Classes & Objects"),
  "methods": placeholderSteps("Methods & Overloading"),
  "interfaces": placeholderSteps("Interfaces & Abstract Classes"),
  "error-handling": placeholderSteps("Exceptions & Error Handling"),
  "packages-and-modules": placeholderSteps("Packages & Imports"),
  "concurrency": placeholderSteps("Threads & Concurrency"),
  "testing-basics": placeholderSteps("Testing with JUnit"),
  "http-basics": placeholderSteps("HTTP & HttpClient"),
  "json-encoding": placeholderSteps("JSON with Gson/Jackson"),
  "select-statement": placeholderSteps("Streams & Lambdas"),
};
