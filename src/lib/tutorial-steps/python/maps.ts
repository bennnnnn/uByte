import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Create a Dictionary",
    instruction:
      "A Python `dict` maps keys to values. Create a dictionary `person` with keys `\"name\"` → `\"Alice\"` and `\"age\"` → `30`, then print the whole dict.",
    starter: `# TODO: create person dict with name and age
person = {}
print(person)`,
    expectedOutput: ["{'name': 'Alice', 'age': 30}"],
    hint: "person = {\"name\": \"Alice\", \"age\": 30}",
  },
  {
    title: "Access and Update Values",
    instruction:
      "Access a value with `dict[key]`. Update it with `dict[key] = new_value`. Print Alice's name, then update her age to 31 and print the updated age.",
    starter: `person = {"name": "Alice", "age": 30}
# TODO: print person["name"], update age to 31, print person["age"]
`,
    expectedOutput: ["Alice", "31"],
    hint: "print(person[\"name\"])\nperson[\"age\"] = 31\nprint(person[\"age\"])",
  },
  {
    title: "get with Default",
    instruction:
      "`dict.get(key, default)` is safe — it never raises a KeyError. Look up `\"city\"` in `person` with a default of `\"Unknown\"` and print the result.",
    starter: `person = {"name": "Alice", "age": 30}
# TODO: print person.get("city", "Unknown")
`,
    expectedOutput: ["Unknown"],
    hint: "print(person.get(\"city\", \"Unknown\"))",
  },
  {
    title: "Iterate a Dictionary",
    instruction:
      "Use `.items()` to loop over key-value pairs. Loop over `scores` and print each as `\"math: 95\"`. Ensure alphabetical output by iterating in insertion order.",
    starter: `scores = {"math": 95, "english": 88}
# TODO: for key, value in scores.items(): print(f"...")
`,
    expectedOutput: ["math: 95", "english: 88"],
    hint: "for subject, score in scores.items():\n    print(f\"{subject}: {score}\")",
  },
  {
    title: "Delete a Key",
    instruction:
      "Use `del dict[key]` to remove a key-value pair. Remove `\"english\"` from `scores`, then print the remaining dict.",
    starter: `scores = {"math": 95, "english": 88, "science": 91}
# TODO: del scores["english"], then print scores
`,
    expectedOutput: ["{'math': 95, 'science': 91}"],
    hint: "del scores[\"english\"]\nprint(scores)",
  },
];
