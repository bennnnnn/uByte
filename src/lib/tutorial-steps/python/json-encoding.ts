import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "json.dumps — Encode to JSON",
    instruction:
      "The `json` module turns Python objects into JSON strings. Use `json.dumps` to encode `{\"name\": \"Alice\", \"age\": 30}` and print the result.",
    starter: `import json

person = {"name": "Alice", "age": 30}
# TODO: encode person to a JSON string and print it
`,
    expectedOutput: ['{"name": "Alice", "age": 30}'],
    hint: "print(json.dumps(person))",
  },
  {
    title: "json.loads — Decode from JSON",
    instruction:
      "`json.loads` parses a JSON string back into a Python object. Parse the given `raw` string and print the value of the `\"city\"` key.",
    starter: `import json

raw = '{"city": "London", "pop": 9000000}'
# TODO: parse raw and print the city
`,
    expectedOutput: ["London"],
    hint: "data = json.loads(raw)\nprint(data[\"city\"])",
  },
  {
    title: "Pretty Print",
    instruction:
      "`json.dumps` accepts `indent` to format output. Encode the `config` dict with `indent=2` and print it.",
    starter: `import json

config = {"host": "localhost", "port": 8080, "debug": True}
# TODO: print with indent=2
`,
    expectedOutput: ['{\n  "host": "localhost",\n  "port": 8080,\n  "debug": true\n}'],
    hint: "print(json.dumps(config, indent=2))",
  },
  {
    title: "Encode a List",
    instruction:
      "JSON supports arrays. Encode the list `[1, \"two\", True, None]` to JSON and print it.",
    starter: `import json

data = [1, "two", True, None]
# TODO: encode to JSON and print
`,
    expectedOutput: ['[1, "two", true, null]'],
    hint: "print(json.dumps(data))",
  },
  {
    title: "Round-Trip",
    instruction:
      "A round-trip encodes an object to JSON and then decodes it back. Encode `{\"score\": 99}`, immediately decode it again, and print the `score` field.",
    starter: `import json

original = {"score": 99}
# TODO: encode to string, decode back, print score
`,
    expectedOutput: ["99"],
    hint: "s = json.dumps(original)\nback = json.loads(s)\nprint(back[\"score\"])",
  },
];
