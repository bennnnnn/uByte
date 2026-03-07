import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define a Struct",
    instruction:
      "A C++ `struct` groups related data. Define a `Person` struct with `std::string name` and `int age`. Create one with name `\"Alice\"` and age `30`, then print both on separate lines.",
    starter: `#include <iostream>
#include <string>

// TODO: struct Person with name and age

int main() {
    // TODO: Person p = {"Alice", 30}; print name then age
    return 0;
}`,
    expectedOutput: ["Alice", "30"],
    hint: "struct Person { std::string name; int age; };\nPerson p = {\"Alice\", 30};\nstd::cout << p.name << std::endl << p.age << std::endl;",
  },
  {
    title: "Class with Constructor",
    instruction:
      "A `class` is like a struct but defaults to private access. Define a `Person` class with a constructor that takes `name` and `age` and stores them. Create `Person(\"Bob\", 25)` and print name and age.",
    starter: `#include <iostream>
#include <string>

class Person {
public:
    // TODO: constructor, public name and age
};

int main() {
    Person p("Bob", 25);
    std::cout << p.name << std::endl;
    std::cout << p.age << std::endl;
    return 0;
}`,
    expectedOutput: ["Bob", "25"],
    hint: "std::string name;\nint age;\nPerson(std::string n, int a) : name(n), age(a) {}",
  },
  {
    title: "Member Method",
    instruction:
      "Add a `greet()` method to `Person` that returns `\"Hi, I'm \" + name + \"!\"`. Create Alice and print the result of calling `greet()`.",
    starter: `#include <iostream>
#include <string>

class Person {
public:
    std::string name;
    int age;
    Person(std::string n, int a) : name(n), age(a) {}
    // TODO: std::string greet() const
};

int main() {
    Person p("Alice", 30);
    std::cout << p.greet() << std::endl;
    return 0;
}`,
    expectedOutput: ["Hi, I'm Alice!"],
    hint: "std::string greet() const { return \"Hi, I'm \" + name + \"!\"; }",
  },
  {
    title: "Inheritance",
    instruction:
      "Inherit from `Person` to create an `Employee` class that adds a `role` field. Create `Employee(\"Carol\", 28, \"Engineer\")` and print name and role.",
    starter: `#include <iostream>
#include <string>

class Person {
public:
    std::string name;
    int age;
    Person(std::string n, int a) : name(n), age(a) {}
};

// TODO: class Employee : public Person with role field and constructor

int main() {
    Employee e("Carol", 28, "Engineer");
    std::cout << e.name << std::endl;
    std::cout << e.role << std::endl;
    return 0;
}`,
    expectedOutput: ["Carol", "Engineer"],
    hint: "class Employee : public Person {\npublic:\n    std::string role;\n    Employee(std::string n, int a, std::string r) : Person(n, a), role(r) {}\n};",
  },
  {
    title: "Nested Struct",
    instruction:
      "Structs can contain other structs. Define an `Address` struct with `std::string city`, then include an `Address addr` field in `Person`. Create a person in `\"London\"` and print the city.",
    starter: `#include <iostream>
#include <string>

// TODO: struct Address with city
// TODO: struct Person with name and Address addr

int main() {
    Person p;
    p.name = "Alice";
    p.addr.city = "London";
    std::cout << p.addr.city << std::endl;
    return 0;
}`,
    expectedOutput: ["London"],
    hint: "struct Address { std::string city; };\nstruct Person { std::string name; Address addr; };",
  },
];
