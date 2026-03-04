import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Build JSON String",
    instruction:
      "Build a JSON string for an object with \"name\": \"Alice\" and \"age\": 30. Print the string (e.g. {\"name\":\"Alice\",\"age\":30}).",
    starter: `public class Main {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 30;
        // TODO: build json string and print
    }
}`,
    expectedOutput: ["{\"name\":\"Alice\",\"age\":30}"],
    hint: "String json = \"{\\\"name\\\":\\\"\" + name + \"\\\",\\\"age\\\":\" + age + \"}\"; System.out.println(json);",
  },
  {
    title: "Parse-like Extract",
    instruction:
      "Given a string json = \"{\\\"key\\\":\\\"value\\\"}\", use indexOf and substring to extract the value between the colons and second quote (i.e. \"value\") and print it.",
    starter: `public class Main {
    public static void main(String[] args) {
        String json = "{\\\"key\\\":\\\"value\\\"}";
        // TODO: extract "value" and print
    }
}`,
    expectedOutput: ["value"],
    hint: "int start = json.indexOf(':', json.indexOf('\"')) + 2; int end = json.indexOf('\"', start); json.substring(start, end);",
  },
];
