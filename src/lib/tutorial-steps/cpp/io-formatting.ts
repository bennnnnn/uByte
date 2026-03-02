import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "cout Basics",
    instruction:
      "`std::cout` (character output) is C++'s standard output stream. Chain values with `<<`. Print \"Hello\" on one line and \"World\" on the next.",
    starter: `#include <iostream>

int main() {
    // TODO: print "Hello" on one line
    // TODO: print "World" on the next line
    return 0;
}`,
    expectedOutput: ["Hello", "World"],
    hint: "Two separate std::cout << \"...\" << std::endl; lines.",
  },
  {
    title: "cout with Strings and Ints",
    instruction:
      "Chain strings and numbers with `<<`. Print the message \"Name: Alice, Age: 30\" using variables `name` and `age`.",
    starter: `#include <iostream>
#include <string>

int main() {
    std::string name = "Alice";
    int age = 30;
    // TODO: print "Name: Alice, Age: 30"
    return 0;
}`,
    expectedOutput: ["Alice", "30"],
    hint: "std::cout << \"Name: \" << name << \", Age: \" << age << std::endl;",
  },
  {
    title: "Float Precision",
    instruction:
      "Use `std::fixed` and `std::setprecision(n)` from `<iomanip>` to control decimal places. Print Pi (3.14159) with exactly 2 decimal places so the output shows \"3.14\".",
    starter: `#include <iostream>
#include <iomanip>

int main() {
    double pi = 3.14159;
    // TODO: print pi with 2 decimal places
    return 0;
}`,
    expectedOutput: ["3.14"],
    hint: "std::cout << std::fixed << std::setprecision(2) << pi << std::endl;",
  },
  {
    title: "Build a String with ostringstream",
    instruction:
      "`std::ostringstream` (from `<sstream>`) lets you build a string using `<<` just like `cout`. Build the URL string \"http://localhost:8080/api\" from `host` and `port`, store it, then print it.",
    starter: `#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::string host = "localhost";
    int port = 8080;
    // TODO: use std::ostringstream to build "http://localhost:8080/api"
    std::string url = "";
    std::cout << url << std::endl;
    return 0;
}`,
    expectedOutput: ["localhost:8080"],
    hint: "std::ostringstream oss; oss << \"http://\" << host << \":\" << port << \"/api\"; url = oss.str();",
  },
  {
    title: "printf Formatting",
    instruction:
      "C++ also supports C-style `printf` from `<cstdio>`. Use `printf` to print \"C++ %d is awesome\\n\" where the number comes from a variable `year = 17`.",
    starter: `#include <cstdio>

int main() {
    int year = 17;
    // TODO: use printf to print "C++ 17 is awesome"
    return 0;
}`,
    expectedOutput: ["C++ 17 is awesome"],
    hint: "printf(\"C++ %d is awesome\\n\", year);",
  },
];
