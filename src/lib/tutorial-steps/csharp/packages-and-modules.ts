import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Namespaces",
    instruction:
      "A class is in namespace `MyApp.Models`. Use a `using` directive to bring it into scope and print `user.Name` where `Name = \"Alice\"`.",
    starter: `using System;

namespace MyApp.Models {
    public class User {
        public string Name { get; set; } = "";
    }
}

// TODO: add using MyApp.Models;
// then create User { Name = "Alice" } and print user.Name

class Program {
    static void Main() {
        // your code here
    }
}`,
    expectedOutput: ["Alice"],
    hint: "using MyApp.Models; ... var user = new User { Name = \"Alice\" }; Console.WriteLine(user.Name);",
  },
  {
    title: "static using",
    instruction:
      "Use `using static System.Math` to import `Math` methods statically, then call `Sqrt(16)` without the `Math.` prefix and print the result.",
    starter: `using System;
// TODO: add using static System.Math

class Program {
    static void Main() {
        // TODO: call Sqrt(16) and print result
    }
}`,
    expectedOutput: ["4"],
    hint: "using static System.Math; ... Console.WriteLine(Sqrt(16));",
  },
  {
    title: "using Alias",
    instruction:
      "Create an alias `using Env = System.Environment`. Use `Env.NewLine` ... actually, use `using Now = System.DateTime` and print `Now.Now.Year > 2000` as `True`.",
    starter: `using System;
using Now = System.DateTime;

class Program {
    static void Main() {
        // TODO: print whether Now.Now.Year > 2000
    }
}`,
    expectedOutput: ["True"],
    hint: "Console.WriteLine(Now.Now.Year > 2000);",
  },
  {
    title: "Partial Class",
    instruction:
      "Two `partial class Customer` definitions combine into one. The result should print `\"Hi, Alice\"` when `Greet()` is called.",
    starter: `using System;

partial class Customer {
    public string Name { get; set; } = "";
}

partial class Customer {
    // TODO: add Greet() that prints "Hi, {Name}"
}

class Program {
    static void Main() {
        var c = new Customer { Name = "Alice" };
        c.Greet();
    }
}`,
    expectedOutput: ["Hi, Alice"],
    hint: "public void Greet() => Console.WriteLine($\"Hi, {Name}\");",
  },
  {
    title: "Nested Namespaces",
    instruction:
      "Define `namespace Company.HR` with a `Employee` class. In `Main`, create `Employee { Name = \"Bob\" }` and print the name.",
    starter: `using System;

namespace Company.HR {
    public class Employee {
        public string Name { get; set; } = "";
    }
}

class Program {
    static void Main() {
        // TODO: create Employee in Company.HR and print Name
    }
}`,
    expectedOutput: ["Bob"],
    hint: "var e = new Company.HR.Employee { Name = \"Bob\" }; Console.WriteLine(e.Name);",
  },
];
