import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Instance Method",
    instruction:
      "An instance method receives `self` and can access any instance attribute. Add a `deposit(amount)` method to the `BankAccount` class that adds `amount` to `self.balance`. Deposit 500 and print the balance.",
    starter: `class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance

    # TODO: def deposit(self, amount): add amount to balance

acc = BankAccount(1000)
acc.deposit(500)
print(acc.balance)`,
    expectedOutput: ["1500"],
    hint: "def deposit(self, amount):\n    self.balance += amount",
  },
  {
    title: "Class Method",
    instruction:
      "A `@classmethod` receives the class (`cls`) instead of the instance. Add a `from_string` classmethod to `Point` that parses `\"3,4\"` into `Point(3, 4)`. Print the resulting point.",
    starter: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # TODO: @classmethod def from_string(cls, s): parse "x,y"

    def __str__(self):
        return f"Point({self.x}, {self.y})"

p = Point.from_string("3,4")
print(p)`,
    expectedOutput: ["Point(3, 4)"],
    hint: "@classmethod\ndef from_string(cls, s):\n    x, y = s.split(\",\")\n    return cls(int(x), int(y))",
  },
  {
    title: "Static Method",
    instruction:
      "A `@staticmethod` belongs to the class but receives neither `self` nor `cls`. Add a `validate(age)` static method to `Person` that returns `True` if `age >= 0`. Test it with age 25 and print.",
    starter: `class Person:
    # TODO: @staticmethod def validate(age): return age >= 0

print(Person.validate(25))`,
    expectedOutput: ["True"],
    hint: "@staticmethod\ndef validate(age):\n    return age >= 0",
  },
  {
    title: "Property",
    instruction:
      "A `@property` lets you define a method that's accessed like an attribute. Add a `full_name` property to `Name` that returns `first + \" \" + last`. Print it without calling it as a function.",
    starter: `class Name:
    def __init__(self, first, last):
        self.first = first
        self.last = last

    # TODO: @property def full_name(self)

n = Name("John", "Doe")
print(n.full_name)`,
    expectedOutput: ["John Doe"],
    hint: "@property\ndef full_name(self):\n    return f\"{self.first} {self.last}\"",
  },
  {
    title: "Dunder Method __add__",
    instruction:
      "Dunder (double underscore) methods let you define how operators work on your class. Implement `__add__` on `Vector` so that `v1 + v2` returns a new `Vector` with summed components. Print `Vector(1, 2) + Vector(3, 4)`.",
    starter: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # TODO: def __add__(self, other): return Vector(...)

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

v = Vector(1, 2) + Vector(3, 4)
print(v)`,
    expectedOutput: ["Vector(4, 6)"],
    hint: "def __add__(self, other):\n    return Vector(self.x + other.x, self.y + other.y)",
  },
];
