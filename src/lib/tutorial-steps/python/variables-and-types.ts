import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Assign Variables",
    instruction:
      "In Python you assign with `=`. No keyword needed. Assign `name = \"Alice\"` and `age = 30`, then print both on separate lines.",
    starter: `# TODO: assign name and age, then print both
name = ""
age = 0
print(name)
print(age)`,
    expectedOutput: ["Alice", "30"],
    hint: "name = \"Alice\" and age = 30",
  },
  {
    title: "Type Inference",
    instruction:
      "Python infers types automatically. Assign `city = \"London\"` and `population = 9_000_000`, then print both.",
    starter: `# TODO: assign city and population, then print both
city = ""
population = 0
print(city)
print(population)`,
    expectedOutput: ["London", "9000000"],
    hint: "Python uses _ as digit separator: 9_000_000",
  },
  {
    title: "Default Values",
    instruction:
      "Unassigned names don't exist in Python — you must assign before use. Assign `n = 0`, `b = False`, and `s = \"\"`, then print `n` and `b`.",
    starter: `n = 0
b = False
s = ""
# TODO: print n and b
`,
    expectedOutput: ["0", "False"],
    hint: "print(n) then print(b)",
  },
  {
    title: "String Methods",
    instruction:
      "Strings have methods like `.upper()`. Use `\"hello\".upper()` to get uppercase and print the result.",
    starter: `word = "hello"
# TODO: convert to uppercase and print
`,
    expectedOutput: ["HELLO"],
    hint: "print(word.upper())",
  },
  {
    title: "Type Conversion",
    instruction:
      "Use `float(42)` to convert an int to float. Convert `42` to float, print it, then print its type with `type(...)`.",
    starter: `i = 42
# TODO: convert to float, print value and type
f = 0.0
print(f)
print(type(f).__name__)`,
    expectedOutput: ["42", "float"],
    hint: "f = float(i)",
  },
  {
    title: "Constants (by convention)",
    instruction:
      "Python has no real constants; use UPPER_CASE by convention. Set `PI = 3.14159`, then compute area = PI * radius ** 2 for radius 5 and print formatted to 2 decimal places.",
    starter: `PI = 3.14159
radius = 5.0
# TODO: area = PI * radius ** 2, then print with 2 decimal places
area = 0.0
print(f"Area: {area:.2f}")`,
    expectedOutput: ["78.54"],
    hint: "area = PI * radius ** 2",
  },
];
