import type { TutorialStep } from "../types";
import { steps as gettingStarted } from "./getting-started";
import { steps as variablesAndTypes } from "./variables-and-types";
import { steps as printFormatting } from "./print-formatting";

// Placeholder single-step for tutorials not yet fully translated
function placeholderSteps(title: string): TutorialStep[] {
  return [
    {
      title,
      instruction: "This tutorial is being translated to Python. Try the Go version for now, or check back soon.",
      starter: `# Python version coming soon\nprint("Hello from Python")`,
      expectedOutput: ["Hello from Python"],
    },
  ];
}

export const pythonSteps: Record<string, TutorialStep[]> = {
  "getting-started": gettingStarted,
  "variables-and-types": variablesAndTypes,
  "fmt-package": printFormatting,
  "control-flow": placeholderSteps("Control flow"),
  "loops": placeholderSteps("Loops"),
  "arrays-and-slices": placeholderSteps("Lists and slices"),
  "maps": placeholderSteps("Dictionaries"),
  "functions": placeholderSteps("Functions"),
  "pointers": placeholderSteps("References"),
  "structs": placeholderSteps("Classes and dataclasses"),
  "methods": placeholderSteps("Methods"),
  "interfaces": placeholderSteps("Protocols / ABCs"),
  "error-handling": placeholderSteps("Exceptions"),
  "packages-and-modules": placeholderSteps("Modules"),
  "concurrency": placeholderSteps("Async / threading"),
  "testing-basics": placeholderSteps("Testing"),
  "http-basics": placeholderSteps("HTTP"),
  "json-encoding": placeholderSteps("JSON"),
  "select-statement": placeholderSteps("asyncio.select"),
};
