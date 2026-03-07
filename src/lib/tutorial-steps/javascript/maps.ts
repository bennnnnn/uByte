import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Object as Map",
    instruction:
      "Plain objects work great as key-value stores. Create `person` with `name: \"Alice\"` and `age: 30`. Print the name.",
    starter: `// TODO: const person = { name: "Alice", age: 30 }; console.log(person.name)
`,
    expectedOutput: ["Alice"],
    hint: "const person = { name: \"Alice\", age: 30 };\nconsole.log(person.name);",
  },
  {
    title: "Update and Delete",
    instruction:
      "Update a key with assignment; delete one with the `delete` operator. Update `person.age` to 31, delete `person.city`, then log the whole object.",
    starter: `const person = { name: "Alice", age: 30, city: "London" };
// TODO: update age to 31, delete city, console.log(person)
`,
    expectedOutput: ["{ name: 'Alice', age: 31 }"],
    hint: "person.age = 31;\ndelete person.city;\nconsole.log(person);",
  },
  {
    title: "Map Object",
    instruction:
      "`Map` allows any type as a key and remembers insertion order. Create a `Map`, set `\"math\" → 95` and `\"english\" → 88`, then get and print the math score.",
    starter: `const scores = new Map();
// TODO: set math->95, english->88, console.log scores.get("math")
`,
    expectedOutput: ["95"],
    hint: "scores.set(\"math\", 95);\nscores.set(\"english\", 88);\nconsole.log(scores.get(\"math\"));",
  },
  {
    title: "Iterate a Map",
    instruction:
      "Use `for...of` with `map.entries()`. Print each entry as `\"math: 95\"`.",
    starter: `const scores = new Map([["math", 95], ["english", 88]]);
// TODO: for...of entries, print "key: value"
`,
    expectedOutput: ["math: 95", "english: 88"],
    hint: "for (const [subject, score] of scores.entries()) { console.log(`${subject}: ${score}`); }",
  },
  {
    title: "Object Destructuring",
    instruction:
      "Destructuring extracts values from an object into variables. Destructure `name` and `age` from `person`, then print both on separate lines.",
    starter: `const person = { name: "Bob", age: 25, city: "Paris" };
// TODO: destructure name and age, print each
`,
    expectedOutput: ["Bob", "25"],
    hint: "const { name, age } = person;\nconsole.log(name);\nconsole.log(age);",
  },
];
