import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Import and Use",
    instruction:
      "Import java.util.ArrayList and java.util.List. Create a List<String> with ArrayList, add \"one\" and \"two\", then print the list size and the first element.",
    starter: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("one");
        list.add("two");
        // TODO: print list.size() and list.get(0)
    }
}`,
    expectedOutput: ["2", "one"],
    hint: "System.out.println(list.size()); System.out.println(list.get(0));",
  },
  {
    title: "Static Import",
    instruction:
      "Use static import for Math.PI and Math.pow. Compute the area of a circle with radius 3 (PI * r^2) and print it with 2 decimal places using String.format.",
    starter: `import static java.lang.Math.PI;
import static java.lang.Math.pow;

public class Main {
    public static void main(String[] args) {
        double r = 3;
        // TODO: area = PI * pow(r, 2), print with format "%.2f"
    }
}`,
    expectedOutput: ["28.27"],
    hint: "double area = PI * pow(r, 2); System.out.println(String.format(\"%.2f\", area));",
  },
];
