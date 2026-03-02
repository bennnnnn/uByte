import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Hello, World!",
    instruction:
      "Every Python script runs from top to bottom. The `print()` function outputs text to the console. Click Run to see your first Python program in action.",
    starter: `print("Hello, World!")`,
    expectedOutput: ["Hello, World!"],
    hint: "The program is already complete — just click Run and watch the output appear.",
  },
  {
    title: "Print Multiple Lines",
    instruction:
      "You can call `print()` as many times as you like — each call prints one line. Update the program to print two lines: one that contains the word \"Python\" and one that contains the word \"Beginner\".",
    starter: `print("I am learning Python")
# TODO: print a second line containing the word "Beginner"`,
    expectedOutput: ["Python", "Beginner"],
    hint: "Add a second print() call below the first one.",
  },
  {
    title: "Use Variables",
    instruction:
      "In Python you assign with `=`. Use variables `language` and `version` to build the message \"Learning Python version 3\" and print it.",
    starter: `language = "Python"
version = 3
# TODO: print "Learning Python version 3" using the variables
`,
    expectedOutput: ["Learning Python version 3"],
    hint: "Use an f-string: print(f\"Learning {language} version {version}\")",
  },
  {
    title: "Format with f-strings",
    instruction:
      "f-strings let you embed expressions in strings. Build the greeting \"Hello, Learner!\" using a variable `name = \"Learner\"` and an f-string, then print it.",
    starter: `name = "Learner"
# TODO: use an f-string to build "Hello, Learner!" and print it
greeting = ""
print(greeting)`,
    expectedOutput: ["Hello, Learner!"],
    hint: "greeting = f\"Hello, {name}!\"",
  },
  {
    title: "Add Comments",
    instruction:
      "Comments start with `#` and are ignored by Python. Add a `#` comment above the print call describing what it does, then make sure the program prints \"Comments done!\".",
    starter: `# TODO: add a comment here describing what the next line does
print("Comments done!")`,
    expectedOutput: ["Comments done!"],
    hint: "A comment looks like: # This prints a confirmation message.",
  },
];
