import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Simple assert Helper",
    instruction:
      "Without a framework, you can write a minimal assert. Define `assert(name, condition)` that logs `\"PASS: <name>\"` or `\"FAIL: <name>\"`. Test `add(2, 3) === 5`.",
    starter: `function add(a, b) { return a + b; }

// TODO: function assert(name, condition) logging PASS or FAIL

assert("2+3=5", add(2, 3) === 5);`,
    expectedOutput: ["PASS: 2+3=5"],
    hint: "function assert(name, condition) { console.log((condition ? \"PASS: \" : \"FAIL: \") + name); }",
  },
  {
    title: "Test Multiple Cases",
    instruction:
      "Good tests cover edge cases. Use your `assert` helper to test `add(0, 0) === 0`, `add(-1, 1) === 0`, and `add(100, 200) === 300`. All should pass.",
    starter: `function add(a, b) { return a + b; }
function assert(name, condition) { console.log((condition ? "PASS: " : "FAIL: ") + name); }

// TODO: assert three cases
`,
    expectedOutput: ["PASS: 0+0", "PASS: -1+1", "PASS: 100+200"],
    hint: "assert(\"0+0\", add(0,0)===0);\nassert(\"-1+1\", add(-1,1)===0);\nassert(\"100+200\", add(100,200)===300);",
  },
  {
    title: "Test Throws",
    instruction:
      "Test that a function throws by wrapping it in a try-catch. Write `assertThrows(name, fn)` that passes if `fn()` throws. Test `divide(10, 0)` throws.",
    starter: `function divide(a, b) {
  if (b === 0) throw new Error("zero");
  return a / b;
}

// TODO: function assertThrows(name, fn)

assertThrows("divide by zero", () => divide(10, 0));`,
    expectedOutput: ["PASS: divide by zero"],
    hint: "function assertThrows(name, fn) { try { fn(); console.log(\"FAIL: \" + name); } catch { console.log(\"PASS: \" + name); } }",
  },
  {
    title: "Test Async Functions",
    instruction:
      "Async functions need an `async` test runner. Write `asyncAssert(name, fn)` that awaits `fn()` and catches errors. Test a function that resolves with 42.",
    starter: `async function fetchValue() { return 42; }

async function asyncAssert(name, fn) {
  try {
    await fn();
    console.log("PASS: " + name);
  } catch (e) {
    console.log("FAIL: " + name + " - " + e.message);
  }
}

asyncAssert("fetchValue returns 42", async () => {
  const v = await fetchValue();
  // TODO: throw if v !== 42
});`,
    expectedOutput: ["PASS: fetchValue returns 42"],
    hint: "if (v !== 42) throw new Error(\"expected 42\");",
  },
];
