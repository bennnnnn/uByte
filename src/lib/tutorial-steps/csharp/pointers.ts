import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Auto-Properties",
    instruction:
      "Define a `Person` class with auto-properties `Name` (string) and `Age` (int). Create an instance with `Name = \"Alice\"` and `Age = 25`. Print `\"Alice is 25\"`.",
    starter: `using System;

class Person {
    // TODO: add Name and Age auto-properties
}

class Program {
    static void Main() {
        var p = new Person { Name = "Alice", Age = 25 };
        Console.WriteLine($"{p.Name} is {p.Age}");
    }
}`,
    expectedOutput: ["Alice is 25"],
    hint: "public string Name { get; set; } = \"\"; public int Age { get; set; }",
  },
  {
    title: "Computed Property",
    instruction:
      "Add a computed property `IsAdult` to `Person` that returns `true` when `Age >= 18`. Print `\"Adult: True\"` for a person aged 25.",
    starter: `using System;

class Person {
    public string Name { get; set; } = "";
    public int Age { get; set; }
    // TODO: add IsAdult computed property
}

class Program {
    static void Main() {
        var p = new Person { Name = "Alice", Age = 25 };
        Console.WriteLine($"Adult: {p.IsAdult}");
    }
}`,
    expectedOutput: ["Adult: True"],
    hint: "public bool IsAdult => Age >= 18;",
  },
  {
    title: "init-Only Properties",
    instruction:
      "Define a `Point` record-like class with `init`-only properties `X` and `Y`. Create a point at `(3, 4)` and print `\"3, 4\"`.",
    starter: `using System;

class Point {
    // TODO: X and Y with { get; init; }
}

class Program {
    static void Main() {
        var pt = new Point { X = 3, Y = 4 };
        Console.WriteLine($"{pt.X}, {pt.Y}");
    }
}`,
    expectedOutput: ["3, 4"],
    hint: "public int X { get; init; } public int Y { get; init; }",
  },
  {
    title: "Value vs Reference",
    instruction:
      "Demonstrate that structs are value types: copy a `struct Counter { public int Value; }` into `b`, change `b.Value`, and verify `a.Value` is unchanged. Print `a.Value` (should be `1`).",
    starter: `using System;

struct Counter {
    public int Value;
}

class Program {
    static void Main() {
        Counter a = new Counter { Value = 1 };
        Counter b = a;         // copy
        b.Value = 99;
        // TODO: print a.Value (should still be 1)
    }
}`,
    expectedOutput: ["1"],
    hint: "Console.WriteLine(a.Value);",
  },
  {
    title: "record — Non-Destructive Mutation",
    instruction:
      "Define `record Product(string Name, decimal Price)`. Create `p1` with `Name = \"Book\"` and `Price = 9.99m`. Create `p2` using `p1 with { Price = 12.99m }`. Print `p1.Price` and `p2.Price` on separate lines.",
    starter: `using System;

record Product(string Name, decimal Price);

class Program {
    static void Main() {
        var p1 = new Product("Book", 9.99m);
        // TODO: create p2 with price 12.99m using 'with'
        // print p1.Price then p2.Price
    }
}`,
    expectedOutput: ["9.99", "12.99"],
    hint: "var p2 = p1 with { Price = 12.99m }; Console.WriteLine(p1.Price); Console.WriteLine(p2.Price);",
  },
];
