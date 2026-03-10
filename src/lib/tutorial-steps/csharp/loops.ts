import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "for Loop",
    instruction:
      "Use a `for` loop to print the numbers `0` through `4` each on its own line.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: for loop printing 0 to 4
    }
}`,
    expectedOutput: ["0", "1", "2", "3", "4"],
    hint: "for (int i = 0; i < 5; i++) { Console.WriteLine(i); }",
  },
  {
    title: "while Loop",
    instruction:
      "Use a `while` loop to print `\"Counting: 1\"`, `\"Counting: 2\"`, `\"Counting: 3\"`.",
    starter: `using System;

class Program {
    static void Main() {
        int i = 1;
        // TODO: while loop printing "Counting: 1", "Counting: 2", "Counting: 3"
    }
}`,
    expectedOutput: ["Counting: 1", "Counting: 2", "Counting: 3"],
    hint: "while (i <= 3) { Console.WriteLine($\"Counting: {i}\"); i++; }",
  },
  {
    title: "foreach Loop",
    instruction:
      "Given `string[] fruits = { \"apple\", \"banana\", \"cherry\" }`, use `foreach` to print each fruit on its own line.",
    starter: `using System;

class Program {
    static void Main() {
        string[] fruits = { "apple", "banana", "cherry" };
        // TODO: foreach to print each fruit
    }
}`,
    expectedOutput: ["apple", "banana", "cherry"],
    hint: "foreach (string fruit in fruits) { Console.WriteLine(fruit); }",
  },
  {
    title: "break and continue",
    instruction:
      "Use a `for` loop from 1 to 10. Skip even numbers with `continue` and stop when you reach `7` with `break`. You should print `1`, `3`, `5`.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: for loop 1..10, continue evens, break at 7
    }
}`,
    expectedOutput: ["1", "3", "5"],
    hint: "if (i % 2 == 0) continue; if (i == 7) break; Console.WriteLine(i);",
  },
  {
    title: "Sum with a Loop",
    instruction:
      "Sum all integers from 1 to 10 using a loop and print the result. Expected output: `55`.",
    starter: `using System;

class Program {
    static void Main() {
        int sum = 0;
        // TODO: loop 1..10, accumulate sum, print result
    }
}`,
    expectedOutput: ["55"],
    hint: "for (int i = 1; i <= 10; i++) sum += i; Console.WriteLine(sum);",
  },
];
