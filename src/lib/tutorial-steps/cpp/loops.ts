import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "for Loop",
    instruction:
      "A C++ `for` loop has three parts: init, condition, increment. Print numbers 0 through 4, each on its own line.",
    starter: `#include <iostream>

int main() {
    // TODO: for loop printing 0 to 4
    return 0;
}`,
    expectedOutput: ["0", "1", "2", "3", "4"],
    hint: "for (int i = 0; i < 5; i++) { std::cout << i << std::endl; }",
  },
  {
    title: "while Loop",
    instruction:
      "A `while` loop runs as long as a condition is true. Start `count = 1` and print it while it's `<= 3`, incrementing each time.",
    starter: `#include <iostream>

int main() {
    int count = 1;
    // TODO: while count <= 3, print and increment
    return 0;
}`,
    expectedOutput: ["1", "2", "3"],
    hint: "while (count <= 3) { std::cout << count << std::endl; count++; }",
  },
  {
    title: "Range-based for",
    instruction:
      "C++11 introduced range-based `for` loops. Loop over a vector `{\"apple\", \"banana\", \"cherry\"}` using `for (const auto& fruit : fruits)` and print each item.",
    starter: `#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> fruits = {"apple", "banana", "cherry"};
    // TODO: range-based for loop printing each fruit
    return 0;
}`,
    expectedOutput: ["apple", "banana", "cherry"],
    hint: "for (const auto& fruit : fruits) { std::cout << fruit << std::endl; }",
  },
  {
    title: "break and continue",
    instruction:
      "`break` exits a loop; `continue` skips an iteration. Loop i from 1 to 10. Skip even numbers with `continue` and stop when i reaches 7 with `break`. You should print 1, 3, 5.",
    starter: `#include <iostream>

int main() {
    for (int i = 1; i <= 10; i++) {
        // TODO: skip evens, break at 7
        std::cout << i << std::endl;
    }
    return 0;
}`,
    expectedOutput: ["1", "3", "5"],
    hint: "if (i % 2 == 0) continue;\nif (i == 7) break;\nstd::cout << i << std::endl;",
  },
  {
    title: "do-while Loop",
    instruction:
      "A `do-while` loop always executes the body at least once. Print `\"running\"` and increment `n` starting at 0. Stop when `n >= 3`. Output should be 3 lines of `\"running\"`.",
    starter: `#include <iostream>

int main() {
    int n = 0;
    // TODO: do-while printing "running" until n >= 3
    return 0;
}`,
    expectedOutput: ["running", "running", "running"],
    hint: "do { std::cout << \"running\" << std::endl; n++; } while (n < 3);",
  },
];
