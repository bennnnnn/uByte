import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Create and Print Array",
    instruction:
      "Create an array of three integers: 10, 20, 30. Print each element on its own line using a for loop.",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: int[] arr = {10, 20, 30};
        // TODO: loop and print each element
    }
}`,
    expectedOutput: ["10", "20", "30"],
    hint: "int[] arr = {10, 20, 30}; for (int i = 0; i < arr.length; i++) System.out.println(arr[i]);",
  },
  {
    title: "ArrayList add and get",
    instruction:
      "Create an ArrayList of Strings. Add \"apple\", \"banana\", \"cherry\". Print the size, then print the element at index 1.",
    starter: `import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        // TODO: add three fruits
        // TODO: print list.size() and list.get(1)
    }
}`,
    expectedOutput: ["3", "banana"],
    hint: "list.add(\"apple\"); list.add(\"banana\"); list.add(\"cherry\"); then print size and get(1).",
  },
  {
    title: "For-Each over Array",
    instruction:
      "Given `int[] nums = {5, 10, 15}`, use a for-each loop to print each number.",
    starter: `public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 10, 15};
        // TODO: for-each and print
    }
}`,
    expectedOutput: ["5", "10", "15"],
    hint: "for (int n : nums) { System.out.println(n); }",
  },
  {
    title: "Sum of Array",
    instruction:
      "Compute the sum of all elements in `int[] values = {1, 2, 3, 4, 5}` and print the result.",
    starter: `public class Main {
    public static void main(String[] args) {
        int[] values = {1, 2, 3, 4, 5};
        int sum = 0;
        // TODO: add each element to sum, then print sum
    }
}`,
    expectedOutput: ["15"],
    hint: "for (int v : values) sum += v; then System.out.println(sum);",
  },
];
