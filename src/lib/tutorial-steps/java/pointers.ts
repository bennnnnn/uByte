import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Reference Assignment",
    instruction:
      "Create a String `s1 = \"hello\"` and assign `s2 = s1`. Print both. Then use equals to compare s1 and s2 and print the result (true or false).",
    starter: `public class Main {
    public static void main(String[] args) {
        String s1 = "hello";
        String s2 = s1;
        // TODO: print s1 and s2
        // TODO: print s1.equals(s2)
    }
}`,
    expectedOutput: ["hello", "hello", "true"],
    hint: "System.out.println(s1); System.out.println(s2); System.out.println(s1.equals(s2));",
  },
  {
    title: "null Check",
    instruction:
      "Declare a String `name` that may be null. If it is not null, print its length; otherwise print \"no name\".",
    starter: `public class Main {
    public static void main(String[] args) {
        String name = null;
        // TODO: if name != null print name.length(), else print "no name"
    }
}`,
    expectedOutput: ["no name"],
    hint: "if (name != null) System.out.println(name.length()); else System.out.println(\"no name\");",
  },
  {
    title: "equals vs ==",
    instruction:
      "Create two strings: `a = \"hi\"` and `b = new String(\"hi\")`. Print the result of a.equals(b) and the result of a == b (on separate lines).",
    starter: `public class Main {
    public static void main(String[] args) {
        String a = "hi";
        String b = new String("hi");
        // TODO: print a.equals(b) then a == b
    }
}`,
    expectedOutput: ["true", "false"],
    hint: "System.out.println(a.equals(b)); System.out.println(a == b);",
  },
];
