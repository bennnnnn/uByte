import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "HttpClient GET",
    instruction:
      "Create an HttpClient and an HttpRequest for GET https://example.com. Send the request and print the status code (200). Use HttpResponse.BodyHandlers.ofString() for the body handler.",
    starter: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Main {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://example.com"))
            .GET()
            .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        // TODO: print response.statusCode()
    }
}`,
    expectedOutput: ["200"],
    hint: "System.out.println(response.statusCode());",
  },
];
