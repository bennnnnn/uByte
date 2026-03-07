import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define and Call a Function",
    instruction:
      "Functions in C++ are declared with a return type before the name. Define `std::string greet(std::string name)` that returns `\"Hello, \" + name + \"!\"`. Call it with `\"Alice\"` and print.",
    starter: `#include <iostream>
#include <string>

// TODO: define greet(name) returning "Hello, <name>!"

int main() {
    std::cout << greet("Alice") << std::endl;
    return 0;
}`,
    expectedOutput: ["Hello, Alice!"],
    hint: "std::string greet(std::string name) { return \"Hello, \" + name + \"!\"; }",
  },
  {
    title: "Default Parameters",
    instruction:
      "C++ allows default parameter values. Update `greet` to default `greeting` to `\"Hello\"` so that `greet(\"Bob\")` prints `\"Hello, Bob!\"` and `greet(\"Bob\", \"Hi\")` prints `\"Hi, Bob!\"`.",
    starter: `#include <iostream>
#include <string>

std::string greet(std::string name, std::string greeting = "Hello") {
    // TODO: return greeting + ", " + name + "!"
    return "";
}

int main() {
    std::cout << greet("Bob") << std::endl;
    std::cout << greet("Bob", "Hi") << std::endl;
    return 0;
}`,
    expectedOutput: ["Hello, Bob!", "Hi, Bob!"],
    hint: "return greeting + \", \" + name + \"!\";",
  },
  {
    title: "Function Overloading",
    instruction:
      "C++ allows multiple functions with the same name but different parameter types. Define `add(int, int)` and `add(double, double)`. Call each and print `5` and `3.7`.",
    starter: `#include <iostream>

// TODO: int add(int a, int b)
// TODO: double add(double a, double b)

int main() {
    std::cout << add(2, 3) << std::endl;
    std::cout << add(1.2, 2.5) << std::endl;
    return 0;
}`,
    expectedOutput: ["5", "3.7"],
    hint: "int add(int a, int b) { return a + b; }\ndouble add(double a, double b) { return a + b; }",
  },
  {
    title: "Lambda",
    instruction:
      "C++11 lambdas are anonymous functions. Create a lambda `square` that takes an int and returns its square. Call it with 7 and print the result.",
    starter: `#include <iostream>

int main() {
    // TODO: auto square = [](int x) { return x * x; };
    auto square = nullptr;
    std::cout << square(7) << std::endl;
    return 0;
}`,
    expectedOutput: ["49"],
    hint: "auto square = [](int x) { return x * x; };",
  },
  {
    title: "Pass by Reference",
    instruction:
      "Passing by reference (`&`) lets a function modify the caller's variable. Define `increment(int& n)` that adds 1 to `n`. Call it with `count = 5` and print the result.",
    starter: `#include <iostream>

// TODO: void increment(int& n) { n++; }

int main() {
    int count = 5;
    increment(count);
    std::cout << count << std::endl;
    return 0;
}`,
    expectedOutput: ["6"],
    hint: "void increment(int& n) { n++; }",
  },
];
