import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Pure Virtual Function",
    instruction:
      "C++ interfaces are classes with pure virtual functions (`= 0`). Define an `Animal` abstract class with `virtual std::string speak() const = 0`. Implement a `Dog` class that returns `\"Woof!\"`. Create a Dog and print its speak.",
    starter: `#include <iostream>
#include <string>

class Animal {
public:
    // TODO: pure virtual std::string speak() const = 0
    virtual ~Animal() = default;
};

// TODO: class Dog : public Animal — speak returns "Woof!"

int main() {
    Dog d;
    std::cout << d.speak() << std::endl;
    return 0;
}`,
    expectedOutput: ["Woof!"],
    hint: "virtual std::string speak() const = 0;\n\nclass Dog : public Animal {\npublic:\n    std::string speak() const override { return \"Woof!\"; }\n};",
  },
  {
    title: "Polymorphism with Pointer",
    instruction:
      "Virtual functions enable polymorphism. Create a `Cat` class that returns `\"Meow!\"`. Store `Dog` and `Cat` behind `Animal*` pointers and call `speak()` on each.",
    starter: `#include <iostream>
#include <string>

class Animal {
public:
    virtual std::string speak() const = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    std::string speak() const override { return "Woof!"; }
};

// TODO: class Cat returns "Meow!"

int main() {
    Animal* a1 = new Dog();
    Animal* a2 = new Cat();
    std::cout << a1->speak() << std::endl;
    std::cout << a2->speak() << std::endl;
    delete a1; delete a2;
    return 0;
}`,
    expectedOutput: ["Woof!", "Meow!"],
    hint: "class Cat : public Animal {\npublic:\n    std::string speak() const override { return \"Meow!\"; }\n};",
  },
  {
    title: "Multiple Inheritance",
    instruction:
      "C++ supports multiple inheritance. Define `Flyable` with `virtual fly()` and `Swimmable` with `virtual swim()`. Create `Duck` that inherits from both and implements both. Print both calls.",
    starter: `#include <iostream>
#include <string>

class Flyable {
public:
    virtual std::string fly() const = 0;
    virtual ~Flyable() = default;
};

class Swimmable {
public:
    virtual std::string swim() const = 0;
    virtual ~Swimmable() = default;
};

// TODO: class Duck : public Flyable, public Swimmable

int main() {
    Duck d;
    std::cout << d.fly() << std::endl;
    std::cout << d.swim() << std::endl;
    return 0;
}`,
    expectedOutput: ["Flying", "Swimming"],
    hint: "class Duck : public Flyable, public Swimmable {\npublic:\n    std::string fly() const override { return \"Flying\"; }\n    std::string swim() const override { return \"Swimming\"; }\n};",
  },
  {
    title: "override Keyword",
    instruction:
      "The `override` keyword makes the compiler verify you're overriding a base method. Add it to `Dog::speak`. If the signature doesn't match the base, you get a compile error — a safety net!",
    starter: `#include <iostream>
#include <string>

class Animal {
public:
    virtual std::string speak() const = 0;
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    // TODO: add override to the speak declaration
    std::string speak() const { return "Woof!"; }
};

int main() {
    Dog d;
    std::cout << d.speak() << std::endl;
    return 0;
}`,
    expectedOutput: ["Woof!"],
    hint: "std::string speak() const override { return \"Woof!\"; }",
  },
];
