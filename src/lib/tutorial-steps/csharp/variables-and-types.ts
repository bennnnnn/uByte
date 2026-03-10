import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Value Types",
    instruction:
      "Declare an `int` named `age` with value `25`, a `double` named `price` with value `9.99`, and a `bool` named `isActive` with value `true`. Print them on separate lines.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: declare age (int=25), price (double=9.99), isActive (bool=true)
        // Then print each on its own line
    }
}`,
    expectedOutput: ["25", "9.99", "True"],
    hint: "int age = 25; double price = 9.99; bool isActive = true; then Console.WriteLine each.",
  },
  {
    title: "var Inference",
    instruction:
      "C# can infer types with `var`. Declare `var greeting = \"Hello\"` and `var count = 42`. Print them on separate lines.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: use var for greeting ("Hello") and count (42)
        // then print each
    }
}`,
    expectedOutput: ["Hello", "42"],
    hint: "var greeting = \"Hello\"; var count = 42; Console.WriteLine(greeting); Console.WriteLine(count);",
  },
  {
    title: "Constants",
    instruction:
      "Declare a `const double Pi = 3.14159` and print `\"Pi is 3.14159\"`.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: declare const Pi and print "Pi is 3.14159"
    }
}`,
    expectedOutput: ["Pi is 3.14159"],
    hint: "const double Pi = 3.14159; Console.WriteLine($\"Pi is {Pi}\");",
  },
  {
    title: "Explicit Type Conversion",
    instruction:
      "Declare `double pi = 3.99` and cast it to `int` using `(int)pi`. Print the result (it should be `3` — truncated, not rounded).",
    starter: `using System;

class Program {
    static void Main() {
        double pi = 3.99;
        // TODO: cast pi to int and print it
    }
}`,
    expectedOutput: ["3"],
    hint: "int truncated = (int)pi; Console.WriteLine(truncated);",
  },
  {
    title: "Nullable Types",
    instruction:
      "Declare `int? score = null`. Use the null-coalescing operator `??` to print `0` when `score` is null.",
    starter: `using System;

class Program {
    static void Main() {
        int? score = null;
        // TODO: print score ?? 0
    }
}`,
    expectedOutput: ["0"],
    hint: "Console.WriteLine(score ?? 0);",
  },
];
