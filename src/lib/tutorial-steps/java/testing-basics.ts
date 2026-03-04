import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "assertEquals",
    instruction:
      "Write a static method add(int a, int b) that returns a + b. In main, call add(2, 3) and print the result (so we simulate the test: assertEquals(5, add(2, 3))).",
    starter: `public class Main {
    public static void main(String[] args) {
        int result = add(2, 3);
        System.out.println(result == 5 ? "pass" : "fail");
    }
    static int add(int a, int b) {
        // TODO: return a + b
    }
}`,
    expectedOutput: ["pass"],
    hint: "return a + b;",
  },
  {
    title: "Assert Logic",
    instruction:
      "Write a method isEven(int n) that returns true if n is even. In main, print \"pass\" if isEven(4) is true and isEven(3) is false, otherwise \"fail\".",
    starter: `public class Main {
    public static void main(String[] args) {
        boolean ok = isEven(4) && !isEven(3);
        System.out.println(ok ? "pass" : "fail");
    }
    static boolean isEven(int n) {
        // TODO: return true if n is even
    }
}`,
    expectedOutput: ["pass"],
    hint: "return n % 2 == 0;",
  },
];
