import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Named Export and Import",
    instruction:
      "ES modules use `export` and `import`. Imagine a file that exports `add`. In one block, define `add`, export it conceptually, then import-style call it. For now — define `add` and call it with 3, 4. Log the result.",
    starter: `// In a module you'd write: export function add(a, b) { return a + b; }
// Here we simulate it directly:
function add(a, b) {
  // TODO: return a + b
}

console.log(add(3, 4));`,
    expectedOutput: ["7"],
    hint: "return a + b;",
  },
  {
    title: "Default Export",
    instruction:
      "A module can have one `default` export. Simulate a default export by defining `greet` and calling it. `greet(\"Alice\")` should return `\"Hello, Alice!\"`.",
    starter: `// Normally: export default function greet(name) { ... }
// Simulated here:
function greet(name) {
  // TODO: return "Hello, " + name + "!"
  return "";
}

console.log(greet("Alice"));`,
    expectedOutput: ["Hello, Alice!"],
    hint: "return \"Hello, \" + name + \"!\";",
  },
  {
    title: "CommonJS require",
    instruction:
      "Node.js uses `require` for CommonJS modules. Simulate it by using the built-in `Math` object (it's always available). Log `Math.max(3, 7, 2)`.",
    starter: `// In Node: const path = require("path");
// The Math object is always available — simulate a "required" utility:
console.log(Math.max(3, 7, 2));`,
    expectedOutput: ["7"],
    hint: "The code is complete — just run it to see Math.max in action.",
  },
  {
    title: "Dynamic Import",
    instruction:
      "`import()` loads a module lazily and returns a Promise. Simulate this pattern by wrapping a function in a resolved promise, then `await` it and call it.",
    starter: `async function main() {
  // Simulate dynamic import
  const mod = await Promise.resolve({ add: (a, b) => a + b });
  // TODO: log mod.add(5, 6)
}

main();`,
    expectedOutput: ["11"],
    hint: "console.log(mod.add(5, 6));",
  },
  {
    title: "Barrel File Pattern",
    instruction:
      "A barrel file re-exports multiple modules from one place. Simulate it by defining `add` and `multiply` inline, then calling both. Log `add(2,3)` and `multiply(2,3)`.",
    starter: `// In a barrel: export { add } from "./add"; export { multiply } from "./multiply";
// Simulated:
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

// TODO: log add(2, 3) and multiply(2, 3)
`,
    expectedOutput: ["5", "6"],
    hint: "console.log(add(2, 3));\nconsole.log(multiply(2, 3));",
  },
];
