import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Instance Method",
    instruction:
      "Add a `deposit(double amount)` method to `BankAccount` that adds to `balance`. Deposit 500 into an account starting at 1000 and print the balance.",
    starter: `#include <iostream>

class BankAccount {
public:
    double balance;
    BankAccount(double b) : balance(b) {}
    // TODO: void deposit(double amount)
};

int main() {
    BankAccount acc(1000);
    acc.deposit(500);
    std::cout << acc.balance << std::endl;
    return 0;
}`,
    expectedOutput: ["1500"],
    hint: "void deposit(double amount) { balance += amount; }",
  },
  {
    title: "const Method",
    instruction:
      "Mark a method `const` when it doesn't modify the object. Add a `const` method `getBalance()` that returns `balance`. Call it and print.",
    starter: `#include <iostream>

class BankAccount {
public:
    double balance;
    BankAccount(double b) : balance(b) {}
    // TODO: double getBalance() const
};

int main() {
    const BankAccount acc(750);
    std::cout << acc.getBalance() << std::endl;
    return 0;
}`,
    expectedOutput: ["750"],
    hint: "double getBalance() const { return balance; }",
  },
  {
    title: "Static Method",
    instruction:
      "A `static` member function belongs to the class, not an instance. Add a static `validate(double amount)` to `BankAccount` that returns `true` if amount > 0. Print `validate(100)`.",
    starter: `#include <iostream>

class BankAccount {
public:
    // TODO: static bool validate(double amount)
};

int main() {
    std::cout << std::boolalpha << BankAccount::validate(100) << std::endl;
    return 0;
}`,
    expectedOutput: ["true"],
    hint: "static bool validate(double amount) { return amount > 0; }",
  },
  {
    title: "Operator Overloading",
    instruction:
      "C++ lets you redefine operators for your types. Implement `operator+` for `Vector` so that `v1 + v2` returns a new Vector with summed components. Print the result.",
    starter: `#include <iostream>

struct Vector {
    int x, y;
    // TODO: Vector operator+(const Vector& o) const
};

int main() {
    Vector v = Vector{1, 2} + Vector{3, 4};
    std::cout << v.x << std::endl;
    std::cout << v.y << std::endl;
    return 0;
}`,
    expectedOutput: ["4", "6"],
    hint: "Vector operator+(const Vector& o) const { return {x + o.x, y + o.y}; }",
  },
  {
    title: "Destructor",
    instruction:
      "A destructor runs when an object goes out of scope. Add `~Resource()` that prints `\"destroyed\"`. Create a `Resource` inside a block `{}` and verify the destructor message appears when the block ends.",
    starter: `#include <iostream>

class Resource {
public:
    Resource() { std::cout << "created" << std::endl; }
    // TODO: ~Resource() prints "destroyed"
};

int main() {
    { Resource r; }
    return 0;
}`,
    expectedOutput: ["created", "destroyed"],
    hint: "~Resource() { std::cout << \"destroyed\" << std::endl; }",
  },
];
