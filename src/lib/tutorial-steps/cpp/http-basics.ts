import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "HTTP Concepts",
    instruction:
      "C++ doesn't include HTTP in the standard library — you'd typically use libcurl or Boost.Beast. Here we'll simulate the concepts. Write a function `buildRequest(std::string method, std::string path)` that returns `method + \" \" + path + \" HTTP/1.1\"`. Print it for `GET /hello`.",
    starter: `#include <iostream>
#include <string>

// TODO: std::string buildRequest(std::string method, std::string path)

int main() {
    std::cout << buildRequest("GET", "/hello") << std::endl;
    return 0;
}`,
    expectedOutput: ["GET /hello HTTP/1.1"],
    hint: "std::string buildRequest(std::string method, std::string path) { return method + \" \" + path + \" HTTP/1.1\"; }",
  },
  {
    title: "HTTP Status Codes",
    instruction:
      "Write a function `statusText(int code)` that returns `\"200 OK\"`, `\"404 Not Found\"`, or `\"500 Internal Server Error\"`. Print each for codes 200, 404, and 500.",
    starter: `#include <iostream>
#include <string>

// TODO: std::string statusText(int code)

int main() {
    std::cout << statusText(200) << std::endl;
    std::cout << statusText(404) << std::endl;
    std::cout << statusText(500) << std::endl;
    return 0;
}`,
    expectedOutput: ["200 OK", "404 Not Found", "500 Internal Server Error"],
    hint: "if (code==200) return \"200 OK\"; if (code==404) return \"404 Not Found\"; return \"500 Internal Server Error\";",
  },
  {
    title: "Parse a URL",
    instruction:
      "Write `parseHost(std::string url)` that extracts the host from a URL like `\"https://example.com/path\"`. Find the `://` separator and the first `/` after it, then return the substring between them.",
    starter: `#include <iostream>
#include <string>

// TODO: std::string parseHost(std::string url)

int main() {
    std::cout << parseHost("https://example.com/path") << std::endl;
    return 0;
}`,
    expectedOutput: ["example.com"],
    hint: "size_t start = url.find(\"://\") + 3;\nsize_t end = url.find('/', start);\nreturn url.substr(start, end - start);",
  },
  {
    title: "Build HTTP Headers",
    instruction:
      "Build a simple `std::map<std::string,std::string>` of HTTP headers with `Content-Type: application/json` and `Accept: application/json`. Iterate and print each as `\"Key: Value\"`.",
    starter: `#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, std::string> headers;
    // TODO: insert Content-Type and Accept headers
    for (const auto& [k, v] : headers) {
        std::cout << k << ": " << v << std::endl;
    }
    return 0;
}`,
    expectedOutput: ["Accept: application/json", "Content-Type: application/json"],
    hint: "headers[\"Content-Type\"] = \"application/json\";\nheaders[\"Accept\"] = \"application/json\";",
  },
];
