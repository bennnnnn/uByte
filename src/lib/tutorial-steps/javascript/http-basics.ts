import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "fetch GET",
    instruction:
      "`fetch` is the modern browser/Node API for HTTP. Make a GET request to `\"https://httpbin.org/get\"` and log the response status.",
    starter: `async function main() {
  const res = await fetch("https://httpbin.org/get");
  // TODO: console.log(res.status)
}

main();`,
    expectedOutput: ["200"],
    hint: "console.log(res.status);",
  },
  {
    title: "Parse JSON Response",
    instruction:
      "Call `res.json()` to parse the response body. Fetch `\"https://httpbin.org/json\"`, parse the body, and log `data.slideshow.title`.",
    starter: `async function main() {
  const res = await fetch("https://httpbin.org/json");
  const data = await res.json();
  // TODO: log data.slideshow.title
}

main();`,
    expectedOutput: ["Sample Slide Show"],
    hint: "console.log(data.slideshow.title);",
  },
  {
    title: "POST with fetch",
    instruction:
      "Send JSON data with a POST request by setting `method`, `headers`, and `body`. POST `{name: \"Alice\"}` to `\"https://httpbin.org/post\"` and log the status.",
    starter: `async function main() {
  const res = await fetch("https://httpbin.org/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Alice" }),
  });
  // TODO: log res.status
}

main();`,
    expectedOutput: ["200"],
    hint: "console.log(res.status);",
  },
  {
    title: "Error Handling with fetch",
    instruction:
      "`fetch` doesn't throw for HTTP error codes — you must check `res.ok`. Fetch a URL that returns 404. If `!res.ok`, throw `new Error(res.status)`. Catch and log `\"Error: 404\"`.",
    starter: `async function main() {
  const res = await fetch("https://httpbin.org/status/404");
  if (!res.ok) {
    // TODO: throw new Error(res.status)
  }
}

main().catch(e => console.log("Error: " + e.message));`,
    expectedOutput: ["Error: 404"],
    hint: "throw new Error(res.status);",
  },
  {
    title: "AbortController",
    instruction:
      "`AbortController` cancels a fetch. Create a controller and signal, pass the signal to `fetch`, then immediately abort. Catch the `AbortError` and log `\"Aborted\"`.",
    starter: `async function main() {
  const controller = new AbortController();
  const { signal } = controller;

  const fetchPromise = fetch("https://httpbin.org/delay/5", { signal });
  controller.abort();

  try {
    await fetchPromise;
  } catch (e) {
    if (e.name === "AbortError") {
      // TODO: log "Aborted"
    }
  }
}

main();`,
    expectedOutput: ["Aborted"],
    hint: "console.log(\"Aborted\");",
  },
];
