import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "import a Module",
    instruction:
      "Python's standard library is huge. Import the `math` module and use `math.sqrt` to compute the square root of 144. Print the result.",
    starter: `# TODO: import math, print math.sqrt(144)
`,
    expectedOutput: ["12.0"],
    hint: "import math\nprint(math.sqrt(144))",
  },
  {
    title: "from ... import",
    instruction:
      "Use `from module import name` to import just what you need. Import `pi` and `ceil` from `math`. Print `ceil(pi)`.",
    starter: `# TODO: from math import pi, ceil
# print ceil(pi)
`,
    expectedOutput: ["4"],
    hint: "from math import pi, ceil\nprint(ceil(pi))",
  },
  {
    title: "Import with Alias",
    instruction:
      "Long module names can be aliased with `as`. Import `datetime` from the `datetime` module as `dt`. Create today's date with `dt.today()` and print the year.",
    starter: `# TODO: from datetime import datetime as dt
# print dt.today().year
`,
    expectedOutput: ["2026"],
    hint: "from datetime import datetime as dt\nprint(dt.today().year)",
  },
  {
    title: "Create Your Own Module",
    instruction:
      "Any `.py` file is a module. Imagine `utils.py` contains `def add(a, b): return a + b`. Write code as if it were imported: define `add` inline and call it with 3 and 4. Print the result — this is exactly what importing does.",
    starter: `# Simulate importing from a module
def add(a, b):
    return a + b

# TODO: call add(3, 4) and print the result
`,
    expectedOutput: ["7"],
    hint: "print(add(3, 4))",
  },
  {
    title: "__name__ == '__main__'",
    instruction:
      "The `if __name__ == \"__main__\":` guard ensures code only runs when a file is executed directly, not when it's imported. Complete the guard so that `\"Running!\"` is printed only in direct execution.",
    starter: `def main():
    print("Running!")

# TODO: add the if __name__ == "__main__" guard that calls main()
`,
    expectedOutput: ["Running!"],
    hint: "if __name__ == \"__main__\":\n    main()",
  },
];
