import type { TutorialStep } from "../types";
import { steps as gettingStarted } from "./getting-started";
import { steps as variablesAndTypes } from "./variables-and-types";
import { steps as ioFormatting } from "./io-formatting";

function placeholderSteps(title: string): TutorialStep[] {
  return [
    {
      title,
      instruction: "This tutorial is being translated to C++. Try the Go version for now, or check back soon.",
      starter: `#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++" << std::endl;\n    return 0;\n}`,
      expectedOutput: ["Hello from C++"],
    },
  ];
}

export const cppSteps: Record<string, TutorialStep[]> = {
  "getting-started": gettingStarted,
  "variables-and-types": variablesAndTypes,
  "fmt-package": ioFormatting,
  "control-flow": placeholderSteps("Control Flow"),
  "loops": placeholderSteps("Loops"),
  "arrays-and-slices": placeholderSteps("Arrays & Vectors"),
  "maps": placeholderSteps("Maps & Unordered Maps"),
  "functions": placeholderSteps("Functions"),
  "pointers": placeholderSteps("Pointers & References"),
  "structs": placeholderSteps("Structs & Classes"),
  "methods": placeholderSteps("Member Functions"),
  "interfaces": placeholderSteps("Virtual Functions & Polymorphism"),
  "error-handling": placeholderSteps("Exceptions"),
  "packages-and-modules": placeholderSteps("Headers & Namespaces"),
  "concurrency": placeholderSteps("Threads & Concurrency"),
  "testing-basics": placeholderSteps("Testing"),
  "http-basics": placeholderSteps("HTTP"),
  "json-encoding": placeholderSteps("JSON"),
  "select-statement": placeholderSteps("Select / Async I/O"),
};
