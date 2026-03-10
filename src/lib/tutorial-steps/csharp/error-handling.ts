import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "try / catch",
    instruction:
      "Wrap `int result = 10 / 0` in a try/catch that catches `DivideByZeroException` and prints `\"Division by zero\"`.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: try { 10/0 } catch (DivideByZeroException) { print "Division by zero" }
    }
}`,
    expectedOutput: ["Division by zero"],
    hint: "try { int r = 10 / 0; } catch (DivideByZeroException) { Console.WriteLine(\"Division by zero\"); }",
  },
  {
    title: "finally Block",
    instruction:
      "Write a try/catch/finally. In `try`, print `\"Trying\"`. In `catch`, print `\"Error\"`. In `finally`, print `\"Done\"`. Trigger no exception — both `\"Trying\"` and `\"Done\"` should print.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: try { print "Trying" } catch { print "Error" } finally { print "Done" }
    }
}`,
    expectedOutput: ["Trying", "Done"],
    hint: "try { Console.WriteLine(\"Trying\"); } catch { Console.WriteLine(\"Error\"); } finally { Console.WriteLine(\"Done\"); }",
  },
  {
    title: "Custom Exception",
    instruction:
      "Define `class AgeException : Exception` with a message. Throw it when age < 0. Catch it and print `\"Invalid age\"`.",
    starter: `using System;

class AgeException : Exception {
    public AgeException(string msg) : base(msg) {}
}

class Program {
    static void Validate(int age) {
        // TODO: throw AgeException if age < 0
    }

    static void Main() {
        try {
            Validate(-1);
        } catch (AgeException) {
            Console.WriteLine("Invalid age");
        }
    }
}`,
    expectedOutput: ["Invalid age"],
    hint: "if (age < 0) throw new AgeException(\"Age cannot be negative\");",
  },
  {
    title: "TryParse Pattern",
    instruction:
      "Use `int.TryParse(\"abc\", out int n)` to safely attempt parsing. Print `\"Not a number\"` if it fails.",
    starter: `using System;

class Program {
    static void Main() {
        string input = "abc";
        // TODO: TryParse and print "Not a number" if it fails
    }
}`,
    expectedOutput: ["Not a number"],
    hint: "if (!int.TryParse(input, out _)) Console.WriteLine(\"Not a number\");",
  },
  {
    title: "Exception Filters",
    instruction:
      "Throw a generic `Exception` with message `\"timeout\"`. Use `catch (Exception ex) when (ex.Message == \"timeout\")` to print `\"Request timed out\"`.",
    starter: `using System;

class Program {
    static void Main() {
        try {
            throw new Exception("timeout");
        } catch (Exception ex) when (/* TODO: filter condition */) {
            Console.WriteLine("Request timed out");
        }
    }
}`,
    expectedOutput: ["Request timed out"],
    hint: "when (ex.Message == \"timeout\")",
  },
];
