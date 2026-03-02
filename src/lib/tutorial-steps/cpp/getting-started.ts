import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Hello, World!",
    instruction:
      "Every C++ program needs `#include <iostream>` to use I/O, and `int main()` as the entry point. Use `std::cout` to print text and `std::endl` (or `\"\\n\"`) to end the line. Click Run to see your first C++ program in action.",
    starter: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
    expectedOutput: ["Hello, World!"],
    hint: "The program is already complete — just click Run and watch the output appear.",
  },
  {
    title: "Print Multiple Lines",
    instruction:
      "You can call `std::cout` as many times as you like — each `<< std::endl` ends the current line. Update the program to print two lines: one containing the word \"C++\" and one containing the word \"Beginner\".",
    starter: `#include <iostream>

int main() {
    std::cout << "I am learning C++" << std::endl;
    // TODO: print a second line containing the word "Beginner"
    return 0;
}`,
    expectedOutput: ["C++", "Beginner"],
    hint: "Add another std::cout line below the first one.",
  },
  {
    title: "Use Variables",
    instruction:
      "Declare a `std::string` variable `language` with value \"C++\" and an `int` variable `version` with value 17. Print the message \"Learning C++ version 17\" using `std::cout` and the `<<` operator.",
    starter: `#include <iostream>
#include <string>

int main() {
    std::string language = "C++";
    int version = 17;
    // TODO: print "Learning C++ version 17" using language and version
    return 0;
}`,
    expectedOutput: ["Learning C++ version 17"],
    hint: "std::cout << \"Learning \" << language << \" version \" << version << std::endl;",
  },
  {
    title: "Stream Formatting",
    instruction:
      "Use `std::cout` with the `<<` operator to chain multiple values. Build the greeting \"Hello, Learner!\" from a variable `name = \"Learner\"` and print it.",
    starter: `#include <iostream>
#include <string>

int main() {
    std::string name = "Learner";
    // TODO: print "Hello, Learner!" using name and <<
    return 0;
}`,
    expectedOutput: ["Hello, Learner!"],
    hint: "std::cout << \"Hello, \" << name << \"!\" << std::endl;",
  },
  {
    title: "Add Comments",
    instruction:
      "C++ supports single-line comments with `//` and multi-line comments with `/* */`. Add a `//` comment above the cout line describing what it does, then make sure the program prints \"Comments done!\".",
    starter: `#include <iostream>

int main() {
    // TODO: add a comment here describing what the next line does
    std::cout << "Comments done!" << std::endl;
    return 0;
}`,
    expectedOutput: ["Comments done!"],
    hint: "A comment looks like: // This prints a confirmation message.",
  },
];
