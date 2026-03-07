import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Abstract Base Class",
    instruction:
      "Python uses `ABC` and `@abstractmethod` to define interfaces. Define an `Animal` ABC with an abstract `speak()` method. Implement a `Dog` class that overrides `speak()` to return `\"Woof!\"`. Create a Dog and print its speak.",
    starter: `from abc import ABC, abstractmethod

class Animal(ABC):
    # TODO: @abstractmethod def speak(self)
    pass

# TODO: class Dog(Animal) with speak returning "Woof!"

d = Dog()
print(d.speak())`,
    expectedOutput: ["Woof!"],
    hint: "@abstractmethod\ndef speak(self): ...\n\nclass Dog(Animal):\n    def speak(self):\n        return \"Woof!\"",
  },
  {
    title: "Duck Typing",
    instruction:
      "Python embraces duck typing — if it has the right method, it works. Define `make_sound(animal)` that calls `animal.speak()`. Pass both a `Dog` and a `Cat` object (both with `speak()`) and print both results.",
    starter: `class Dog:
    def speak(self):
        return "Woof!"

class Cat:
    def speak(self):
        return "Meow!"

# TODO: def make_sound(animal): return animal.speak()

print(make_sound(Dog()))
print(make_sound(Cat()))`,
    expectedOutput: ["Woof!", "Meow!"],
    hint: "def make_sound(animal):\n    return animal.speak()",
  },
  {
    title: "Protocol (Structural Subtyping)",
    instruction:
      "The `typing.Protocol` class lets you define structural interfaces. Define a `Drawable` Protocol with a `draw()` method. Define a `Circle` class with `draw()` returning `\"Drawing circle\"`. Call a `render(shape)` function that calls `shape.draw()` and print the result.",
    starter: `from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> str: ...

class Circle:
    # TODO: def draw(self): return "Drawing circle"
    pass

def render(shape: Drawable) -> None:
    print(shape.draw())

render(Circle())`,
    expectedOutput: ["Drawing circle"],
    hint: "def draw(self) -> str:\n    return \"Drawing circle\"",
  },
  {
    title: "Multiple Interface Implementation",
    instruction:
      "A class can satisfy multiple ABCs. Define `Flyable` (abstract `fly()`) and `Swimmable` (abstract `swim()`). Create a `Duck` class that implements both. Print the results of calling each method.",
    starter: `from abc import ABC, abstractmethod

class Flyable(ABC):
    @abstractmethod
    def fly(self): ...

class Swimmable(ABC):
    @abstractmethod
    def swim(self): ...

# TODO: class Duck(Flyable, Swimmable) — fly returns "Flying", swim returns "Swimming"

d = Duck()
print(d.fly())
print(d.swim())`,
    expectedOutput: ["Flying", "Swimming"],
    hint: "class Duck(Flyable, Swimmable):\n    def fly(self): return \"Flying\"\n    def swim(self): return \"Swimming\"",
  },
];
