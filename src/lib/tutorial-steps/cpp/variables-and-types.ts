import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Declare Variables",
    instruction:
      "In C++ you declare variables with their type first: `int age = 30;` or `std::string name = \"Alice\";`. Declare a `std::string` named `name` with value \"Alice\" and an `int` named `age` with value 30. Print both on separate lines.",
    starter: `#include <iostream>
#include <string>

int main() {
    // TODO: declare name (string) = "Alice"
    // TODO: declare age (int) = 30
    // TODO: print name, then print age
    return 0;
}`,
    expectedOutput: ["Alice", "30"],
    hint: "std::string name = \"Alice\"; then int age = 30; then two std::cout lines.",
  },
  {
    title: "Auto Keyword",
    instruction:
      "The `auto` keyword (C++11) lets the compiler infer the type. Declare `city` as \"London\" and `population` as 9000000 using `auto`, then print both.",
    starter: `#include <iostream>
#include <string>

int main() {
    // TODO: declare city and population using auto
    // TODO: print both
    return 0;
}`,
    expectedOutput: ["London", "9000000"],
    hint: "auto city = std::string(\"London\"); and auto population = 9000000;",
  },
  {
    title: "Default Values",
    instruction:
      "In C++, built-in types like `int` and `double` have undefined values if not initialized (unlike Go). But you can default-initialize with `int n = 0;`. Declare `n` as 0, `flag` as false, and `s` as an empty string, then print each.",
    starter: `#include <iostream>
#include <string>

int main() {
    int n = 0;
    bool flag = false;
    std::string s = "";
    // TODO: print n, flag, and s
    return 0;
}`,
    expectedOutput: ["0", "0"],
    hint: "std::cout << n << std::endl; prints 0. std::cout << flag << std::endl; prints 0 (false). std::cout << s << std::endl; prints an empty line.",
  },
  {
    title: "String Methods",
    instruction:
      "`std::string` has many useful methods. Use `.length()` to get the length and `.substr()` to get a substring. Print the length of \"hello\" and the first 3 characters of \"Cplusplus\".",
    starter: `#include <iostream>
#include <string>

int main() {
    std::string word = "hello";
    std::string lang = "Cplusplus";
    // TODO: print the length of word
    // TODO: print the first 3 characters of lang using substr(0, 3)
    return 0;
}`,
    expectedOutput: ["5", "Cpl"],
    hint: "std::cout << word.length() << std::endl; and std::cout << lang.substr(0, 3) << std::endl;",
  },
  {
    title: "Type Casting",
    instruction:
      "C++ uses `static_cast<T>()` for safe type conversions. Convert the `int` 42 to `double` and print it. Then print it again with 2 decimal places using `std::fixed` and `std::setprecision`.",
    starter: `#include <iostream>
#include <iomanip>

int main() {
    int i = 42;
    // TODO: cast i to double and store in d
    // TODO: print d
    // TODO: print d with 2 decimal places: std::cout << std::fixed << std::setprecision(2) << d << std::endl;
    return 0;
}`,
    expectedOutput: ["42", "42.00"],
    hint: "double d = static_cast<double>(i); Then print d normally, then with std::fixed << std::setprecision(2).",
  },
  {
    title: "Constants",
    instruction:
      "Use `const` (runtime constant) or `constexpr` (compile-time constant) to declare unchangeable values. Declare `constexpr double Pi = 3.14159` and compute the area of a circle with radius 5. Print with 2 decimal places.",
    starter: `#include <iostream>
#include <iomanip>

constexpr double Pi = 3.14159;

int main() {
    double radius = 5.0;
    // TODO: calculate area = Pi * radius * radius
    // TODO: print with std::fixed << std::setprecision(2)
    return 0;
}`,
    expectedOutput: ["78.54"],
    hint: "double area = Pi * radius * radius; then std::cout << std::fixed << std::setprecision(2) << area << std::endl;",
  },
];
