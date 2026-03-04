import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Put and Get",
    instruction:
      "Create a HashMap with String keys and Integer values. Put \"Alice\" -> 30 and \"Bob\" -> 25. Print the value for \"Alice\".",
    starter: `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        // TODO: put Alice=30, Bob=25
        // TODO: print get("Alice")
    }
}`,
    expectedOutput: ["30"],
    hint: "map.put(\"Alice\", 30); map.put(\"Bob\", 25); System.out.println(map.get(\"Alice\"));",
  },
  {
    title: "containsKey and getOrDefault",
    instruction:
      "Given a map with \"go\" -> 2009 and \"python\" -> 1991, check if \"go\" exists and print \"found\" or \"not found\". Then get \"java\" with default 0 and print it.",
    starter: `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> langs = new HashMap<>();
        langs.put("go", 2009);
        langs.put("python", 1991);
        // TODO: if containsKey("go") print "found", else "not found"
        // TODO: print getOrDefault("java", 0)
    }
}`,
    expectedOutput: ["found", "0"],
    hint: "if (langs.containsKey(\"go\")) System.out.println(\"found\"); else ...; then getOrDefault.",
  },
  {
    title: "Iterate with keySet",
    instruction:
      "Given a map with \"a\" -> 1, \"b\" -> 2, \"c\" -> 3, loop over keySet() and print each key and its value (one line per entry).",
    starter: `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        m.put("a", 1);
        m.put("b", 2);
        m.put("c", 3);
        // TODO: for (String k : m.keySet()) print k and m.get(k)
    }
}`,
    expectedOutput: ["a 1", "b 2", "c 3"],
    hint: "for (String k : m.keySet()) System.out.println(k + \" \" + m.get(k));",
  },
];
