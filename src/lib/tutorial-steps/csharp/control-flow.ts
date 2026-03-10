import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "if / else",
    instruction:
      "Given `int score = 85`, print `\"Pass\"` if score is >= 60, otherwise print `\"Fail\"`.",
    starter: `using System;

class Program {
    static void Main() {
        int score = 85;
        // TODO: print "Pass" or "Fail"
    }
}`,
    expectedOutput: ["Pass"],
    hint: "if (score >= 60) { Console.WriteLine(\"Pass\"); } else { Console.WriteLine(\"Fail\"); }",
  },
  {
    title: "Ternary Operator",
    instruction:
      "Use the ternary operator `? :` to set `string status` to `\"Even\"` if `n = 4` is even, otherwise `\"Odd\"`. Print the result.",
    starter: `using System;

class Program {
    static void Main() {
        int n = 4;
        // TODO: use ternary to set status and print it
    }
}`,
    expectedOutput: ["Even"],
    hint: "string status = n % 2 == 0 ? \"Even\" : \"Odd\"; Console.WriteLine(status);",
  },
  {
    title: "switch Statement",
    instruction:
      "Given `string day = \"Friday\"`, use a `switch` to print `\"Early week\"` for Monday/Tuesday, `\"Almost weekend!\"` for Friday, or `\"Other day\"` otherwise.",
    starter: `using System;

class Program {
    static void Main() {
        string day = "Friday";
        // TODO: switch on day and print appropriate message
    }
}`,
    expectedOutput: ["Almost weekend!"],
    hint: "case \"Friday\": Console.WriteLine(\"Almost weekend!\"); break;",
  },
  {
    title: "switch Expression",
    instruction:
      "Use a switch expression to map `int code = 404` to `\"Not Found\"`. For 200 return `\"OK\"`, for 404 return `\"Not Found\"`, for anything else return `\"Unknown\"`. Print the result.",
    starter: `using System;

class Program {
    static void Main() {
        int code = 404;
        // TODO: use switch expression to get a message and print it
    }
}`,
    expectedOutput: ["Not Found"],
    hint: "string msg = code switch { 200 => \"OK\", 404 => \"Not Found\", _ => \"Unknown\" }; Console.WriteLine(msg);",
  },
  {
    title: "Relational Patterns",
    instruction:
      "Use a switch expression with relational patterns (`>= 90`, `>= 80`, etc.) to print a grade letter for `int score = 72`. Print `\"C\"` for 70–79.",
    starter: `using System;

class Program {
    static void Main() {
        int score = 72;
        // TODO: switch expression with >= patterns, print grade letter
    }
}`,
    expectedOutput: ["C"],
    hint: "score switch { >= 90 => \"A\", >= 80 => \"B\", >= 70 => \"C\", _ => \"F\" }",
  },
];
