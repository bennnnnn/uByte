import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Promises",
    instruction:
      "A `Promise` represents a future value. Create a `Promise` that resolves with `\"done\"`. Call `.then(value => console.log(value))` to handle the resolved value.",
    starter: `const p = new Promise((resolve) => {
  // TODO: resolve with "done"
});

p.then(value => console.log(value));`,
    expectedOutput: ["done"],
    hint: "resolve(\"done\");",
  },
  {
    title: "async / await",
    instruction:
      "`async/await` makes asynchronous code look synchronous. Define `async function getData()` that returns `\"hello\"`. Await it in `main()` and log the result.",
    starter: `async function getData() {
  // TODO: return "hello"
}

async function main() {
  const result = await getData();
  console.log(result);
}

main();`,
    expectedOutput: ["hello"],
    hint: "return \"hello\";",
  },
  {
    title: "Promise.all",
    instruction:
      "`Promise.all` runs promises concurrently and resolves when all finish. Create three resolved promises with `\"a\"`, `\"b\"`, `\"c\"`. Await `Promise.all` and log the resulting array.",
    starter: `async function main() {
  const results = await Promise.all([
    // TODO: three Promise.resolve calls
  ]);
  console.log(results);
}

main();`,
    expectedOutput: ["[ 'a', 'b', 'c' ]"],
    hint: "Promise.resolve(\"a\"),\nPromise.resolve(\"b\"),\nPromise.resolve(\"c\")",
  },
  {
    title: "Promise.race",
    instruction:
      "`Promise.race` resolves with the first settled promise. Create a fast promise that resolves with `\"fast\"` (delay 0) and a slow one (delay 100ms). Race them and log the winner.",
    starter: `async function main() {
  const fast = new Promise(resolve => setTimeout(() => resolve("fast"), 0));
  const slow = new Promise(resolve => setTimeout(() => resolve("slow"), 100));
  const winner = await Promise.race([fast, slow]);
  // TODO: log winner
}

main();`,
    expectedOutput: ["fast"],
    hint: "console.log(winner);",
  },
  {
    title: "async Error Handling",
    instruction:
      "Async errors bubble up just like synchronous ones. Create an async function that rejects, then wrap the `await` in a try-catch. Log `\"Caught: \" + e.message`.",
    starter: `async function fail() {
  throw new Error("async error");
}

async function main() {
  try {
    await fail();
  } catch (e) {
    // TODO: log "Caught: " + e.message
  }
}

main();`,
    expectedOutput: ["Caught: async error"],
    hint: "console.log(\"Caught: \" + e.message);",
  },
];
