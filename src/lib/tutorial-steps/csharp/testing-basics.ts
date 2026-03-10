import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Manual Test Function",
    instruction:
      "Write a `static int Add(int a, int b)` method and a test method `TestAdd()` that throws an exception if `Add(2, 3) != 5`, otherwise prints `\"Add: PASS\"`.",
    starter: `using System;

class Program {
    static int Add(int a, int b) => a + b;

    static void TestAdd() {
        // TODO: assert Add(2,3)==5, print "Add: PASS" if correct
    }

    static void Main() {
        TestAdd();
    }
}`,
    expectedOutput: ["Add: PASS"],
    hint: "if (Add(2,3) != 5) throw new Exception(\"FAIL\"); Console.WriteLine(\"Add: PASS\");",
  },
  {
    title: "Multiple Assertions",
    instruction:
      "Write a `static string Greet(string name)` that returns `\"Hello, {name}!\"`. Write two test assertions: one for `\"Alice\"` and one for `\"World\"`. Print `\"All tests passed\"` at the end.",
    starter: `using System;

class Program {
    static string Greet(string name) => $"Hello, {name}!";

    static void Main() {
        // TODO: assert both greetings, then print "All tests passed"
    }
}`,
    expectedOutput: ["All tests passed"],
    hint: "if (Greet(\"Alice\") != \"Hello, Alice!\") throw new Exception(); if (Greet(\"World\") != \"Hello, World!\") throw new Exception(); Console.WriteLine(\"All tests passed\");",
  },
  {
    title: "Test-Driven: FizzBuzz",
    instruction:
      "Implement `static string FizzBuzz(int n)` so that: multiples of 3 return `\"Fizz\"`, multiples of 5 return `\"Buzz\"`, multiples of both return `\"FizzBuzz\"`, otherwise return the number as a string. The test in `Main` already verifies it.",
    starter: `using System;

class Program {
    static string FizzBuzz(int n) {
        // TODO: implement FizzBuzz
        throw new NotImplementedException();
    }

    static void Main() {
        if (FizzBuzz(3)  != "Fizz")     throw new Exception("3 failed");
        if (FizzBuzz(5)  != "Buzz")     throw new Exception("5 failed");
        if (FizzBuzz(15) != "FizzBuzz") throw new Exception("15 failed");
        if (FizzBuzz(7)  != "7")        throw new Exception("7 failed");
        Console.WriteLine("FizzBuzz: PASS");
    }
}`,
    expectedOutput: ["FizzBuzz: PASS"],
    hint: "if (n%15==0) return \"FizzBuzz\"; if (n%3==0) return \"Fizz\"; if (n%5==0) return \"Buzz\"; return n.ToString();",
  },
  {
    title: "Edge-Case Testing",
    instruction:
      "Implement `static int SafeDivide(int a, int b)` that returns `0` when `b == 0` instead of throwing. Verify `SafeDivide(10, 2) == 5` and `SafeDivide(10, 0) == 0`. Print `\"SafeDivide: PASS\"`.",
    starter: `using System;

class Program {
    static int SafeDivide(int a, int b) {
        // TODO: return 0 when b==0, else return a/b
        throw new NotImplementedException();
    }

    static void Main() {
        if (SafeDivide(10, 2) != 5) throw new Exception("10/2 failed");
        if (SafeDivide(10, 0) != 0) throw new Exception("10/0 failed");
        Console.WriteLine("SafeDivide: PASS");
    }
}`,
    expectedOutput: ["SafeDivide: PASS"],
    hint: "if (b == 0) return 0; return a / b;",
  },
  {
    title: "Testing a Collection Method",
    instruction:
      "Implement `static int Sum(int[] arr)` that sums all elements. Tests: `Sum(new[]{1,2,3}) == 6` and `Sum(new int[]{}) == 0`. Print `\"Sum: PASS\"` if both pass.",
    starter: `using System;

class Program {
    static int Sum(int[] arr) {
        // TODO: sum all elements (empty array = 0)
        throw new NotImplementedException();
    }

    static void Main() {
        if (Sum(new[] { 1, 2, 3 }) != 6) throw new Exception("Sum failed");
        if (Sum(new int[] {})      != 0) throw new Exception("Empty failed");
        Console.WriteLine("Sum: PASS");
    }
}`,
    expectedOutput: ["Sum: PASS"],
    hint: "int total = 0; foreach (var n in arr) total += n; return total;",
  },
];
