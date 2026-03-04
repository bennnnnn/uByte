import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Start a Thread",
    instruction:
      "Create a Thread with a Runnable that prints \"Hello from thread\". Start the thread and then join() it. After join, print \"Main done\".",
    starter: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            // TODO: print "Hello from thread"
        });
        t.start();
        t.join();
        System.out.println("Main done");
    }
}`,
    expectedOutput: ["Hello from thread", "Main done"],
    hint: "System.out.println(\"Hello from thread\"); inside the Runnable.",
  },
  {
    title: "Two Threads",
    instruction:
      "Start two threads: one prints \"A\" and one prints \"B\". Join both. Then print \"End\".",
    starter: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> System.out.println("A"));
        Thread t2 = new Thread(() -> System.out.println("B"));
        t1.start();
        t2.start();
        // TODO: join both, then print "End"
    }
}`,
    expectedOutput: ["A", "B", "End"],
    hint: "t1.join(); t2.join(); System.out.println(\"End\");",
  },
];
