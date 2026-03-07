import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "try / catch",
    instruction:
      "Wrap risky code in `try` and catch errors with `catch`. Attempt `JSON.parse(\"invalid\")`. Catch the `SyntaxError` and log `\"Parse error\"`.",
    starter: `try {
  JSON.parse("invalid");
} catch (e) {
  // TODO: log "Parse error"
}`,
    expectedOutput: ["Parse error"],
    hint: "console.log(\"Parse error\");",
  },
  {
    title: "throw an Error",
    instruction:
      "Use `throw new Error(message)` to signal problems. Define `divide(a, b)` that throws `\"Cannot divide by zero\"` when `b === 0`. Catch it and log the message.",
    starter: `function divide(a, b) {
  // TODO: throw Error if b === 0
  return a / b;
}

try {
  divide(10, 0);
} catch (e) {
  console.log(e.message);
}`,
    expectedOutput: ["Cannot divide by zero"],
    hint: "if (b === 0) throw new Error(\"Cannot divide by zero\");",
  },
  {
    title: "finally",
    instruction:
      "`finally` runs whether or not an exception was thrown. Try to parse `\"bad json\"`, catch the error silently, and in `finally` log `\"always runs\"`.",
    starter: `try {
  JSON.parse("bad json");
} catch (_e) {
  // error silently ignored
} finally {
  // TODO: log "always runs"
}`,
    expectedOutput: ["always runs"],
    hint: "console.log(\"always runs\");",
  },
  {
    title: "Custom Error Class",
    instruction:
      "Extend `Error` to create a custom exception. Define `ValidationError extends Error`. Throw it with message `\"Invalid age\"` in `validateAge(-1)`. Catch and log `e.name + \": \" + e.message`.",
    starter: `class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateAge(age) {
  // TODO: throw ValidationError if age < 0
}

try {
  validateAge(-1);
} catch (e) {
  console.log(e.name + ": " + e.message);
}`,
    expectedOutput: ["ValidationError: Invalid age"],
    hint: "if (age < 0) throw new ValidationError(\"Invalid age\");",
  },
  {
    title: "Error in Promise",
    instruction:
      "`async/await` errors are caught the same way. Define an `async` function that calls a rejected promise. Catch the error and log `\"Caught: \" + e.message`.",
    starter: `async function riskyOp() {
  await Promise.reject(new Error("network failure"));
}

async function main() {
  try {
    await riskyOp();
  } catch (e) {
    // TODO: log "Caught: " + e.message
  }
}

main();`,
    expectedOutput: ["Caught: network failure"],
    hint: "console.log(\"Caught: \" + e.message);",
  },
];
