import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "if Statement",
    instruction:
      "An `if` statement runs a block when the condition is true. Check if the variable `x` (set to 15) is greater than 10. If it is, print \"greater than 10\".",
    starter: `public class Main {
    public static void main(String[] args) {
        int x = 15;
        // TODO: if x > 10, print "greater than 10"
    }
}`,
    expectedOutput: ["greater than 10"],
    hint: "if (x > 10) { System.out.println(\"greater than 10\"); }",
  },
  {
    title: "if-else",
    instruction:
      "Use if-else to run different code by condition. A student scored 72. If the score is 60 or higher print \"Pass\", otherwise print \"Fail\".",
    starter: `public class Main {
    public static void main(String[] args) {
        int score = 72;
        // TODO: print "Pass" if score >= 60, else print "Fail"
    }
}`,
    expectedOutput: ["Pass"],
    hint: "if (score >= 60) { System.out.println(\"Pass\"); } else { System.out.println(\"Fail\"); }",
  },
  {
    title: "else-if",
    instruction:
      "Given `String day = \"Monday\"`, use if / else if / else to print \"Weekend\" for Saturday or Sunday, and \"Weekday\" otherwise.",
    starter: `public class Main {
    public static void main(String[] args) {
        String day = "Monday";
        // TODO: print "Weekend" or "Weekday" based on day
    }
}`,
    expectedOutput: ["Weekday"],
    hint: "if (day.equals(\"Saturday\") || day.equals(\"Sunday\")) { ... } else { System.out.println(\"Weekday\"); }",
  },
  {
    title: "switch Statement",
    instruction:
      "Use a switch on `day`. For \"Saturday\" and \"Sunday\" print \"Weekend\"; for others print \"Weekday\". Use break after each case.",
    starter: `public class Main {
    public static void main(String[] args) {
        String day = "Monday";
        // TODO: switch on day
    }
}`,
    expectedOutput: ["Weekday"],
    hint: "switch (day) { case \"Saturday\": case \"Sunday\": System.out.println(\"Weekend\"); break; default: System.out.println(\"Weekday\"); }",
  },
  {
    title: "FizzBuzz",
    instruction:
      "Loop from 1 to 15. For multiples of 3 print \"Fizz\", multiples of 5 print \"Buzz\", multiples of both print \"FizzBuzz\", else print the number. Check 15 first.",
    starter: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            // TODO: FizzBuzz logic
            System.out.println(i);
        }
    }
}`,
    expectedOutput: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"],
    hint: "if (i % 15 == 0) FizzBuzz; else if (i % 3 == 0) Fizz; else if (i % 5 == 0) Buzz; else print i.",
  },
];
