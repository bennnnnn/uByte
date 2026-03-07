import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "JSON.stringify",
    instruction:
      "`JSON.stringify` converts a JavaScript value to a JSON string. Stringify `{name: \"Alice\", age: 30}` and log the result.",
    starter: `const person = { name: "Alice", age: 30 };
// TODO: log JSON.stringify(person)
`,
    expectedOutput: ['{"name":"Alice","age":30}'],
    hint: "console.log(JSON.stringify(person));",
  },
  {
    title: "JSON.parse",
    instruction:
      "`JSON.parse` converts a JSON string back to a value. Parse the raw string and log `data.city`.",
    starter: `const raw = '{"city":"London","pop":9000000}';
// TODO: parse raw and log city
`,
    expectedOutput: ["London"],
    hint: "const data = JSON.parse(raw);\nconsole.log(data.city);",
  },
  {
    title: "Pretty Print",
    instruction:
      "Pass a third argument to `JSON.stringify` to format with indentation. Log the `config` object with `2`-space indentation.",
    starter: `const config = { host: "localhost", port: 8080, debug: true };
// TODO: log JSON.stringify(config, null, 2)
`,
    expectedOutput: ['{\n  "host": "localhost",\n  "port": 8080,\n  "debug": true\n}'],
    hint: "console.log(JSON.stringify(config, null, 2));",
  },
  {
    title: "Replacer Function",
    instruction:
      "The second argument to `JSON.stringify` can be a replacer function. Use one to omit the `\"password\"` key from the output. Log the result.",
    starter: `const user = { name: "Alice", password: "secret", age: 30 };
// TODO: JSON.stringify with replacer that skips "password"
`,
    expectedOutput: ['{"name":"Alice","age":30}'],
    hint: "JSON.stringify(user, (key, value) => key === \"password\" ? undefined : value)",
  },
  {
    title: "Round-Trip",
    instruction:
      "Encode and then decode. Stringify `{score: 99}`, parse it back, and log the `score` property.",
    starter: `const original = { score: 99 };
// TODO: stringify, parse back, log score
`,
    expectedOutput: ["99"],
    hint: "const s = JSON.stringify(original);\nconst back = JSON.parse(s);\nconsole.log(back.score);",
  },
];
