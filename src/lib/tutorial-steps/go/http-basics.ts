import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "HTTP Handler Functions",
    instruction:
      "An HTTP handler is a function with signature `func(w http.ResponseWriter, r *http.Request)`. `httptest.NewRecorder()` captures what the handler writes so you can inspect it without starting a real server. Complete `helloHandler` to write `Hello, Go!` to the response.",
    starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: write "Hello, Go!" to w using fmt.Fprint
}

func main() {
	req, _ := http.NewRequest("GET", "/", nil)
	rec := httptest.NewRecorder()

	helloHandler(rec, req)

	fmt.Println("Status:", rec.Code)
	fmt.Println("Body:", rec.Body.String())
}`,
    expectedOutput: ["Status: 200", "Hello, Go!"],
    hint: "Use `fmt.Fprint(w, \"Hello, Go!\")` inside helloHandler.",
  },
  {
    title: "Parsing URLs",
    instruction:
      "`url.Parse` breaks a URL into scheme, host, path and query. Parse `https://api.example.com/v1/search?q=golang&page=2` and print the scheme, host, path, and the value of the `q` query parameter.",
    starter: `package main

import (
	"fmt"
	"net/url"
)

func main() {
	raw := "https://api.example.com/v1/search?q=golang&page=2"

	// TODO: parse the URL using url.Parse
	u, err := url.Parse("")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// TODO: print scheme, host, path, and the "q" query parameter
	fmt.Println("Scheme:", u.Scheme)
	fmt.Println("Host:", u.Host)
	fmt.Println("Path:", u.Path)
	fmt.Println("q:", u.Query().Get("q"))
}`,
    expectedOutput: ["Scheme: https", "api.example.com", "/v1/search", "q: golang"],
    hint: "Pass `raw` to url.Parse instead of an empty string.",
  },
  {
    title: "Reading Query Parameters",
    instruction:
      "Inside a handler, `r.URL.Query().Get(\"key\")` reads a query parameter. Write a `greetHandler` that reads the `name` param and writes `Hello, {name}!`. Default to `World` if `name` is empty. Test with `?name=Gopher`.",
    starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func greetHandler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	// TODO: if name is empty, set it to "World"

	// TODO: write "Hello, {name}!" to w
}

func main() {
	req, _ := http.NewRequest("GET", "/greet?name=Gopher", nil)
	rec := httptest.NewRecorder()
	greetHandler(rec, req)
	fmt.Println(rec.Body.String())

	req2, _ := http.NewRequest("GET", "/greet", nil)
	rec2 := httptest.NewRecorder()
	greetHandler(rec2, req2)
	fmt.Println(rec2.Body.String())
}`,
    expectedOutput: ["Hello, Gopher!", "Hello, World!"],
    hint: "Use `if name == \"\" { name = \"World\" }`, then `fmt.Fprintf(w, \"Hello, %s!\", name)`.",
  },
  {
    title: "HTTP Status Codes",
    instruction:
      "`net/http` exports constants like `http.StatusOK` (200), `http.StatusNotFound` (404), `http.StatusBadRequest` (400). Call `w.WriteHeader(code)` before writing the body. Write a handler that returns 404 when `id=missing`, else 200.",
    starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func resourceHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	// TODO: if id == "missing", WriteHeader(404) and write "not found"
	// Otherwise WriteHeader(200) and write "found: " + id
	_ = id
}

func test(id string) {
	req, _ := http.NewRequest("GET", "/?id="+id, nil)
	rec := httptest.NewRecorder()
	resourceHandler(rec, req)
	fmt.Printf("id=%q status=%d body=%q\\n", id, rec.Code, rec.Body.String())
}

func main() {
	test("missing")
	test("42")
}`,
    expectedOutput: ["status=404", "status=200", "not found", "found: 42"],
    hint: "Use a simple if/else: `if id == \"missing\" { w.WriteHeader(http.StatusNotFound); fmt.Fprint(w, \"not found\") } else { ... }`",
  },
  {
    title: "Building Query Strings",
    instruction:
      "`url.Values` builds query strings safely — it handles URL-encoding for special characters. Create a `url.Values`, set `q` to `hello world` and `page` to `1`, then call `.Encode()` and print the result. Also add two `tag` values.",
    starter: `package main

import (
	"fmt"
	"net/url"
)

func main() {
	// TODO: create url.Values, set q="hello world", page="1"
	// add tag="go" and tag="web", then print the encoded string
	v := url.Values{}

	fmt.Println(v.Encode())
}`,
    expectedOutput: ["hello+world", "page=1", "tag=go"],
    hint: "Use `v.Set(\"q\", \"hello world\")`, `v.Set(\"page\", \"1\")`, `v.Add(\"tag\", \"go\")`, `v.Add(\"tag\", \"web\")`, then `v.Encode()`.",
  },
];
