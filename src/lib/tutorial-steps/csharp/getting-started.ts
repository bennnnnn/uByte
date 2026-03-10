import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Hello, World!",
    instruction:
      "Every C# program has a `Main` method as its entry point. `Console.WriteLine()` prints a line followed by a newline. Click **Run** to see your first C# program output.",
    starter: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
    expectedOutput: ["Hello, World!"],
    hint: "The program is already complete — just click Run.",
  },
  {
    title: "Print Multiple Lines",
    instruction:
      "Call `Console.WriteLine()` multiple times to print several lines. Update the program so it prints one line containing \"C#\" and another containing \"Beginner\".",
    starter: `using System;

class Program {
    static void Main() {
        Console.WriteLine("I am learning C#");
        // TODO: print a second line containing the word "Beginner"
    }
}`,
    expectedOutput: ["C#", "Beginner"],
    hint: "Add Console.WriteLine(\"Beginner\"); on the next line.",
  },
  {
    title: "Use Variables",
    instruction:
      "Declare two variables: `language` as `\"C#\"` and `version` as `11`. Print the message `\"Learning C# version 11\"` using string interpolation: `$\"Learning {language} version {version}\"`.",
    starter: `using System;

class Program {
    static void Main() {
        string language = "C#";
        int version = 11;
        // TODO: print "Learning C# version 11" using interpolation
    }
}`,
    expectedOutput: ["Learning C# version 11"],
    hint: "Console.WriteLine($\"Learning {language} version {version}\");",
  },
  {
    title: "String Interpolation",
    instruction:
      "Use an interpolated string (`$\"...\"`) to build a greeting. Set `name = \"Learner\"` and print `\"Hello, Learner!\"`.",
    starter: `using System;

class Program {
    static void Main() {
        string name = "Learner";
        // TODO: print "Hello, Learner!" using $ interpolation
    }
}`,
    expectedOutput: ["Hello, Learner!"],
    hint: "Console.WriteLine($\"Hello, {name}!\");",
  },
  {
    title: "Add Comments",
    instruction:
      "C# supports `//` single-line comments and `/* */` block comments. Add a `//` comment above the `Console.WriteLine` that describes what it does, then ensure the program still prints `\"Comments done!\"`.",
    starter: `using System;

class Program {
    static void Main() {
        // TODO: add a comment here
        Console.WriteLine("Comments done!");
    }
}`,
    expectedOutput: ["Comments done!"],
    hint: "A comment starts with //. It won't affect the output.",
  },
];
