import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Array Basics",
    instruction:
      "Declare `int[] nums = { 10, 20, 30 }` and print each element using a `for` loop with its index.",
    starter: `using System;

class Program {
    static void Main() {
        int[] nums = { 10, 20, 30 };
        // TODO: print each element using for loop
    }
}`,
    expectedOutput: ["10", "20", "30"],
    hint: "for (int i = 0; i < nums.Length; i++) { Console.WriteLine(nums[i]); }",
  },
  {
    title: "List<T>",
    instruction:
      "Create a `List<string>` called `fruits` containing `\"apple\"` and `\"banana\"`. Add `\"cherry\"` with `.Add()`. Print each item with `foreach`.",
    starter: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        var fruits = new List<string> { "apple", "banana" };
        // TODO: add "cherry", then print each with foreach
    }
}`,
    expectedOutput: ["apple", "banana", "cherry"],
    hint: "fruits.Add(\"cherry\"); foreach (var f in fruits) Console.WriteLine(f);",
  },
  {
    title: "Array Sort",
    instruction:
      "Declare `int[] nums = { 5, 2, 8, 1, 9 }`. Sort it with `Array.Sort()` and print each element on its own line.",
    starter: `using System;

class Program {
    static void Main() {
        int[] nums = { 5, 2, 8, 1, 9 };
        // TODO: sort and print each element
    }
}`,
    expectedOutput: ["1", "2", "5", "8", "9"],
    hint: "Array.Sort(nums); foreach (var n in nums) Console.WriteLine(n);",
  },
  {
    title: "List Count and Contains",
    instruction:
      "Create a list with integers `1, 2, 3, 4, 5`. Print the count, then print `\"Has 3\"` if the list contains `3`.",
    starter: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        var nums = new List<int> { 1, 2, 3, 4, 5 };
        // TODO: print count, then "Has 3" if Contains(3)
    }
}`,
    expectedOutput: ["5", "Has 3"],
    hint: "Console.WriteLine(nums.Count); if (nums.Contains(3)) Console.WriteLine(\"Has 3\");",
  },
  {
    title: "Multi-dimensional Array",
    instruction:
      "Create a `3×3` multiplication table using a 2D array `int[3,3]`. Fill each cell with `(row+1)*(col+1)` and print the diagonal values: `grid[0,0]`, `grid[1,1]`, `grid[2,2]`.",
    starter: `using System;

class Program {
    static void Main() {
        int[,] grid = new int[3, 3];
        // TODO: fill grid[row,col] = (row+1)*(col+1), print diagonal
    }
}`,
    expectedOutput: ["1", "4", "9"],
    hint: "grid[0,0]=1, grid[1,1]=4, grid[2,2]=9. Use nested loops to fill, then print diagonal.",
  },
];
