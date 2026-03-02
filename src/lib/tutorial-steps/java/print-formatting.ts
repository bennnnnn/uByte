import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "printf and format",
    instruction:
      "Java's `System.out.printf()` works like C-style formatting. Use `%s` for strings, `%d` for integers, and `%f` for floats. Print `Name: Alice, Age: 30` using printf.",
    starter: `public class Main {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 30;
        // TODO: use printf to print "Name: Alice, Age: 30"
    }
}`,
    expectedOutput: ["Name: Alice, Age: 30"],
    hint: "System.out.printf(\"Name: %s, Age: %d%n\", name, age); — note %n for newline.",
  },
  {
    title: "Number Formatting",
    instruction:
      "Control decimal precision with `%.2f`. Calculate `22.0 / 7.0` and print the result rounded to 2 decimal places.",
    starter: `public class Main {
    public static void main(String[] args) {
        double result = 22.0 / 7.0;
        // TODO: print result with 2 decimal places
    }
}`,
    expectedOutput: ["3.14"],
    hint: "System.out.printf(\"%.2f%n\", result); or System.out.println(String.format(\"%.2f\", result));",
  },
  {
    title: "String Concatenation vs. StringBuilder",
    instruction:
      "String concatenation with `+` creates new objects. For many joins, `StringBuilder` is more efficient. Use `StringBuilder` to build `\"Hello, World!\"` by appending `\"Hello\"`, `\", \"`, and `\"World!\"`, then print it.",
    starter: `public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        // TODO: append "Hello", ", " and "World!" to sb
        // TODO: print sb.toString()
    }
}`,
    expectedOutput: ["Hello, World!"],
    hint: "sb.append(\"Hello\").append(\", \").append(\"World!\"); then System.out.println(sb.toString());",
  },
  {
    title: "Multi-line Text Blocks (Java 15+)",
    instruction:
      "Java 15 introduced text blocks using triple quotes `\"\"\"`. Declare a text block with two lines: `Line one` and `Line two`, then print it.",
    starter: `public class Main {
    public static void main(String[] args) {
        String text = """
                Line one
                Line two
                """;
        System.out.print(text);
    }
}`,
    expectedOutput: ["Line one", "Line two"],
    hint: "The text block is already set up — just run it to see the output.",
  },
  {
    title: "Padding and Alignment",
    instruction:
      "Use `%-10s` for left-aligned and `%10s` for right-aligned text. Print `\"left      \"` (left-aligned in 10 chars) and `\"     right\"` (right-aligned in 10 chars).",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: print "left" left-aligned in 10 characters
        // TODO: print "right" right-aligned in 10 characters
    }
}`,
    expectedOutput: ["left      ", "     right"],
    hint: "System.out.printf(\"%-10s%n\", \"left\"); and System.out.printf(\"%10s%n\", \"right\");",
  },
];
