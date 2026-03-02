import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "print() and sep",
    instruction:
      "`print()` adds a newline by default. Print \"Hello\" and \"World\" on separate lines using two print calls.",
    starter: `# TODO: print "Hello" then "World" on two lines
print("Hello")
print("World")`,
    expectedOutput: ["Hello", "World"],
    hint: "Each print() outputs one line.",
  },
  {
    title: "f-strings",
    instruction:
      "Use an f-string to print \"Name: Alice, Age: 30\" using variables name and age.",
    starter: `name = "Alice"
age = 30
# TODO: print with f-string
print(f"Name: {name}, Age: {age}")`,
    expectedOutput: ["Alice", "30"],
    hint: "f\"Name: {name}, Age: {age}\"",
  },
  {
    title: "Float Formatting",
    instruction:
      "Use f-string formatting to print Pi (3.14159) with exactly 2 decimal places.",
    starter: `pi = 3.14159
# TODO: print with 2 decimal places
print(f"{pi:.2f}")`,
    expectedOutput: ["3.14"],
    hint: "f\"{pi:.2f}\" gives 2 decimal places.",
  },
];
