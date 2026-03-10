import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Dictionary Basics",
    instruction:
      "Create a `Dictionary<string, string>` mapping countries to capitals: `\"France\" → \"Paris\"`, `\"Germany\" → \"Berlin\"`. Print the capital of France.",
    starter: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        var capitals = new Dictionary<string, string> {
            ["France"] = "Paris",
            ["Germany"] = "Berlin",
        };
        // TODO: print the capital of France
    }
}`,
    expectedOutput: ["Paris"],
    hint: "Console.WriteLine(capitals[\"France\"]);",
  },
  {
    title: "TryGetValue",
    instruction:
      "Using the same capitals dictionary, use `TryGetValue` to safely look up `\"Spain\"`. Print `\"Not found\"` if it's missing.",
    starter: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        var capitals = new Dictionary<string, string> {
            ["France"] = "Paris",
        };
        // TODO: TryGetValue "Spain", print "Not found" if missing
    }
}`,
    expectedOutput: ["Not found"],
    hint: "if (!capitals.TryGetValue(\"Spain\", out string city)) Console.WriteLine(\"Not found\");",
  },
  {
    title: "Iterate a Dictionary",
    instruction:
      "Create a dictionary `{ \"a\": 1, \"b\": 2, \"c\": 3 }`. Iterate and print each key-value pair as `\"a=1\"`, `\"b=2\"`, `\"c=3\"`.",
    starter: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        var map = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2, ["c"] = 3 };
        // TODO: print each pair as "key=value"
    }
}`,
    expectedOutput: ["a=1", "b=2", "c=3"],
    hint: "foreach (var (k, v) in map) Console.WriteLine($\"{k}={v}\");",
  },
  {
    title: "Word Frequency",
    instruction:
      "Count word frequencies in `string[] words = { \"go\", \"code\", \"go\", \"go\" }`. Print the count for `\"go\"` (should be `3`).",
    starter: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        string[] words = { "go", "code", "go", "go" };
        var freq = new Dictionary<string, int>();
        // TODO: count each word, print freq["go"]
    }
}`,
    expectedOutput: ["3"],
    hint: "freq[w] = freq.GetValueOrDefault(w) + 1; then Console.WriteLine(freq[\"go\"]);",
  },
  {
    title: "HashSet Uniqueness",
    instruction:
      "Create a `HashSet<int>` with values `{ 1, 2, 3 }`. Try to add `2` again. Print the count (should still be `3`).",
    starter: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        var set = new HashSet<int> { 1, 2, 3 };
        set.Add(2);  // duplicate — should be ignored
        // TODO: print the count
    }
}`,
    expectedOutput: ["3"],
    hint: "Console.WriteLine(set.Count);",
  },
];
