import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Instance Method",
    instruction:
      "Define a class `Counter` with a private int count (start 0), an instance method `increment()` that adds 1, and `getCount()` that returns count. In main, create a Counter, call increment() twice, and print getCount().",
    starter: `public class Main {
    public static void main(String[] args) {
        Counter c = new Counter();
        // TODO: increment twice, print getCount()
    }
}

class Counter {
    // TODO: count, increment(), getCount()
}`,
    expectedOutput: ["2"],
    hint: "private int count = 0; public void increment() { count++; } public int getCount() { return count; }",
  },
  {
    title: "Overloaded Methods",
    instruction:
      "In a class Helper, define two static methods: `doubleArea(int side)` returning side*side*2 and `doubleArea(int w, int h)` returning w*h*2. From main, print doubleArea(5) and doubleArea(3, 4).",
    starter: `public class Main {
    public static void main(String[] args) {
        // TODO: print Helper.doubleArea(5) and Helper.doubleArea(3, 4)
    }
}

class Helper {
    // TODO: static int doubleArea(int side) and static int doubleArea(int w, int h)
}`,
    expectedOutput: ["50", "24"],
    hint: "return side * side * 2; and return w * h * 2;",
  },
];
