import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Console.Write vs WriteLine",
    instruction:
      "Use `Console.Write` (no newline) to print `\"Hello, \"` and then `Console.WriteLine` to print `\"World!\"` on the same line.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: print "Hello, " without a newline, then "World!" with one
    }
}`,
    expectedOutput: ["Hello, World!"],
    hint: "Console.Write(\"Hello, \"); Console.WriteLine(\"World!\");",
  },
  {
    title: "Interpolated Strings",
    instruction:
      "Given `string name = \"Alice\"` and `int score = 95`, print `\"Alice scored 95 points\"` using an interpolated string.",
    starter: `using System;

class Program {
    static void Main() {
        string name = "Alice";
        int score = 95;
        // TODO: print "Alice scored 95 points" using $"..."
    }
}`,
    expectedOutput: ["Alice scored 95 points"],
    hint: "Console.WriteLine($\"{name} scored {score} points\");",
  },
  {
    title: "Composite Format",
    instruction:
      "Use `string.Format` with `{0}` and `{1}` placeholders to print `\"Hello, Bob! You are 30 years old.\"`.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: use string.Format to print "Hello, Bob! You are 30 years old."
    }
}`,
    expectedOutput: ["Hello, Bob! You are 30 years old."],
    hint: "Console.WriteLine(string.Format(\"Hello, {0}! You are {1} years old.\", \"Bob\", 30));",
  },
  {
    title: "Format Specifiers",
    instruction:
      "Print `3.14159` formatted to 2 decimal places using the `F2` format specifier inside an interpolated string. Expected output: `\"Pi: 3.14\"`.",
    starter: `using System;

class Program {
    static void Main() {
        double pi = 3.14159;
        // TODO: print "Pi: 3.14" using :F2
    }
}`,
    expectedOutput: ["Pi: 3.14"],
    hint: "Console.WriteLine($\"Pi: {pi:F2}\");",
  },
  {
    title: "Padding and Alignment",
    instruction:
      "Use `,10` (right-align in 10 chars) to print `\"Alice\"` right-aligned. Expected output: `\"     Alice\"` (5 spaces + Alice).",
    starter: `using System;

class Program {
    static void Main() {
        string name = "Alice";
        // TODO: print name right-aligned in a field of 10 characters
    }
}`,
    expectedOutput: ["     Alice"],
    hint: "Console.WriteLine($\"{name,10}\");",
  },
];
