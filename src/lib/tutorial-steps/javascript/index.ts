import type { TutorialStep } from "../types";
import { steps as gettingStarted } from "./getting-started";
import { steps as variablesAndTypes } from "./variables-and-types";
import { steps as consoleFormatting } from "./console-formatting";

function placeholderSteps(title: string): TutorialStep[] {
  return [
    {
      title,
      instruction: "This tutorial is being translated to JavaScript. Try the Go version for now, or check back soon.",
      starter: `// JavaScript version coming soon\nconsole.log("Hello from JavaScript");`,
      expectedOutput: ["Hello from JavaScript"],
    },
  ];
}

export const javascriptSteps: Record<string, TutorialStep[]> = {
  "getting-started": gettingStarted,
  "variables-and-types": variablesAndTypes,
  "fmt-package": consoleFormatting,
  "control-flow": placeholderSteps("Control Flow"),
  "loops": placeholderSteps("Loops"),
  "arrays-and-slices": placeholderSteps("Arrays"),
  "maps": placeholderSteps("Objects & Maps"),
  "functions": placeholderSteps("Functions"),
  "pointers": placeholderSteps("References & Closures"),
  "structs": placeholderSteps("Classes & Objects"),
  "methods": placeholderSteps("Methods"),
  "interfaces": placeholderSteps("Interfaces & Protocols"),
  "error-handling": placeholderSteps("Error Handling"),
  "packages-and-modules": placeholderSteps("Modules & Imports"),
  "concurrency": placeholderSteps("Promises & Async/Await"),
  "testing-basics": placeholderSteps("Testing with Jest"),
  "http-basics": placeholderSteps("HTTP & fetch"),
  "json-encoding": placeholderSteps("JSON"),
  "select-statement": placeholderSteps("Event Loop & Async"),
};
