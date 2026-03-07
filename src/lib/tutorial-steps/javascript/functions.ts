import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Function Declaration",
    instruction:
      "Declare a function with the `function` keyword. Define `greet(name)` that returns `\"Hello, \" + name + \"!\"`. Call it with `\"Alice\"` and log the result.",
    starter: `// TODO: function greet(name) returning "Hello, <name>!"

console.log(greet("Alice"));`,
    expectedOutput: ["Hello, Alice!"],
    hint: "function greet(name) { return \"Hello, \" + name + \"!\"; }",
  },
  {
    title: "Arrow Function",
    instruction:
      "Arrow functions are a concise syntax for functions. Rewrite `greet` as an arrow function: `const greet = (name) => ...`. Call it with `\"Bob\"` and log.",
    starter: `// TODO: const greet = (name) => "Hello, " + name + "!"

console.log(greet("Bob"));`,
    expectedOutput: ["Hello, Bob!"],
    hint: "const greet = (name) => \"Hello, \" + name + \"!\";",
  },
  {
    title: "Default Parameters",
    instruction:
      "Give a parameter a default value with `=`. Define `greet(name, greeting = \"Hello\")`. Test `greet(\"Carol\")` and `greet(\"Carol\", \"Hi\")` — log both.",
    starter: `function greet(name, greeting = "Hello") {
  // TODO: return greeting + ", " + name + "!"
  return "";
}

console.log(greet("Carol"));
console.log(greet("Carol", "Hi"));`,
    expectedOutput: ["Hello, Carol!", "Hi, Carol!"],
    hint: "return greeting + \", \" + name + \"!\";",
  },
  {
    title: "Rest Parameters",
    instruction:
      "`...args` collects remaining arguments into an array. Define `sum(...nums)` that returns the total. Call it with `1, 2, 3, 4, 5` and log the result.",
    starter: `// TODO: function sum(...nums) returning their total

console.log(sum(1, 2, 3, 4, 5));`,
    expectedOutput: ["15"],
    hint: "function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }",
  },
  {
    title: "Closures",
    instruction:
      "A closure captures variables from its surrounding scope. Define `counter()` that returns a function which increments and returns a count. Call the returned function three times and log each result.",
    starter: `// TODO: function counter() returning a function that increments and returns count

const next = counter();
console.log(next());
console.log(next());
console.log(next());`,
    expectedOutput: ["1", "2", "3"],
    hint: "function counter() { let count = 0; return () => ++count; }",
  },
];
