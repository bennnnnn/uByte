import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Raw Pointer Basics",
    instruction:
      "A pointer stores a memory address. Declare `int x = 42`, then a pointer `int* p = &x`. Print the value stored at the address using the dereference operator `*p`.",
    starter: `#include <iostream>

int main() {
    int x = 42;
    // TODO: int* p = &x; print *p
    return 0;
}`,
    expectedOutput: ["42"],
    hint: "int* p = &x;\nstd::cout << *p << std::endl;",
  },
  {
    title: "Modify Through a Pointer",
    instruction:
      "Assigning to `*p` modifies the variable it points to. Set `x = 10`, create a pointer to it, then set `*p = 20`. Print `x` to confirm it changed.",
    starter: `#include <iostream>

int main() {
    int x = 10;
    int* p = &x;
    // TODO: set *p = 20, print x
    return 0;
}`,
    expectedOutput: ["20"],
    hint: "*p = 20;\nstd::cout << x << std::endl;",
  },
  {
    title: "unique_ptr — Smart Pointer",
    instruction:
      "`std::unique_ptr` manages heap memory automatically — no `delete` needed. Create a `unique_ptr<int>` using `std::make_unique<int>(99)` and print its value.",
    starter: `#include <iostream>
#include <memory>

int main() {
    // TODO: auto p = std::make_unique<int>(99); print *p
    return 0;
}`,
    expectedOutput: ["99"],
    hint: "auto p = std::make_unique<int>(99);\nstd::cout << *p << std::endl;",
  },
  {
    title: "shared_ptr — Shared Ownership",
    instruction:
      "`std::shared_ptr` allows multiple owners. Create a `shared_ptr<int>` with value 7 and copy it to a second pointer. Print the use count (should be 2).",
    starter: `#include <iostream>
#include <memory>

int main() {
    auto p1 = std::make_shared<int>(7);
    // TODO: auto p2 = p1; print p1.use_count()
    return 0;
}`,
    expectedOutput: ["2"],
    hint: "auto p2 = p1;\nstd::cout << p1.use_count() << std::endl;",
  },
  {
    title: "nullptr Check",
    instruction:
      "Always check for `nullptr` before dereferencing. Set `int* p = nullptr`. Print `\"null pointer\"` if it's null, otherwise print the value.",
    starter: `#include <iostream>

int main() {
    int* p = nullptr;
    // TODO: if p is nullptr print "null pointer", else print *p
    return 0;
}`,
    expectedOutput: ["null pointer"],
    hint: "if (p == nullptr) { std::cout << \"null pointer\" << std::endl; } else { std::cout << *p << std::endl; }",
  },
];
