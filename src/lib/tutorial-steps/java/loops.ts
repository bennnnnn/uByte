import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Basic for Loop",
    instruction:
      "Use a for loop to print the numbers 1 through 5, each on its own line.",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: for loop 1 to 5, print each number
    }
}`,
    expectedOutput: ["1", "2", "3", "4", "5"],
    hint: "for (int i = 1; i <= 5; i++) { System.out.println(i); }",
  },
  {
    title: "While Loop",
    instruction:
      "Use a while loop to count down from 3 to 1, printing each number, then print \"Liftoff!\" after the loop.",
    starter: `public class Main {
    public static void main(String[] args) {
        int n = 3;
        // TODO: while n > 0, print n and decrement
        // TODO: then print "Liftoff!"
    }
}`,
    expectedOutput: ["3", "2", "1", "Liftoff!"],
    hint: "while (n > 0) { System.out.println(n); n--; } then System.out.println(\"Liftoff!\");",
  },
  {
    title: "For-Each over Array",
    instruction:
      "Loop over the fruits array using for-each and print each fruit name on its own line.",
    starter: `public class Main {
    public static void main(String[] args) {
        String[] fruits = {"apple", "banana", "cherry"};
        // TODO: for-each over fruits, print each
    }
}`,
    expectedOutput: ["apple", "banana", "cherry"],
    hint: "for (String fruit : fruits) { System.out.println(fruit); }",
  },
  {
    title: "break and continue",
    instruction:
      "Loop from 1 to 6. Use continue to skip even numbers and break if the number exceeds 5. Print only 1, 3, and 5.",
    starter: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 6; i++) {
            // TODO: continue when i is even
            // TODO: break when i > 5
            System.out.println(i);
        }
    }
}`,
    expectedOutput: ["1", "3", "5"],
    hint: "if (i % 2 == 0) continue; if (i > 5) break;",
  },
  {
    title: "Sum in a Loop",
    instruction:
      "Use a for loop to compute the sum of the numbers 1 through 10 and print the result.",
    starter: `public class Main {
    public static void main(String[] args) {
        int sum = 0;
        // TODO: loop 1 to 10, add each to sum
        // TODO: print sum
    }
}`,
    expectedOutput: ["55"],
    hint: "for (int i = 1; i <= 10; i++) sum += i; then System.out.println(sum);",
  },
];
