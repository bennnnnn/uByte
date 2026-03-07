import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "if Statement",
    instruction:
      "An `if` statement executes a block only when its condition is true. Check if `x = 15` is greater than 10. If so, print `\"greater than 10\"`.",
    starter: `#include <iostream>

int main() {
    int x = 15;
    // TODO: if x > 10, print "greater than 10"
    return 0;
}`,
    expectedOutput: ["greater than 10"],
    hint: "if (x > 10) { std::cout << \"greater than 10\" << std::endl; }",
  },
  {
    title: "if-else",
    instruction:
      "An `if-else` handles both branches. A student scored 72. If `score >= 60` print `\"Pass\"`, else print `\"Fail\"`.",
    starter: `#include <iostream>

int main() {
    int score = 72;
    // TODO: print "Pass" if score >= 60, else "Fail"
    return 0;
}`,
    expectedOutput: ["Pass"],
    hint: "if (score >= 60) { std::cout << \"Pass\" << std::endl; } else { std::cout << \"Fail\" << std::endl; }",
  },
  {
    title: "else if Chain",
    instruction:
      "Chain multiple conditions with `else if`. Given `grade = 85`, print `\"A\"` for 90+, `\"B\"` for 80+, `\"C\"` for 70+, and `\"F\"` otherwise.",
    starter: `#include <iostream>

int main() {
    int grade = 85;
    // TODO: print letter grade
    return 0;
}`,
    expectedOutput: ["B"],
    hint: "if (grade >= 90) std::cout << \"A\"; else if (grade >= 80) std::cout << \"B\"; ...",
  },
  {
    title: "switch Statement",
    instruction:
      "A `switch` statement is a clean alternative to chained if-else. Given `day = 1` (Monday), print `\"Weekday\"` for 1–5 and `\"Weekend\"` for 6–7.",
    starter: `#include <iostream>

int main() {
    int day = 1;
    // TODO: switch on day, print "Weekday" or "Weekend"
    return 0;
}`,
    expectedOutput: ["Weekday"],
    hint: "switch(day) { case 1: case 2: ... case 5: std::cout << \"Weekday\"; break; case 6: case 7: std::cout << \"Weekend\"; break; }",
  },
  {
    title: "FizzBuzz",
    instruction:
      "Classic FizzBuzz: loop i from 1 to 15. Print `\"FizzBuzz\"` for multiples of both 3 and 5, `\"Fizz\"` for just 3, `\"Buzz\"` for just 5, otherwise print the number.",
    starter: `#include <iostream>

int main() {
    for (int i = 1; i <= 15; i++) {
        // TODO: FizzBuzz logic
        std::cout << i << std::endl;
    }
    return 0;
}`,
    expectedOutput: ["Fizz", "Buzz", "FizzBuzz"],
    hint: "if (i%15==0) std::cout<<\"FizzBuzz\"; else if (i%3==0) std::cout<<\"Fizz\"; else if (i%5==0) std::cout<<\"Buzz\"; else std::cout<<i; std::cout<<std::endl;",
  },
];
