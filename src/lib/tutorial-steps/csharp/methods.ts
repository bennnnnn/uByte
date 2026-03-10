import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Extension Method",
    instruction:
      "Write a `static` extension method `IsPalindrome(this string s)` in a static class. Call `\"racecar\".IsPalindrome()` and print the result (`True`).",
    starter: `using System;
using System.Linq;

public static class StringExtensions {
    // TODO: add IsPalindrome extension method
}

class Program {
    static void Main() {
        Console.WriteLine("racecar".IsPalindrome());
    }
}`,
    expectedOutput: ["True"],
    hint: "public static bool IsPalindrome(this string s) { var rev = new string(s.Reverse().ToArray()); return s == rev; }",
  },
  {
    title: "LINQ Where and Select",
    instruction:
      "Given `int[] nums = { 1, 2, 3, 4, 5, 6 }`, use LINQ to filter evens and square each. Print them: `4`, `16`, `36`.",
    starter: `using System;
using System.Linq;

class Program {
    static void Main() {
        int[] nums = { 1, 2, 3, 4, 5, 6 };
        // TODO: Where even, Select square, print each
    }
}`,
    expectedOutput: ["4", "16", "36"],
    hint: "foreach (var n in nums.Where(x => x % 2 == 0).Select(x => x * x)) Console.WriteLine(n);",
  },
  {
    title: "LINQ Aggregates",
    instruction:
      "Given `int[] nums = { 1, 2, 3, 4, 5 }`, print the `Sum()`, `Min()`, and `Max()` each on its own line.",
    starter: `using System;
using System.Linq;

class Program {
    static void Main() {
        int[] nums = { 1, 2, 3, 4, 5 };
        // TODO: print Sum, Min, Max
    }
}`,
    expectedOutput: ["15", "1", "5"],
    hint: "Console.WriteLine(nums.Sum()); Console.WriteLine(nums.Min()); Console.WriteLine(nums.Max());",
  },
  {
    title: "LINQ OrderBy and Take",
    instruction:
      "Given `int[] nums = { 5, 2, 8, 1, 9, 3 }`, get the top 3 values in descending order and print each on its own line.",
    starter: `using System;
using System.Linq;

class Program {
    static void Main() {
        int[] nums = { 5, 2, 8, 1, 9, 3 };
        // TODO: OrderByDescending, Take(3), print each
    }
}`,
    expectedOutput: ["9", "8", "5"],
    hint: "foreach (var n in nums.OrderByDescending(x => x).Take(3)) Console.WriteLine(n);",
  },
  {
    title: "Operator Overloading",
    instruction:
      "Complete the `Vector2 + operator` so that `new Vector2(1,2) + new Vector2(3,4)` prints `\"(4, 6)\"`.",
    starter: `using System;

struct Vector2 {
    public double X, Y;
    public Vector2(double x, double y) { X = x; Y = y; }
    // TODO: overload operator +
    public override string ToString() => $"({X}, {Y})";
}

class Program {
    static void Main() {
        Console.WriteLine(new Vector2(1, 2) + new Vector2(3, 4));
    }
}`,
    expectedOutput: ["(4, 6)"],
    hint: "public static Vector2 operator +(Vector2 a, Vector2 b) => new(a.X + b.X, a.Y + b.Y);",
  },
];
