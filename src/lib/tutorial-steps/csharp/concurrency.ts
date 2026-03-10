import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "async / await Basics",
    instruction:
      "Write an `async Task<string>` method `GetMessageAsync()` that awaits `Task.Delay(0)` and returns `\"Hello async!\"`. Await it in `Main` and print the result.",
    starter: `using System;
using System.Threading.Tasks;

class Program {
    static async Task<string> GetMessageAsync() {
        // TODO: await Task.Delay(0), return "Hello async!"
        throw new NotImplementedException();
    }

    static async Task Main() {
        string msg = await GetMessageAsync();
        Console.WriteLine(msg);
    }
}`,
    expectedOutput: ["Hello async!"],
    hint: "await Task.Delay(0); return \"Hello async!\";",
  },
  {
    title: "Task.Run",
    instruction:
      "Use `Task.Run` to compute `6 * 7` on a background thread, await the result, and print it.",
    starter: `using System;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        // TODO: Task.Run to compute 6*7, await, print
    }
}`,
    expectedOutput: ["42"],
    hint: "int result = await Task.Run(() => 6 * 7); Console.WriteLine(result);",
  },
  {
    title: "Task.WhenAll",
    instruction:
      "Create two tasks that each return a string (`\"A\"` and `\"B\"`). Use `Task.WhenAll` to run them in parallel and print the count of results (should be `2`).",
    starter: `using System;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        var t1 = Task.Run(() => "A");
        var t2 = Task.Run(() => "B");
        // TODO: await Task.WhenAll, print results.Length
    }
}`,
    expectedOutput: ["2"],
    hint: "var results = await Task.WhenAll(t1, t2); Console.WriteLine(results.Length);",
  },
  {
    title: "Task.Delay (Non-blocking Sleep)",
    instruction:
      "Print `\"Start\"`, await `Task.Delay(0)` (instant in tests), then print `\"End\"`. Both lines should appear.",
    starter: `using System;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        Console.WriteLine("Start");
        // TODO: await Task.Delay(0)
        Console.WriteLine("End");
    }
}`,
    expectedOutput: ["Start", "End"],
    hint: "await Task.Delay(0);",
  },
  {
    title: "Returning Multiple Tasks",
    instruction:
      "Create a method `async Task<int> SquareAsync(int n)` that awaits `Task.Delay(0)` and returns `n * n`. Await calls for `3` and `4` and print their results on separate lines.",
    starter: `using System;
using System.Threading.Tasks;

class Program {
    static async Task<int> SquareAsync(int n) {
        // TODO: await Task.Delay(0), return n*n
        throw new NotImplementedException();
    }

    static async Task Main() {
        // TODO: print SquareAsync(3) and SquareAsync(4)
    }
}`,
    expectedOutput: ["9", "16"],
    hint: "await Task.Delay(0); return n*n; ... Console.WriteLine(await SquareAsync(3)); Console.WriteLine(await SquareAsync(4));",
  },
];
