import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define a Class",
    instruction:
      "Python uses classes to bundle data and behaviour. Define a `Person` class with an `__init__` method that sets `self.name` and `self.age`. Create `Person(\"Alice\", 30)` and print the name, then the age.",
    starter: `class Person:
    # TODO: def __init__(self, name, age): set self.name and self.age

p = Person("Alice", 30)
print(p.name)
print(p.age)`,
    expectedOutput: ["Alice", "30"],
    hint: "def __init__(self, name, age):\n    self.name = name\n    self.age = age",
  },
  {
    title: "Instance Methods",
    instruction:
      "Methods are functions defined inside a class that receive `self`. Add a `greet()` method to `Person` that returns `\"Hi, I'm <name>!\"`. Create Alice and print the result of calling `greet()`.",
    starter: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    # TODO: def greet(self): return "Hi, I'm <name>!"

p = Person("Alice", 30)
print(p.greet())`,
    expectedOutput: ["Hi, I'm Alice!"],
    hint: "def greet(self):\n    return f\"Hi, I'm {self.name}!\"",
  },
  {
    title: "Dataclass",
    instruction:
      "`@dataclass` auto-generates `__init__`, `__repr__`, and more. Define a `Point` dataclass with `x: float` and `y: float`. Create `Point(3.0, 4.0)` and print it.",
    starter: `from dataclasses import dataclass

# TODO: @dataclass class Point with x: float, y: float

p = Point(3.0, 4.0)
print(p)`,
    expectedOutput: ["Point(x=3.0, y=4.0)"],
    hint: "@dataclass\nclass Point:\n    x: float\n    y: float",
  },
  {
    title: "Inheritance",
    instruction:
      "A subclass inherits everything from its parent. Define `Employee` as a subclass of `Person` that adds a `role` attribute. Create `Employee(\"Bob\", 25, \"Engineer\")` and print name and role.",
    starter: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

# TODO: class Employee(Person) with role attribute

e = Employee("Bob", 25, "Engineer")
print(e.name)
print(e.role)`,
    expectedOutput: ["Bob", "Engineer"],
    hint: "class Employee(Person):\n    def __init__(self, name, age, role):\n        super().__init__(name, age)\n        self.role = role",
  },
  {
    title: "__repr__ and __str__",
    instruction:
      "`__repr__` gives a developer-friendly representation; `__str__` is for end users. Add `__str__` to `Person` so `print(p)` shows `\"Alice (30)\"`. Create Alice and print her.",
    starter: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    # TODO: def __str__(self): return "Name (Age)"

p = Person("Alice", 30)
print(p)`,
    expectedOutput: ["Alice (30)"],
    hint: "def __str__(self):\n    return f\"{self.name} ({self.age})\"",
  },
];
