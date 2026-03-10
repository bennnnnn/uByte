import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "HttpClient Creation",
    instruction:
      "Create an `HttpClient` with `BaseAddress = new Uri(\"https://jsonplaceholder.typicode.com\")`. Print `\"Client ready\"` after setting it up.",
    starter: `using System;
using System.Net.Http;

class Program {
    static void Main() {
        using var client = new HttpClient();
        // TODO: set BaseAddress, print "Client ready"
    }
}`,
    expectedOutput: ["Client ready"],
    hint: "client.BaseAddress = new Uri(\"https://jsonplaceholder.typicode.com\"); Console.WriteLine(\"Client ready\");",
  },
  {
    title: "Async GET Request (simulated)",
    instruction:
      "Write an async method that simulates a GET by returning a fixed JSON string. Await it and print the `title` field parsed from `{\"id\":1,\"title\":\"Hello\"}`.",
    starter: `using System;
using System.Text.Json;
using System.Threading.Tasks;

class Program {
    static async Task<string> SimulateGetAsync() {
        await Task.Delay(0);
        return "{\"id\":1,\"title\":\"Hello\"}";
    }

    static async Task Main() {
        string json = await SimulateGetAsync();
        // TODO: parse json and print the title field
    }
}`,
    expectedOutput: ["Hello"],
    hint: "var doc = JsonDocument.Parse(json); Console.WriteLine(doc.RootElement.GetProperty(\"title\").GetString());",
  },
  {
    title: "POST Request (simulated)",
    instruction:
      "Simulate a POST by serializing `{ Title = \"Test\", Body = \"Hello\" }` to JSON and printing it. Use `System.Text.Json.JsonSerializer.Serialize`.",
    starter: `using System;
using System.Text.Json;

class Program {
    record PostBody(string Title, string Body);

    static void Main() {
        var body = new PostBody("Test", "Hello");
        // TODO: serialize and print the JSON
    }
}`,
    expectedOutput: ["{\"Title\":\"Test\",\"Body\":\"Hello\"}"],
    hint: "Console.WriteLine(JsonSerializer.Serialize(body));",
  },
  {
    title: "Response Status Check",
    instruction:
      "Simulate a 404 HTTP status. Print `\"Not Found\"` if status is 404, `\"Server Error\"` if >= 500, `\"OK\"` for 200.",
    starter: `using System;
using System.Net;

class Program {
    static void HandleStatus(HttpStatusCode status) {
        // TODO: check status and print appropriate message
    }

    static void Main() {
        HandleStatus(HttpStatusCode.NotFound);  // 404
    }
}`,
    expectedOutput: ["Not Found"],
    hint: "if (status == HttpStatusCode.NotFound) Console.WriteLine(\"Not Found\"); else if ((int)status >= 500) Console.WriteLine(\"Server Error\"); else Console.WriteLine(\"OK\");",
  },
  {
    title: "Set Request Headers",
    instruction:
      "Create an `HttpClient` and set the `Authorization` header to `\"Bearer test-token\"`. Print the header value.",
    starter: `using System;
using System.Net.Http;
using System.Net.Http.Headers;

class Program {
    static void Main() {
        using var client = new HttpClient();
        // TODO: set Authorization header to "Bearer test-token"
        // print the Authorization header value
        Console.WriteLine(client.DefaultRequestHeaders.Authorization);
    }
}`,
    expectedOutput: ["Bearer test-token"],
    hint: "client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(\"Bearer\", \"test-token\");",
  },
];
