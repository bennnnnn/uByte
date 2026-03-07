import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Standard Headers",
    instruction:
      "C++ organises its standard library into headers. Include `<cmath>` and use `std::sqrt` to compute the square root of 144. Print the result.",
    starter: `#include <iostream>
// TODO: include <cmath>

int main() {
    // TODO: print std::sqrt(144)
    return 0;
}`,
    expectedOutput: ["12"],
    hint: "#include <cmath>\nstd::cout << std::sqrt(144) << std::endl;",
  },
  {
    title: "Namespaces",
    instruction:
      "Namespaces prevent name collisions. Define a namespace `math` containing `double square(double x)`. Call it as `math::square(5)` and print the result.",
    starter: `#include <iostream>

// TODO: namespace math { double square(double x) { return x*x; } }

int main() {
    std::cout << math::square(5) << std::endl;
    return 0;
}`,
    expectedOutput: ["25"],
    hint: "namespace math { double square(double x) { return x * x; } }",
  },
  {
    title: "using Declaration",
    instruction:
      "`using` brings a single name into scope. Use `using std::cout` and `using std::endl` so you can write `cout` directly without the `std::` prefix. Print `\"Hello\"`.",
    starter: `#include <iostream>

// TODO: using std::cout; using std::endl;

int main() {
    cout << "Hello" << endl;
    return 0;
}`,
    expectedOutput: ["Hello"],
    hint: "using std::cout;\nusing std::endl;",
  },
  {
    title: "Header Guards",
    instruction:
      "Header guards prevent double-inclusion with `#ifndef / #define / #endif`. Imagine a header file below. Fill in the guard macro so it's only included once. (The program just prints `\"guarded\"`.)",
    starter: `// Simulating a header file inline — normally this would be in .h
#ifndef MY_HEADER_H
// TODO: add the #define line
void sayHello() {}  // placeholder
#endif

#include <iostream>

int main() {
    std::cout << "guarded" << std::endl;
    return 0;
}`,
    expectedOutput: ["guarded"],
    hint: "#define MY_HEADER_H",
  },
  {
    title: "Inline Functions",
    instruction:
      "The `inline` keyword suggests the compiler substitute the function body at the call site. Define `inline int cube(int x)` and call it with 3. Print the result.",
    starter: `#include <iostream>

// TODO: inline int cube(int x)

int main() {
    std::cout << cube(3) << std::endl;
    return 0;
}`,
    expectedOutput: ["27"],
    hint: "inline int cube(int x) { return x * x * x; }",
  },
];
