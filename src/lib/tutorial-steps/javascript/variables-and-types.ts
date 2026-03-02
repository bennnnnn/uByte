import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "let and const",
    instruction:
      "Use `const` for values that won't be reassigned and `let` for values that will. Declare a `const` named `name` with value \"Alice\" and a `let` named `age` with value 30. Print both on separate lines.",
    starter: `// TODO: declare name (const) = "Alice"
// TODO: declare age (let) = 30
// TODO: print name, then print age`,
    expectedOutput: ["Alice", "30"],
    hint: "const name = \"Alice\"; then let age = 30; then two console.log() calls.",
  },
  {
    title: "Dynamic Types",
    instruction:
      "JavaScript is dynamically typed — a variable can hold any type. Declare `city` as \"London\" and `population` as 9000000, then reassign `city` to a number 42 and print both values of city.",
    starter: `let city = "London";
let population = 9000000;
console.log(city);
// TODO: reassign city to 42
// TODO: print city again (it will be a number now)`,
    expectedOutput: ["London", "42"],
    hint: "city = 42; then console.log(city);",
  },
  {
    title: "typeof Operator",
    instruction:
      "`typeof` returns a string describing a value's type. Print the type of `42`, `\"hello\"`, `true`, and `undefined` using `typeof` — one per line.",
    starter: `// TODO: print typeof 42
// TODO: print typeof "hello"
// TODO: print typeof true
// TODO: print typeof undefined`,
    expectedOutput: ["number", "string", "boolean", "undefined"],
    hint: "console.log(typeof 42); etc. — each will print the type name.",
  },
  {
    title: "String Methods",
    instruction:
      "JavaScript strings have many built-in methods. Use `.toUpperCase()` on \"hello\" and `.slice(0, 3)` on \"JavaScript\" to get \"Jav\". Print both results.",
    starter: `const word = "hello";
const lang = "JavaScript";
// TODO: print word.toUpperCase()
// TODO: print lang.slice(0, 3)`,
    expectedOutput: ["HELLO", "Jav"],
    hint: "console.log(word.toUpperCase()); and console.log(lang.slice(0, 3));",
  },
  {
    title: "Type Coercion and Conversion",
    instruction:
      "Convert types explicitly with `Number()`, `String()`, and `Boolean()`. Convert the string \"42\" to a number, add 8, and print the result. Then convert the number 0 to boolean and print it.",
    starter: `const strNum = "42";
// TODO: convert strNum to a number, add 8, print result (should be 50)
// TODO: convert 0 to boolean and print it (should be false)`,
    expectedOutput: ["50", "false"],
    hint: "console.log(Number(strNum) + 8); and console.log(Boolean(0));",
  },
  {
    title: "const for Constants",
    instruction:
      "Use `const` for values that never change. Declare `const PI = 3.14159` and compute the area of a circle with radius 5. Print the result rounded to 2 decimal places using `.toFixed(2)`.",
    starter: `const PI = 3.14159;
const radius = 5;
// TODO: calculate area = PI * radius * radius
// TODO: print area.toFixed(2) (should be "78.54")`,
    expectedOutput: ["78.54"],
    hint: "const area = PI * radius * radius; then console.log(area.toFixed(2));",
  },
];
