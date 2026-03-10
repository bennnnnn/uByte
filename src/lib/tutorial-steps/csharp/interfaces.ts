import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Implement an Interface",
    instruction:
      "Define `interface IShape` with `double Area()`. Implement `Rectangle : IShape` with width `3` and height `4`. Print the area (`12`).",
    starter: `using System;

interface IShape {
    double Area();
}

// TODO: class Rectangle : IShape

class Program {
    static void Main() {
        IShape s = new Rectangle(3, 4);
        Console.WriteLine(s.Area());
    }
}`,
    expectedOutput: ["12"],
    hint: "class Rectangle : IShape { double _w, _h; public Rectangle(double w, double h){_w=w;_h=h;} public double Area() => _w*_h; }",
  },
  {
    title: "Interface Default Method",
    instruction:
      "Add a `default string Describe()` method to `IShape` that returns `$\"Area={Area():F2}\"`. Call it on a `Circle` with radius 5 and print the result.",
    starter: `using System;

interface IShape {
    double Area();
    // TODO: add default Describe() method
}

class Circle : IShape {
    double _r;
    public Circle(double r) => _r = r;
    public double Area() => Math.PI * _r * _r;
}

class Program {
    static void Main() {
        IShape s = new Circle(5);
        Console.WriteLine(s.Describe());
    }
}`,
    expectedOutput: ["Area=78.54"],
    hint: "default string Describe() => $\"Area={Area():F2}\";",
  },
  {
    title: "Generic Stack",
    instruction:
      "Complete the `Stack<T>` class with `Push` and `Pop`. Push `1`, `2`, `3`; pop and print the result (should be `3` — LIFO order).",
    starter: `using System;
using System.Collections.Generic;

class Stack<T> {
    private readonly List<T> _items = new();
    public void Push(T item) => _items.Add(item);
    public T Pop() {
        // TODO: get last item, remove it, return it
        throw new NotImplementedException();
    }
    public int Count => _items.Count;
}

class Program {
    static void Main() {
        var stack = new Stack<int>();
        stack.Push(1); stack.Push(2); stack.Push(3);
        Console.WriteLine(stack.Pop());
    }
}`,
    expectedOutput: ["3"],
    hint: "var last = _items[^1]; _items.RemoveAt(_items.Count - 1); return last;",
  },
  {
    title: "Generic Constraint",
    instruction:
      "Write a generic method `static T Max<T>(T a, T b) where T : IComparable<T>` that returns the larger of two values. Print `Max(3, 7)` (should be `7`).",
    starter: `using System;

class Program {
    // TODO: write generic Max<T> with IComparable<T> constraint

    static void Main() {
        Console.WriteLine(Max(3, 7));
    }
}`,
    expectedOutput: ["7"],
    hint: "static T Max<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) >= 0 ? a : b;",
  },
  {
    title: "Multiple Interfaces",
    instruction:
      "Define `interface IPrintable { void Print(); }`. Make `Rectangle` implement both `IShape` and `IPrintable`, where `Print()` outputs `\"Rectangle: {Width}x{Height}\"`. Create a `3x4` rectangle and call `Print()`.",
    starter: `using System;

interface IShape { double Area(); }
interface IPrintable { void Print(); }

class Rectangle : IShape, IPrintable {
    public double Width { get; }
    public double Height { get; }
    public Rectangle(double w, double h) { Width = w; Height = h; }
    public double Area() => Width * Height;
    // TODO: implement Print()
}

class Program {
    static void Main() {
        var r = new Rectangle(3, 4);
        r.Print();
    }
}`,
    expectedOutput: ["Rectangle: 3x4"],
    hint: "public void Print() => Console.WriteLine($\"Rectangle: {Width}x{Height}\");",
  },
];
