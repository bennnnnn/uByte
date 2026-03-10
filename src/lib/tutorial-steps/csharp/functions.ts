import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Basic Method",
    instruction:
      "Write a `static int Add(int a, int b)` method that returns the sum of two integers. Call it with `3` and `4` and print the result.",
    starter: `using System;

class Program {
    // TODO: add static int Add(int a, int b) method here

    static void Main() {
        // TODO: call Add(3, 4) and print the result
    }
}`,
    expectedOutput: ["7"],
    hint: "static int Add(int a, int b) => a + b; Console.WriteLine(Add(3, 4));",
  },
  {
    title: "Expression-Bodied Method",
    instruction:
      "Write an expression-bodied method `static string Greet(string name)` that returns `\"Hello, {name}!\"`. Call it with `\"World\"` and print the result.",
    starter: `using System;

class Program {
    // TODO: write Greet using => expression body

    static void Main() {
        Console.WriteLine(Greet("World"));
    }
}`,
    expectedOutput: ["Hello, World!"],
    hint: "static string Greet(string name) => $\"Hello, {name}!\";",
  },
  {
    title: "Optional Parameters",
    instruction:
      "Write `static string Greet(string name, string greeting = \"Hello\")`. Call it once with just a name (prints `\"Hello, Alice!\"`) and once with a custom greeting (prints `\"Hi, Bob!\"`).",
    starter: `using System;

class Program {
    // TODO: write Greet with optional greeting parameter

    static void Main() {
        Console.WriteLine(Greet("Alice"));
        Console.WriteLine(Greet("Bob", "Hi"));
    }
}`,
    expectedOutput: ["Hello, Alice!", "Hi, Bob!"],
    hint: "static string Greet(string name, string greeting = \"Hello\") => $\"{greeting}, {name}!\";",
  },
  {
    title: "Returning a Tuple",
    instruction:
      "Write `static (int Min, int Max) MinMax(int[] arr)` that returns the minimum and maximum values. Call it on `{ 3, 1, 4, 1, 5, 9 }` and print `\"Min: 1, Max: 9\"`.",
    starter: `using System;
using System.Linq;

class Program {
    // TODO: write MinMax returning (int Min, int Max)

    static void Main() {
        var (min, max) = MinMax(new[] { 3, 1, 4, 1, 5, 9 });
        Console.WriteLine($"Min: {min}, Max: {max}");
    }
}`,
    expectedOutput: ["Min: 1, Max: 9"],
    hint: "static (int Min, int Max) MinMax(int[] arr) => (arr.Min(), arr.Max());",
  },
  {
    title: "out Parameter",
    instruction:
      "Use `int.TryParse` to safely parse `\"42\"` into an `int` using an `out` parameter. If successful, print the parsed value.",
    starter: `using System;

class Program {
    static void Main() {
        string input = "42";
        // TODO: use int.TryParse with out, print result if ok
    }
}`,
    expectedOutput: ["42"],
    hint: "if (int.TryParse(input, out int n)) Console.WriteLine(n);",
  },
];
