import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Event Loop Basics",
    instruction:
      "JavaScript is single-threaded with an event loop. `setTimeout(fn, 0)` schedules `fn` after the current synchronous code finishes. Log `\"sync\"`, then schedule `console.log(\"async\")` with 0ms delay. What order do they print?",
    starter: `console.log("sync");
// TODO: setTimeout(() => console.log("async"), 0)
`,
    expectedOutput: ["sync", "async"],
    hint: "setTimeout(() => console.log(\"async\"), 0);",
  },
  {
    title: "Microtask vs Macrotask",
    instruction:
      "Promises (microtasks) run before `setTimeout` (macrotask). Log `\"start\"`, queue a promise `.then` that logs `\"microtask\"`, then `setTimeout` logging `\"macrotask\"`. Notice the order.",
    starter: `console.log("start");
Promise.resolve().then(() => console.log("microtask"));
// TODO: setTimeout logging "macrotask", 0ms
console.log("end");`,
    expectedOutput: ["start", "end", "microtask", "macrotask"],
    hint: "setTimeout(() => console.log(\"macrotask\"), 0);",
  },
  {
    title: "Debounce",
    instruction:
      "A debounce delays execution until a burst of calls has stopped. Implement `debounce(fn, delay)` that returns a debounced version of `fn`. Each call resets the timer. Log `\"called\"` once after rapid calls.",
    starter: `function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    // TODO: timer = setTimeout(() => fn(...args), delay)
  };
}

const log = debounce(() => console.log("called"), 50);
log(); log(); log();`,
    expectedOutput: ["called"],
    hint: "timer = setTimeout(() => fn(...args), delay);",
  },
  {
    title: "Promise Queue",
    instruction:
      "Process async tasks one at a time using an array of thunks. Reduce over them, chaining `.then` so each runs after the previous. Log 1, 2, 3 in order.",
    starter: `const tasks = [
  () => Promise.resolve(1),
  () => Promise.resolve(2),
  () => Promise.resolve(3),
];

tasks
  .reduce((chain, task) => chain.then(() => task()), Promise.resolve())
  // TODO: .then(v => console.log(v)) won't work directly — iterate differently
  ;

// Simplify: run each and log
async function main() {
  for (const task of tasks) {
    const v = await task();
    console.log(v);
  }
}
main();`,
    expectedOutput: ["1", "2", "3"],
    hint: "The async for loop approach is already complete — run it to see the sequential output.",
  },
  {
    title: "Generator as Async Iterator",
    instruction:
      "Generators can be used as lazy async iterators. Define an async generator `range(n)` that `yield`s numbers 1 to `n`. Use `for await...of` to consume it and log each value for n=3.",
    starter: `async function* range(n) {
  // TODO: yield 1 to n
}

async function main() {
  for await (const i of range(3)) {
    console.log(i);
  }
}
main();`,
    expectedOutput: ["1", "2", "3"],
    hint: "for (let i = 1; i <= n; i++) yield i;",
  },
];
