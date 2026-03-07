import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define and Call a Function",
    instruction:
      "Functions are reusable blocks of code defined with `def`. Define a function `greet(name)` that returns `\"Hello, \" + name + \"!\"`, then call it with `\"Alice\"` and print the result.",
    starter: `# TODO: define greet(name) that returns "Hello, <name>!"

print(greet("Alice"))`,
    expectedOutput: ["Hello, Alice!"],
    hint: "def greet(name):\n    return \"Hello, \" + name + \"!\"",
  },
  {
    title: "Default Arguments",
    instruction:
      "Default argument values make parameters optional. Update `greet` to have a default `greeting=\"Hello\"` so that `greet(\"Bob\")` prints `\"Hello, Bob!\"` and `greet(\"Bob\", \"Hi\")` prints `\"Hi, Bob!\"`.",
    starter: `def greet(name, greeting="Hello"):
    # TODO: return f"{greeting}, {name}!"
    return ""

print(greet("Bob"))
print(greet("Bob", "Hi"))`,
    expectedOutput: ["Hello, Bob!", "Hi, Bob!"],
    hint: "return f\"{greeting}, {name}!\"",
  },
  {
    title: "Multiple Return Values",
    instruction:
      "Python functions can return multiple values as a tuple. Define `min_max(nums)` that returns `(min_val, max_val)` for a list. Call it with `[3, 1, 4, 1, 5]` and print both values on separate lines.",
    starter: `# TODO: define min_max(nums) returning (min, max)

low, high = min_max([3, 1, 4, 1, 5])
print(low)
print(high)`,
    expectedOutput: ["1", "5"],
    hint: "def min_max(nums):\n    return min(nums), max(nums)",
  },
  {
    title: "Lambda Functions",
    instruction:
      "A `lambda` creates a small anonymous function in one line. Create a lambda `double` that takes a number and returns it multiplied by 2. Call it with 7 and print the result.",
    starter: `# TODO: double = lambda x: ...
double = None
print(double(7))`,
    expectedOutput: ["14"],
    hint: "double = lambda x: x * 2",
  },
  {
    title: "Functions as Arguments",
    instruction:
      "Functions are first-class values — you can pass them to other functions. Define `apply(f, x)` that calls `f(x)` and returns the result. Call it with a squaring function and 5, then print.",
    starter: `# TODO: define apply(f, x) that returns f(x)

square = lambda x: x ** 2
print(apply(square, 5))`,
    expectedOutput: ["25"],
    hint: "def apply(f, x):\n    return f(x)",
  },
];
