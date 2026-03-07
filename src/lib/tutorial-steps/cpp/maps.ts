import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "std::map",
    instruction:
      "`std::map` stores key-value pairs sorted by key. Create a map from string to int, add `\"alice\" → 30` and `\"bob\" → 25`, then print alice's value.",
    starter: `#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> ages;
    // TODO: insert alice->30, bob->25, print ages["alice"]
    return 0;
}`,
    expectedOutput: ["30"],
    hint: "ages[\"alice\"] = 30;\nages[\"bob\"] = 25;\nstd::cout << ages[\"alice\"] << std::endl;",
  },
  {
    title: "Iterate a Map",
    instruction:
      "Use a range-based for loop with `auto& [key, value]` to iterate. Print each pair as `\"alice: 30\"`.",
    starter: `#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> ages = {{"alice", 30}, {"bob", 25}};
    // TODO: iterate and print "name: age"
    return 0;
}`,
    expectedOutput: ["alice: 30", "bob: 25"],
    hint: "for (const auto& [name, age] : ages) { std::cout << name << \": \" << age << std::endl; }",
  },
  {
    title: "find and count",
    instruction:
      "`map::find` returns an iterator; if it equals `map::end()` the key doesn't exist. Check if `\"charlie\"` is in `ages`. Print `\"found\"` or `\"not found\"`.",
    starter: `#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> ages = {{"alice", 30}, {"bob", 25}};
    // TODO: find "charlie", print "found" or "not found"
    return 0;
}`,
    expectedOutput: ["not found"],
    hint: "if (ages.find(\"charlie\") != ages.end()) std::cout << \"found\"; else std::cout << \"not found\"; std::cout << std::endl;",
  },
  {
    title: "std::unordered_map",
    instruction:
      "`std::unordered_map` uses a hash table for O(1) average lookup. Create one mapping `\"go\" → 2009` and `\"python\" → 1991`. Print the year for `\"python\"`.",
    starter: `#include <iostream>
#include <unordered_map>
#include <string>

int main() {
    std::unordered_map<std::string, int> years;
    // TODO: insert go->2009, python->1991, print years["python"]
    return 0;
}`,
    expectedOutput: ["1991"],
    hint: "years[\"go\"] = 2009;\nyears[\"python\"] = 1991;\nstd::cout << years[\"python\"] << std::endl;",
  },
  {
    title: "Erase a Key",
    instruction:
      "Use `map::erase(key)` to remove an entry. Erase `\"bob\"` from `ages`, then print the map size.",
    starter: `#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> ages = {{"alice", 30}, {"bob", 25}, {"carol", 22}};
    // TODO: erase "bob", print size
    return 0;
}`,
    expectedOutput: ["2"],
    hint: "ages.erase(\"bob\");\nstd::cout << ages.size() << std::endl;",
  },
];
