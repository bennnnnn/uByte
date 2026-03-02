import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Declare Variables",
    instruction:
      "Java is statically typed — declare variables with their type: `String name = \"Alice\";` and `int age = 30;`. Print both on separate lines using `System.out.println()`.",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: declare name (String) = "Alice"
        // TODO: declare age (int) = 30
        // TODO: print name, then print age
    }
}`,
    expectedOutput: ["Alice", "30"],
    hint: "String name = \"Alice\"; then int age = 30; then two System.out.println() calls.",
  },
  {
    title: "var Keyword (Java 10+)",
    instruction:
      "Java 10 added `var` for local type inference. Declare `city` as \"London\" and `population` as 9000000 using `var`, then print both.",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: declare city and population using var
        // TODO: print both
    }
}`,
    expectedOutput: ["London", "9000000"],
    hint: "var city = \"London\"; and var population = 9000000; — the compiler infers String and int.",
  },
  {
    title: "Default Values",
    instruction:
      "Java fields are zero-initialized, but local variables must be explicitly initialized. Declare `int n = 0`, `boolean flag = false`, and `String s = \"\"`, then print each.",
    starter: `public class Main {
    public static void main(String[] args) {
        int n = 0;
        boolean flag = false;
        String s = "";
        // TODO: print n, flag, and s
    }
}`,
    expectedOutput: ["0", "false"],
    hint: "System.out.println(n); prints 0. System.out.println(flag); prints false. System.out.println(s); prints an empty line.",
  },
  {
    title: "String Methods",
    instruction:
      "Java's `String` class has many useful methods. Use `.toUpperCase()` on \"hello\" and `.substring(0, 4)` on \"JavaScript\" to get \"Java\". Print both results.",
    starter: `public class Main {
    public static void main(String[] args) {
        String word = "hello";
        String lang = "JavaScript";
        // TODO: print word.toUpperCase()
        // TODO: print lang.substring(0, 4)
    }
}`,
    expectedOutput: ["HELLO", "Java"],
    hint: "System.out.println(word.toUpperCase()); and System.out.println(lang.substring(0, 4));",
  },
  {
    title: "Type Casting",
    instruction:
      "Java requires explicit casts for narrowing conversions. Cast the `int` 42 to `double` and print it. Then use `String.valueOf()` to convert an int to a String and print its length.",
    starter: `public class Main {
    public static void main(String[] args) {
        int i = 42;
        // TODO: cast i to double and print it
        // TODO: convert i to String with String.valueOf(i), print its length
    }
}`,
    expectedOutput: ["42.0", "2"],
    hint: "double d = (double) i; then System.out.println(d); and System.out.println(String.valueOf(i).length());",
  },
  {
    title: "Constants with final",
    instruction:
      "Use `final` to declare a constant — it cannot be reassigned. Declare `final double PI = 3.14159` and compute the area of a circle with radius 5. Print with `String.format(\"%.2f\", area)`.",
    starter: `public class Main {
    public static void main(String[] args) {
        final double PI = 3.14159;
        double radius = 5.0;
        // TODO: calculate area = PI * radius * radius
        // TODO: print with String.format("%.2f", area)
    }
}`,
    expectedOutput: ["78.54"],
    hint: "double area = PI * radius * radius; then System.out.println(String.format(\"%.2f\", area));",
  },
];
