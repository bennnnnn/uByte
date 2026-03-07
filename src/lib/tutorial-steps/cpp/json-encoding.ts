import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Manual JSON String",
    instruction:
      "C++ has no built-in JSON library, but you can build JSON manually. Write a function `toJson(std::string name, int age)` that returns the string `{\"name\": \"Alice\", \"age\": 30}` for those inputs. Print it.",
    starter: `#include <iostream>
#include <string>

// TODO: std::string toJson(std::string name, int age)

int main() {
    std::cout << toJson("Alice", 30) << std::endl;
    return 0;
}`,
    expectedOutput: ['{"name": "Alice", "age": 30}'],
    hint: "return \"{\\\"name\\\": \\\"\" + name + \"\\\", \\\"age\\\": \" + std::to_string(age) + \"}\";",
  },
  {
    title: "Parse a JSON Value",
    instruction:
      "Write `extractValue(std::string json, std::string key)` that extracts a string value from a simple JSON like `{\"city\": \"London\"}`. Use `std::string::find` and `substr`. Print the city.",
    starter: `#include <iostream>
#include <string>

// TODO: std::string extractValue(std::string json, std::string key)

int main() {
    std::cout << extractValue("{\"city\": \"London\"}", "city") << std::endl;
    return 0;
}`,
    expectedOutput: ["London"],
    hint: "Find key in json, then find the quotes around the value and extract with substr.",
  },
  {
    title: "JSON Array",
    instruction:
      "Build a JSON array string from a `std::vector<int>`. Write `toJsonArray(std::vector<int> nums)` that returns `[1,2,3]` for `{1,2,3}`. Print it.",
    starter: `#include <iostream>
#include <string>
#include <vector>

// TODO: std::string toJsonArray(std::vector<int> nums)

int main() {
    std::cout << toJsonArray({1, 2, 3}) << std::endl;
    return 0;
}`,
    expectedOutput: ["[1,2,3]"],
    hint: "Build result = \"[\"; loop with to_string and commas; pop last comma; append \"]\";",
  },
  {
    title: "Escape Strings",
    instruction:
      "JSON strings must escape double quotes and backslashes. Write `escapeJson(std::string s)` that replaces `\"` with `\\\"` and `\\` with `\\\\`. Test with `He said \"hello\"` and print the escaped version.",
    starter: `#include <iostream>
#include <string>

// TODO: std::string escapeJson(std::string s)

int main() {
    std::cout << escapeJson("He said \"hello\"") << std::endl;
    return 0;
}`,
    expectedOutput: ['He said \\"hello\\"'],
    hint: "Loop over each char; if '\"' append \\\\\\\"; else if '\\\\' append \\\\\\\\; else append the char.",
  },
];
