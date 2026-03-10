import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Serialize to JSON",
    instruction:
      "Create an anonymous object `{ Name = \"Alice\", Age = 30 }` and serialize it to JSON with `JsonSerializer.Serialize`. Print the result.",
    starter: `using System;
using System.Text.Json;

class Program {
    static void Main() {
        var user = new { Name = "Alice", Age = 30 };
        // TODO: serialize and print
    }
}`,
    expectedOutput: ["{\"Name\":\"Alice\",\"Age\":30}"],
    hint: "Console.WriteLine(JsonSerializer.Serialize(user));",
  },
  {
    title: "Deserialize from JSON",
    instruction:
      "Define `record User(string Name, int Age)`. Deserialize `{\"Name\":\"Bob\",\"Age\":25}` and print the `Name`.",
    starter: `using System;
using System.Text.Json;

record User(string Name, int Age);

class Program {
    static void Main() {
        string json = "{\"Name\":\"Bob\",\"Age\":25}";
        // TODO: deserialize and print Name
    }
}`,
    expectedOutput: ["Bob"],
    hint: "var user = JsonSerializer.Deserialize<User>(json); Console.WriteLine(user?.Name);",
  },
  {
    title: "Case-Insensitive Options",
    instruction:
      "Deserialize `{\"name\":\"Carol\",\"age\":22}` (lowercase keys) into a `User` record using `PropertyNameCaseInsensitive = true`. Print the name.",
    starter: `using System;
using System.Text.Json;

record User(string Name, int Age);

class Program {
    static void Main() {
        string json = "{\"name\":\"Carol\",\"age\":22}";
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        // TODO: deserialize with options, print Name
    }
}`,
    expectedOutput: ["Carol"],
    hint: "var user = JsonSerializer.Deserialize<User>(json, options); Console.WriteLine(user?.Name);",
  },
  {
    title: "JsonPropertyName Attribute",
    instruction:
      "Define a class `Product` where the JSON key is `\"product_name\"` but the C# property is `Name`. Deserialize `{\"product_name\":\"Book\"}` and print `Name`.",
    starter: `using System;
using System.Text.Json;
using System.Text.Json.Serialization;

class Product {
    [JsonPropertyName("product_name")]
    public string Name { get; set; } = "";
}

class Program {
    static void Main() {
        string json = "{\"product_name\":\"Book\"}";
        // TODO: deserialize and print Name
    }
}`,
    expectedOutput: ["Book"],
    hint: "var p = JsonSerializer.Deserialize<Product>(json); Console.WriteLine(p?.Name);",
  },
  {
    title: "Pretty Print",
    instruction:
      "Serialize `{ Title = \"Hello\", Views = 100 }` with `WriteIndented = true` and print just the first line of the output (which should be `{`).",
    starter: `using System;
using System.Text.Json;

class Program {
    static void Main() {
        var data = new { Title = "Hello", Views = 100 };
        var options = new JsonSerializerOptions { WriteIndented = true };
        string json = JsonSerializer.Serialize(data, options);
        // TODO: print only the first line
    }
}`,
    expectedOutput: ["{"],
    hint: "Console.WriteLine(json.Split('\\n')[0].Trim());",
  },
];
