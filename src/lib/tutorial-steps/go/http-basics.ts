import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "HTTP Handler Functions",
    instruction:
      "An HTTP handler is a function with signature `func(w http.ResponseWriter, r *http.Request)`. `httptest.NewRecorder()` captures what the handler writes so you can inspect it without starting a real server. Complete `welcomeHandler` to write `Welcome to the Library!` to the response.",
    starter: `package main

import (
\t"fmt"
\t"net/http"
\t"net/http/httptest"
)

func welcomeHandler(w http.ResponseWriter, r *http.Request) {
\t// TODO: write "Welcome to the Library!" to w using fmt.Fprint
}

func main() {
\treq, _ := http.NewRequest("GET", "/", nil)
\trec := httptest.NewRecorder()

\twelcomeHandler(rec, req)

\tfmt.Println("Status:", rec.Code)
\tfmt.Println("Body:", rec.Body.String())
}`,
    expectedOutput: ["Status: 200", "Welcome to the Library!"],
    hint: "Use `fmt.Fprint(w, \"Welcome to the Library!\")` inside welcomeHandler.",
  },
  {
    title: "Parsing URLs",
    instruction:
      "`url.Parse` breaks a URL into scheme, host, path and query. Parse `https://library.example.com/v1/books?author=asimov&genre=sci-fi` and print the scheme, host, path, and the value of the `author` query parameter.",
    starter: `package main

import (
\t"fmt"
\t"net/url"
)

func main() {
\traw := "https://library.example.com/v1/books?author=asimov&genre=sci-fi"

\t// TODO: parse the URL using url.Parse
\tu, err := url.Parse("")
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t\treturn
\t}

\t// TODO: print scheme, host, path, and the "author" query parameter
\tfmt.Println("Scheme:", u.Scheme)
\tfmt.Println("Host:", u.Host)
\tfmt.Println("Path:", u.Path)
\tfmt.Println("author:", u.Query().Get("author"))
}`,
    expectedOutput: ["Scheme: https", "library.example.com", "/v1/books", "author: asimov"],
    hint: "Pass `raw` to url.Parse instead of an empty string.",
  },
  {
    title: "Reading Query Parameters",
    instruction:
      "Inside a handler, `r.URL.Query().Get(\"key\")` reads a query parameter. Write a `searchHandler` that reads the `title` param and writes `Searching for: {title}`. Default to `all books` if `title` is empty. Test with `?title=Dune`.",
    starter: `package main

import (
\t"fmt"
\t"net/http"
\t"net/http/httptest"
)

func searchHandler(w http.ResponseWriter, r *http.Request) {
\ttitle := r.URL.Query().Get("title")
\t// TODO: if title is empty, set it to "all books"

\t// TODO: write "Searching for: {title}" to w
}

func main() {
\treq, _ := http.NewRequest("GET", "/search?title=Dune", nil)
\trec := httptest.NewRecorder()
\tsearchHandler(rec, req)
\tfmt.Println(rec.Body.String())

\treq2, _ := http.NewRequest("GET", "/search", nil)
\trec2 := httptest.NewRecorder()
\tsearchHandler(rec2, req2)
\tfmt.Println(rec2.Body.String())
}`,
    expectedOutput: ["Searching for: Dune", "Searching for: all books"],
    hint: "Use `if title == \"\" { title = \"all books\" }`, then `fmt.Fprintf(w, \"Searching for: %s\", title)`.",
  },
  {
    title: "HTTP Status Codes",
    instruction:
      "`net/http` exports constants like `http.StatusOK` (200), `http.StatusNotFound` (404), `http.StatusBadRequest` (400). Call `w.WriteHeader(code)` before writing the body. Write a `findBookHandler` that returns 404 when `isbn=missing`, else 200.",
    starter: `package main

import (
\t"fmt"
\t"net/http"
\t"net/http/httptest"
)

func findBookHandler(w http.ResponseWriter, r *http.Request) {
\tisbn := r.URL.Query().Get("isbn")
\t// TODO: if isbn == "missing", WriteHeader(404) and write "book not found"
\t// Otherwise WriteHeader(200) and write "found book: " + isbn
\t_ = isbn
}

func test(isbn string) {
\treq, _ := http.NewRequest("GET", "/?isbn="+isbn, nil)
\trec := httptest.NewRecorder()
\tfindBookHandler(rec, req)
\tfmt.Printf("isbn=%q status=%d body=%q\\n", isbn, rec.Code, rec.Body.String())
}

func main() {
\ttest("missing")
\ttest("978-0451524935")
}`,
    expectedOutput: ["status=404", "status=200", "book not found", "found book: 978-0451524935"],
    hint: "Use a simple if/else: `if isbn == \"missing\" { w.WriteHeader(http.StatusNotFound); fmt.Fprint(w, \"book not found\") } else { ... }`",
  },
  {
    title: "Building Query Strings",
    instruction:
      "`url.Values` builds query strings safely — it handles URL-encoding for special characters. Create a `url.Values`, set `q` to `sci-fi classics` and `page` to `1`, then call `.Encode()` and print the result. Also add two `genre` values.",
    starter: `package main

import (
\t"fmt"
\t"net/url"
)

func main() {
\t// TODO: create url.Values, set q="sci-fi classics", page="1"
\t// add genre="fiction" and genre="science", then print the encoded string
\tv := url.Values{}

\tfmt.Println(v.Encode())
}`,
    expectedOutput: ["sci-fi+classics", "page=1", "genre=fiction"],
    hint: "Use `v.Set(\"q\", \"sci-fi classics\")`, `v.Set(\"page\", \"1\")`, `v.Add(\"genre\", \"fiction\")`, `v.Add(\"genre\", \"science\")`, then `v.Encode()`.",
  },
];
