import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Hello, World!",
    instruction:
      "Every Java program lives inside a class. The entry point is `public static void main(String[] args)`. Use `System.out.println()` to print a line of text. Click Run to see your first Java program.",
    starter: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    expectedOutput: ["Hello, World!"],
    hint: "The program is already complete — just click Run and watch the output appear.",
  },
  {
    title: "Print Multiple Lines",
    instruction:
      "Call `System.out.println()` multiple times — each call prints one line. Update the program to print two lines: one containing \"Java\" and one containing \"Beginner\".",
    starter: `public class Main {
    public static void main(String[] args) {
        System.out.println("I am learning Java");
        // TODO: print a second line containing the word "Beginner"
    }
}`,
    expectedOutput: ["Java", "Beginner"],
    hint: "Add another System.out.println() call on the next line.",
  },
  {
    title: "Use Variables",
    instruction:
      "Declare a `String` variable `language` with value \"Java\" and an `int` variable `version` with value 21. Print the message \"Learning Java version 21\" by concatenating with `+`.",
    starter: `public class Main {
    public static void main(String[] args) {
        String language = "Java";
        int version = 21;
        // TODO: print "Learning Java version 21" using language and version
    }
}`,
    expectedOutput: ["Learning Java version 21"],
    hint: "System.out.println(\"Learning \" + language + \" version \" + version);",
  },
  {
    title: "String Formatting",
    instruction:
      "Use `String.format()` or `System.out.printf()` to format strings with placeholders. Use `String.format()` to build the greeting \"Hello, Learner!\" from a variable `name = \"Learner\"`, then print it.",
    starter: `public class Main {
    public static void main(String[] args) {
        String name = "Learner";
        // TODO: use String.format to build "Hello, Learner!" and print it
    }
}`,
    expectedOutput: ["Hello, Learner!"],
    hint: "String greeting = String.format(\"Hello, %s!\", name); then System.out.println(greeting);",
  },
  {
    title: "Add Comments",
    instruction:
      "Java supports single-line `//` and multi-line `/* */` comments. Add a `//` comment above the println call describing what it does, then make sure the program prints \"Comments done!\".",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: add a comment here describing what the next line does
        System.out.println("Comments done!");
    }
}`,
    expectedOutput: ["Comments done!"],
    hint: "A comment looks like: // This prints a confirmation message.",
  },
];
