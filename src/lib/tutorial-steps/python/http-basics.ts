import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "urllib.request GET",
    instruction:
      "Python's standard library includes `urllib.request` for HTTP. Use `urllib.request.urlopen` to open `\"https://httpbin.org/get\"` and read the response. Print the HTTP status code.",
    starter: `import urllib.request

# TODO: open "https://httpbin.org/get", print the status code
`,
    expectedOutput: ["200"],
    hint: "with urllib.request.urlopen(\"https://httpbin.org/get\") as r:\n    print(r.status)",
  },
  {
    title: "Parse JSON Response",
    instruction:
      "HTTP APIs usually return JSON. Read the body of a GET to `\"https://httpbin.org/json\"` as bytes, decode it, parse it with `json.loads`, and print the value of `slideshow.title`.",
    starter: `import urllib.request
import json

with urllib.request.urlopen("https://httpbin.org/json") as r:
    body = r.read().decode()

data = json.loads(body)
# TODO: print data["slideshow"]["title"]
`,
    expectedOutput: ["Sample Slide Show"],
    hint: "print(data[\"slideshow\"][\"title\"])",
  },
  {
    title: "POST with urllib",
    instruction:
      "To send a POST request, encode data as bytes and pass it to `urlopen`. POST `{\"name\": \"Alice\"}` as JSON to `\"https://httpbin.org/post\"` and print the status code.",
    starter: `import urllib.request
import json

url = "https://httpbin.org/post"
payload = json.dumps({"name": "Alice"}).encode()
req = urllib.request.Request(url, data=payload, method="POST")
req.add_header("Content-Type", "application/json")

# TODO: open req, print status
`,
    expectedOutput: ["200"],
    hint: "with urllib.request.urlopen(req) as r:\n    print(r.status)",
  },
  {
    title: "Build a Simple HTTP Server",
    instruction:
      "Python can serve HTTP with just the standard library. Write code that creates an `HTTPServer` on port 8080 with a handler that responds `\"Hello from Python\"`. Print `\"Server ready\"` after binding (do NOT actually serve requests).",
    starter: `from http.server import HTTPServer, BaseHTTPRequestHandler

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Hello from Python")

    def log_message(self, *args):
        pass  # suppress output

server = HTTPServer(("localhost", 8080), Handler)
# TODO: print "Server ready" — don't call server.serve_forever()
`,
    expectedOutput: ["Server ready"],
    hint: "print(\"Server ready\")",
  },
];
