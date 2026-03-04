import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Stream map",
    instruction:
      "Create a List of integers 1, 2, 3, 4, 5. Use stream().map(n -> n * 2).toList() to get doubled values and print each on its own line.",
    starter: `import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1, 2, 3, 4, 5);
        List<Integer> doubled = nums.stream().map(n -> n * 2).toList();
        // TODO: for-each print each element of doubled
    }
}`,
    expectedOutput: ["2", "4", "6", "8", "10"],
    hint: "for (int d : doubled) System.out.println(d);",
  },
  {
    title: "Stream filter",
    instruction:
      "From List.of(1, 2, 3, 4, 5), use stream().filter(n -> n % 2 == 0).toList() to get even numbers. Print each on its own line.",
    starter: `import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1, 2, 3, 4, 5);
        List<Integer> evens = nums.stream().filter(n -> n % 2 == 0).toList();
        // TODO: print each even
    }
}`,
    expectedOutput: ["2", "4"],
    hint: "evens.forEach(System.out::println); or for (int e : evens) System.out.println(e);",
  },
  {
    title: "Lambda and sum",
    instruction:
      "Use stream().mapToInt(n -> n).sum() on List.of(10, 20, 30) to compute the sum and print it.",
    starter: `import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(10, 20, 30);
        int sum = nums.stream().mapToInt(n -> n).sum();
        // TODO: print sum
    }
}`,
    expectedOutput: ["60"],
    hint: "System.out.println(sum);",
  },
];
