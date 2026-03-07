import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "References vs Values",
    instruction:
      "Primitives (numbers, strings) are copied by value; objects and arrays are passed by reference. Assign `a = [1, 2, 3]` and `b = a`. Push 4 to `b`, then log `a` — what do you get?",
    starter: `const a = [1, 2, 3];
const b = a;
// TODO: push 4 to b, then console.log(a)
`,
    expectedOutput: ["[ 1, 2, 3, 4 ]"],
    hint: "b.push(4);\nconsole.log(a);  // a and b point to the same array",
  },
  {
    title: "Shallow Copy",
    instruction:
      "Use the spread operator `[...arr]` or `arr.slice()` to get an independent copy. Copy `a = [1, 2, 3]` into `b`, push 4 to `b`, then log both — they should differ.",
    starter: `const a = [1, 2, 3];
// TODO: const b = [...a]; push 4 to b; log a then b
`,
    expectedOutput: ["[ 1, 2, 3 ]", "[ 1, 2, 3, 4 ]"],
    hint: "const b = [...a];\nb.push(4);\nconsole.log(a);\nconsole.log(b);",
  },
  {
    title: "Object Reference",
    instruction:
      "Objects behave the same way. Assign `obj = {x: 1}` and `ref = obj`. Change `ref.x = 99`. Log `obj.x`.",
    starter: `const obj = { x: 1 };
const ref = obj;
// TODO: ref.x = 99; console.log(obj.x)
`,
    expectedOutput: ["99"],
    hint: "ref.x = 99;\nconsole.log(obj.x);",
  },
  {
    title: "Object Spread Copy",
    instruction:
      "Use `{ ...obj }` to shallow-copy an object. Copy `person`, update the copy's name to `\"Bob\"`, and log both names — they should differ.",
    starter: `const person = { name: "Alice", age: 30 };
// TODO: const copy = {...person}; copy.name = "Bob"; log person.name then copy.name
`,
    expectedOutput: ["Alice", "Bob"],
    hint: "const copy = { ...person };\ncopy.name = \"Bob\";\nconsole.log(person.name);\nconsole.log(copy.name);",
  },
  {
    title: "const vs let for Objects",
    instruction:
      "`const` prevents reassignment of the variable, but the object itself is still mutable. Declare `const arr = [1, 2]` and push 3. Log the final array — `const` is not the same as frozen!",
    starter: `const arr = [1, 2];
// TODO: arr.push(3); console.log(arr)
`,
    expectedOutput: ["[ 1, 2, 3 ]"],
    hint: "arr.push(3);\nconsole.log(arr);",
  },
];
