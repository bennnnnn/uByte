import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Hello, World!",
    instruction:
      "JavaScript runs directly in the browser and in Node.js. The `console.log()` function prints output to the console. Click Run to see your first JavaScript program in action.",
    starter: `console.log("Hello, World!");`,
    expectedOutput: ["Hello, World!"],
    hint: "The program is already complete — just click Run and watch the output appear.",
  },
  {
    title: "Print Multiple Lines",
    instruction:
      "You can call `console.log()` as many times as you like — each call prints one line. Update the program to print two lines: one containing the word \"JavaScript\" and one containing the word \"Beginner\".",
    starter: `console.log("I am learning JavaScript");
// TODO: print a second line containing the word "Beginner"`,
    expectedOutput: ["JavaScript", "Beginner"],
    hint: "Add a second console.log() call below the first one.",
  },
  {
    title: "Use Variables",
    instruction:
      "Declare variables with `let` (mutable) or `const` (immutable). Declare a `const` named `language` with value \"JavaScript\" and a `let` named `version` with value 2024. Print the message \"Learning JavaScript version 2024\".",
    starter: `const language = "JavaScript";
let version = 2024;
// TODO: print "Learning JavaScript version 2024" using template literals or concatenation`,
    expectedOutput: ["Learning JavaScript version 2024"],
    hint: "console.log(`Learning ${language} version ${version}`); — use a template literal with backticks.",
  },
  {
    title: "Template Literals",
    instruction:
      "Template literals (backtick strings) let you embed expressions with `${...}`. Build the greeting \"Hello, Learner!\" from a variable `name = \"Learner\"` and print it.",
    starter: `const name = "Learner";
// TODO: use a template literal to build "Hello, Learner!" and print it`,
    expectedOutput: ["Hello, Learner!"],
    hint: "console.log(`Hello, ${name}!`);",
  },
  {
    title: "Add Comments",
    instruction:
      "JavaScript supports single-line comments with `//` and multi-line comments with `/* */`. Add a `//` comment above the console.log describing what it does, then make sure the program prints \"Comments done!\".",
    starter: `// TODO: add a comment here describing what the next line does
console.log("Comments done!");`,
    expectedOutput: ["Comments done!"],
    hint: "A comment looks like: // This prints a confirmation message.",
  },
];
