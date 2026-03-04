import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define and Call a Method",
    instruction:
      "Define a static method `add` that takes two ints and returns their sum. From main, call add(10, 20) and print the result.",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: call add(10, 20) and print
    }
    // TODO: static int add(int a, int b)
}`,
    expectedOutput: ["30"],
    hint: "public static int add(int a, int b) { return a + b; } then System.out.println(add(10, 20));",
  },
  {
    title: "Void Method",
    instruction:
      "Define a static void method `greet` that takes a String and prints \"Hello, &lt;name&gt;!\". Call greet(\"Java\") from main.",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: call greet("Java")
    }
    // TODO: static void greet(String name)
}`,
    expectedOutput: ["Hello, Java!"],
    hint: "public static void greet(String name) { System.out.println(\"Hello, \" + name + \"!\"); }",
  },
  {
    title: "Method with Return",
    instruction:
      "Write a static method `max` that takes two ints and returns the larger one. From main, print max(7, 12).",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: print max(7, 12)
    }
    // TODO: static int max(int a, int b)
}`,
    expectedOutput: ["12"],
    hint: "return (a > b) ? a : b;",
  },
];
