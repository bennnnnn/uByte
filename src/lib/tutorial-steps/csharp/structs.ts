import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define a Class",
    instruction:
      "Define an `Animal` class with a `Name` property and a `Speak()` method that returns `\"...\"`. Create an `Animal` named `\"Cat\"` and print `cat.Speak()`.",
    starter: `using System;

class Animal {
    public string Name { get; }
    public Animal(string name) { Name = name; }
    // TODO: add virtual Speak() returning "..."
}

class Program {
    static void Main() {
        var cat = new Animal("Cat");
        Console.WriteLine(cat.Speak());
    }
}`,
    expectedOutput: ["..."],
    hint: "public virtual string Speak() => \"...\";",
  },
  {
    title: "Inheritance",
    instruction:
      "Create a `Dog` class that inherits from `Animal` and overrides `Speak()` to return `\"Woof!\"`. Print a `Dog`'s `Speak()` result.",
    starter: `using System;

class Animal {
    public string Name { get; }
    public Animal(string name) { Name = name; }
    public virtual string Speak() => "...";
}

// TODO: create Dog : Animal, override Speak to return "Woof!"

class Program {
    static void Main() {
        Animal d = new Dog("Rex");
        Console.WriteLine(d.Speak());
    }
}`,
    expectedOutput: ["Woof!"],
    hint: "class Dog : Animal { public Dog(string n) : base(n) {} public override string Speak() => \"Woof!\"; }",
  },
  {
    title: "Abstract Class",
    instruction:
      "Define an `abstract class Shape` with an `abstract double Area()` method. Implement `Circle : Shape` with radius `5`. Print the area rounded to 2 decimal places. (π × 5² ≈ 78.54)",
    starter: `using System;

abstract class Shape {
    public abstract double Area();
}

// TODO: class Circle : Shape with radius 5

class Program {
    static void Main() {
        Shape s = new Circle(5);
        Console.WriteLine(s.Area().ToString("F2"));
    }
}`,
    expectedOutput: ["78.54"],
    hint: "class Circle : Shape { double _r; public Circle(double r) => _r = r; public override double Area() => Math.PI * _r * _r; }",
  },
  {
    title: "Struct Distance",
    instruction:
      "Complete the `Point` struct with an `X` and `Y` field. The `Distance` method is already written. Create `p1 = (0,0)` and `p2 = (3,4)` and print the distance (`5`).",
    starter: `using System;

struct Point {
    public double X, Y;
    public Point(double x, double y) { X = x; Y = y; }
    public double Distance(Point other) =>
        Math.Sqrt(Math.Pow(X - other.X, 2) + Math.Pow(Y - other.Y, 2));
}

class Program {
    static void Main() {
        var p1 = new Point(0, 0);
        var p2 = new Point(3, 4);
        Console.WriteLine(p1.Distance(p2));
    }
}`,
    expectedOutput: ["5"],
    hint: "The struct is complete — just click Run.",
  },
  {
    title: "ToString Override",
    instruction:
      "Override `ToString()` on an `Animal` class to return `\"{Name} says {Speak()}\".` Create a `Dog` named `\"Rex\"` and print it. Expected: `\"Rex says Woof!\"`.",
    starter: `using System;

class Animal {
    public string Name { get; }
    public Animal(string name) { Name = name; }
    public virtual string Speak() => "...";
    // TODO: override ToString to return "{Name} says {Speak()}"
}

class Dog : Animal {
    public Dog(string n) : base(n) {}
    public override string Speak() => "Woof!";
}

class Program {
    static void Main() {
        Console.WriteLine(new Dog("Rex"));
    }
}`,
    expectedOutput: ["Rex says Woof!"],
    hint: "public override string ToString() => $\"{Name} says {Speak()}\";",
  },
];
