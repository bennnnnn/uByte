import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "assert Macro",
    instruction:
      "The `<cassert>` header provides the `assert` macro that aborts if an expression is false. Assert that `add(2, 3) == 5`. If it passes, print `\"All checks passed\"`.",
    starter: `#include <iostream>
#include <cassert>

int add(int a, int b) { return a + b; }

int main() {
    // TODO: assert add(2, 3) == 5
    std::cout << "All checks passed" << std::endl;
    return 0;
}`,
    expectedOutput: ["All checks passed"],
    hint: "assert(add(2, 3) == 5);",
  },
  {
    title: "Simple Test Runner",
    instruction:
      "Without a framework, you can write a minimal test runner. Define `test(std::string name, bool condition)` that prints `\"PASS: <name>\"` or `\"FAIL: <name>\"`. Test `add(3, 4) == 7`.",
    starter: `#include <iostream>
#include <string>

int add(int a, int b) { return a + b; }

// TODO: void test(std::string name, bool condition) — prints PASS or FAIL

int main() {
    test("add(3,4)==7", add(3, 4) == 7);
    return 0;
}`,
    expectedOutput: ["PASS: add(3,4)==7"],
    hint: "void test(std::string name, bool condition) {\n    std::cout << (condition ? \"PASS: \" : \"FAIL: \") << name << std::endl;\n}",
  },
  {
    title: "Test for Exceptions",
    instruction:
      "To test that a function throws, wrap it in a try-catch. Define a test that verifies `divide(10, 0)` throws `std::invalid_argument`. Print `\"PASS: throws on zero\"`.",
    starter: `#include <iostream>
#include <stdexcept>

double divide(double a, double b) {
    if (b == 0) throw std::invalid_argument("zero");
    return a / b;
}

int main() {
    bool threw = false;
    // TODO: try divide(10, 0), catch invalid_argument, set threw = true
    if (threw) std::cout << "PASS: throws on zero" << std::endl;
    else std::cout << "FAIL: no exception" << std::endl;
    return 0;
}`,
    expectedOutput: ["PASS: throws on zero"],
    hint: "try { divide(10, 0); } catch (const std::invalid_argument&) { threw = true; }",
  },
  {
    title: "Test Multiple Cases",
    instruction:
      "Good tests check edge cases. Use the `test` helper to test `add` with three cases: `(0,0)==0`, `(-1,1)==0`, and `(100,200)==300`. All should pass.",
    starter: `#include <iostream>
#include <string>

int add(int a, int b) { return a + b; }

void test(std::string name, bool condition) {
    std::cout << (condition ? "PASS: " : "FAIL: ") << name << std::endl;
}

int main() {
    // TODO: test all three cases
    return 0;
}`,
    expectedOutput: ["PASS: 0+0", "PASS: -1+1", "PASS: 100+200"],
    hint: "test(\"0+0\", add(0,0)==0);\ntest(\"-1+1\", add(-1,1)==0);\ntest(\"100+200\", add(100,200)==300);",
  },
];
