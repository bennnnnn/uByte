import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "console.log Basics",
    instruction:
      "`console.log()` accepts multiple arguments, separating them with spaces. Print \"Hello\" on one line and \"World\" on the next using two separate calls.",
    starter: `// TODO: print "Hello" on one line
// TODO: print "World" on the next line`,
    expectedOutput: ["Hello", "World"],
    hint: "Two separate console.log() calls, each with one string.",
  },
  {
    title: "Template Literals with Expressions",
    instruction:
      "Template literals can embed any JavaScript expression. Print the message \"Name: Alice, Age: 30\" using variables `name` and `age` inside a template literal.",
    starter: `const name = "Alice";
const age = 30;
// TODO: use a template literal to print "Name: Alice, Age: 30"`,
    expectedOutput: ["Alice", "30"],
    hint: "console.log(`Name: ${name}, Age: ${age}`);",
  },
  {
    title: "Float Formatting",
    instruction:
      "Use `.toFixed(n)` to format a number to n decimal places. Print Pi (3.14159) with exactly 2 decimal places so the output shows \"3.14\".",
    starter: `const pi = 3.14159;
// TODO: print pi with 2 decimal places using .toFixed(2)`,
    expectedOutput: ["3.14"],
    hint: "console.log(pi.toFixed(2)); — .toFixed returns a string \"3.14\".",
  },
  {
    title: "Build a URL with Template Literals",
    instruction:
      "Template literals replace `Sprintf` from other languages. Build the URL string `\"http://localhost:8080/api\"` from variables `host` and `port`, store it in `url`, then print it.",
    starter: `const host = "localhost";
const port = 8080;
// TODO: build "http://localhost:8080/api" using a template literal
let url = "";
console.log(url);`,
    expectedOutput: ["localhost:8080"],
    hint: "url = `http://${host}:${port}/api`;",
  },
  {
    title: "console.log with Multiple Values",
    instruction:
      "Pass multiple arguments to `console.log` — it prints them space-separated. Print the integer 42 and the string \"hello\" each on their own line, prefixed with their type: e.g. \"number: 42\".",
    starter: `const n = 42;
const s = "hello";
// TODO: print "number: 42" using typeof and n
// TODO: print "string: hello" using typeof and s`,
    expectedOutput: ["number", "string"],
    hint: "console.log(`${typeof n}: ${n}`); and the same for s.",
  },
];
