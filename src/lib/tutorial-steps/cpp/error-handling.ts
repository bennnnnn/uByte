import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "try / catch",
    instruction:
      "Wrap risky code in `try` and catch exceptions with `catch`. Call `divide(10, 0)` which throws `std::invalid_argument`. Catch it and print `\"Error: \" + e.what()`.",
    starter: `#include <iostream>
#include <stdexcept>

double divide(double a, double b) {
    if (b == 0) throw std::invalid_argument("division by zero");
    return a / b;
}

int main() {
    try {
        std::cout << divide(10, 0) << std::endl;
    } catch (const std::invalid_argument& e) {
        // TODO: print "Error: " + e.what()
    }
    return 0;
}`,
    expectedOutput: ["Error: division by zero"],
    hint: "std::cout << \"Error: \" << e.what() << std::endl;",
  },
  {
    title: "Catch Multiple Types",
    instruction:
      "You can stack multiple `catch` blocks. Define `risky(int n)` that throws `std::out_of_range` if `n < 0` and `std::invalid_argument` if `n > 100`. Call it with `n = -1` and handle both.",
    starter: `#include <iostream>
#include <stdexcept>

void risky(int n) {
    if (n < 0) throw std::out_of_range("negative");
    if (n > 100) throw std::invalid_argument("too large");
}

int main() {
    try {
        risky(-1);
    } catch (const std::out_of_range& e) {
        std::cout << "range: " << e.what() << std::endl;
    } catch (const std::invalid_argument& e) {
        // TODO: print "arg: " + e.what()
    }
    return 0;
}`,
    expectedOutput: ["range: negative"],
    hint: "std::cout << \"arg: \" << e.what() << std::endl;",
  },
  {
    title: "throw a Custom Exception",
    instruction:
      "Create your own exception by inheriting from `std::exception`. Define `InsufficientFundsError` and throw it in `withdraw` if `amount > balance`. Catch and print `\"Insufficient funds\"`.",
    starter: `#include <iostream>
#include <stdexcept>

class InsufficientFundsError : public std::exception {
public:
    const char* what() const noexcept override { return "Insufficient funds"; }
};

void withdraw(double balance, double amount) {
    // TODO: throw InsufficientFundsError if amount > balance
}

int main() {
    try {
        withdraw(100, 200);
    } catch (const InsufficientFundsError& e) {
        std::cout << e.what() << std::endl;
    }
    return 0;
}`,
    expectedOutput: ["Insufficient funds"],
    hint: "if (amount > balance) throw InsufficientFundsError();",
  },
  {
    title: "Catch-all Handler",
    instruction:
      "`catch (...)` catches any exception. Wrap a call to a function that throws an int literal `42`. Catch it with `(...)` and print `\"caught unknown exception\"`.",
    starter: `#include <iostream>

void bad() { throw 42; }

int main() {
    try {
        bad();
    } catch (...) {
        // TODO: print "caught unknown exception"
    }
    return 0;
}`,
    expectedOutput: ["caught unknown exception"],
    hint: "std::cout << \"caught unknown exception\" << std::endl;",
  },
  {
    title: "RAII — Resource Cleanup",
    instruction:
      "C++ uses RAII (Resource Acquisition Is Initialization) so that destructors clean up resources even when exceptions are thrown. A `Guard` prints `\"cleanup\"` in its destructor. Even if an exception is thrown, does cleanup run?",
    starter: `#include <iostream>
#include <stdexcept>

struct Guard {
    ~Guard() { std::cout << "cleanup" << std::endl; }
};

int main() {
    try {
        Guard g;
        throw std::runtime_error("oops");
    } catch (...) {
        std::cout << "caught" << std::endl;
    }
    return 0;
}`,
    expectedOutput: ["cleanup", "caught"],
    hint: "The code is already complete — run it to see RAII in action. cleanup prints before caught because the destructor fires as the stack unwinds.",
  },
];
