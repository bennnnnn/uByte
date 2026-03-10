import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "switch Expression",
    instruction:
      "Map `int code = 200` to a string using a switch expression: `200 → \"OK\"`, `404 → \"Not Found\"`, `_ → \"Unknown\"`. Print the result.",
    starter: `using System;

class Program {
    static void Main() {
        int code = 200;
        // TODO: switch expression to map code to a string, print it
    }
}`,
    expectedOutput: ["OK"],
    hint: "string msg = code switch { 200 => \"OK\", 404 => \"Not Found\", _ => \"Unknown\" }; Console.WriteLine(msg);",
  },
  {
    title: "Relational Patterns",
    instruction:
      "Use a switch expression with relational patterns to print a grade for `int score = 88`: `>= 90 → \"A\"`, `>= 80 → \"B\"`, `>= 70 → \"C\"`, `_ → \"F\"`.",
    starter: `using System;

class Program {
    static void Main() {
        int score = 88;
        // TODO: switch expression with relational patterns
    }
}`,
    expectedOutput: ["B"],
    hint: "string g = score switch { >= 90 => \"A\", >= 80 => \"B\", >= 70 => \"C\", _ => \"F\" }; Console.WriteLine(g);",
  },
  {
    title: "Type Pattern Matching",
    instruction:
      "Given `object obj = 42`, use a switch expression on the type: `int → \"Integer\"`, `string → \"String\"`, `_ → \"Other\"`. Print the result.",
    starter: `using System;

class Program {
    static void Main() {
        object obj = 42;
        // TODO: switch expression matching type, print result
    }
}`,
    expectedOutput: ["Integer"],
    hint: "string desc = obj switch { int => \"Integer\", string => \"String\", _ => \"Other\" }; Console.WriteLine(desc);",
  },
  {
    title: "Property Pattern",
    instruction:
      "Define `record Point(int X, int Y)`. Use a switch expression with property patterns to print `\"Origin\"` for `(0,0)`, `\"X-axis\"` for any point with `Y=0`, or `\"Other\"` otherwise. Test with `(5, 0)`.",
    starter: `using System;

record Point(int X, int Y);

class Program {
    static void Main() {
        var pt = new Point(5, 0);
        string result = pt switch {
            // TODO: { X:0, Y:0 } => "Origin", { Y:0 } => "X-axis", _ => "Other"
            _ => "Other",
        };
        Console.WriteLine(result);
    }
}`,
    expectedOutput: ["X-axis"],
    hint: "{ X: 0, Y: 0 } => \"Origin\", { Y: 0 } => \"X-axis\",",
  },
  {
    title: "Guard Clause (when)",
    instruction:
      "Use a switch expression with a `when` guard: for `int n = 7`, return `\"Seven\"` when `n == 7`, `\"Even\"` when `n % 2 == 0`, or `\"Other\"`. Print the result.",
    starter: `using System;

class Program {
    static void Main() {
        int n = 7;
        string result = n switch {
            // TODO: var x when x == 7 => "Seven", var x when x%2==0 => "Even", _ => "Other"
            _ => "Other",
        };
        Console.WriteLine(result);
    }
}`,
    expectedOutput: ["Seven"],
    hint: "var x when x == 7 => \"Seven\", var x when x % 2 == 0 => \"Even\",",
  },
];
