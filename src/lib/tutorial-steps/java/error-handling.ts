import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "try-catch",
    instruction:
      "Use try-catch to parse the string \"42\" with Integer.parseInt(). Print the parsed number. Then in another try-catch, parse \"not a number\" and in the catch block print \"Invalid\".",
    starter: `public class Main {
    public static void main(String[] args) {
        try {
            int n = Integer.parseInt("42");
            // TODO: print n
        } catch (NumberFormatException e) {
            System.out.println("Invalid");
        }
        try {
            Integer.parseInt("not a number");
        } catch (NumberFormatException e) {
            // TODO: print "Invalid"
        }
    }
}`,
    expectedOutput: ["42", "Invalid"],
    hint: "System.out.println(n); and System.out.println(\"Invalid\");",
  },
  {
    title: "throw",
    instruction:
      "Write a method divide(int a, int b) that returns a/b. If b is 0, throw new ArithmeticException(\"Division by zero\"). From main, call divide(10, 2) and print; then in try-catch call divide(5, 0) and in catch print the exception message.",
    starter: `public class Main {
    public static void main(String[] args) {
        System.out.println(divide(10, 2));
        try {
            divide(5, 0);
        } catch (ArithmeticException e) {
            System.out.println(e.getMessage());
        }
    }
    static int divide(int a, int b) {
        // TODO: if b == 0 throw; else return a / b
    }
}`,
    expectedOutput: ["5", "Division by zero"],
    hint: "if (b == 0) throw new ArithmeticException(\"Division by zero\"); return a / b;",
  },
];
