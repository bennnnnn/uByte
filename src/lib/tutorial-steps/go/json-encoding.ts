import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Encoding a Struct to JSON",
    instruction:
      "`json.Marshal(v)` converts any Go value to a JSON byte slice. Struct fields are included if they are exported (capital letter). Add `json:\"name\"` and `json:\"age\"` tags to the `Person` struct so the JSON uses lowercase keys, then marshal and print.",
    starter: `package main

import (
	"encoding/json"
	"fmt"
)

// TODO: add json tags so fields become "name" and "age" in JSON
type Person struct {
	Name string
	Age  int
}

func main() {
	p := Person{Name: "Alice", Age: 30}

	// TODO: marshal p to JSON and print it
	data, err := json.Marshal(nil)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println(string(data))
}`,
    expectedOutput: ["alice", "30"],
    hint: "Add backtick tags: `json:\"name\"` after Name and `json:\"age\"` after Age. Pass `p` (not nil) to json.Marshal.",
  },
  {
    title: "Decoding JSON into a Struct",
    instruction:
      "`json.Unmarshal(data, &v)` parses JSON bytes into a Go value. Always pass a pointer (`&v`) so the function can write into your variable. Unmarshal the provided JSON string into a `Person` and print its Name and Age.",
    starter: `package main

import (
	"encoding/json"
	"fmt"
)

type Person struct {
	Name string \`json:"name"\`
	Age  int    \`json:"age"\`
}

func main() {
	data := []byte(\`{"name":"Bob","age":25}\`)

	// TODO: declare a Person variable and unmarshal data into it
	var p Person
	err := json.Unmarshal(nil, nil)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("Name:", p.Name)
	fmt.Println("Age:", p.Age)
}`,
    expectedOutput: ["Name: Bob", "Age: 25"],
    hint: "Change `json.Unmarshal(nil, nil)` to `json.Unmarshal(data, &p)`.",
  },
  {
    title: "omitempty and Custom Tags",
    instruction:
      "The `omitempty` option skips a field when it has its zero value (empty string, 0, nil). Add it to the `Bio` field with tag `json:\"bio,omitempty\"`. Marshal two people — one with a bio and one without — and observe the difference.",
    starter: `package main

import (
	"encoding/json"
	"fmt"
)

type Person struct {
	Name string \`json:"name"\`
	Age  int    \`json:"age"\`
	// TODO: add Bio string with tag json:"bio,omitempty"
	Bio string
}

func marshal(p Person) {
	data, _ := json.Marshal(p)
	fmt.Println(string(data))
}

func main() {
	marshal(Person{Name: "Alice", Age: 30, Bio: "Go developer"})
	marshal(Person{Name: "Bob", Age: 25}) // Bio is empty — should be omitted
}`,
    expectedOutput: ["bio", "Go developer", "Bob"],
    hint: "Change `Bio string` to `Bio string \\`json:\"bio,omitempty\"\\``. When Bio is empty, the field won't appear in the second line's output.",
  },
  {
    title: "Encoding Maps and Slices",
    instruction:
      "Any Go map or slice can be marshaled to JSON directly — no struct needed. Marshal a `map[string]int` of scores and a `[]string` of tags, then print both as JSON.",
    starter: `package main

import (
	"encoding/json"
	"fmt"
)

func main() {
	scores := map[string]int{
		"Alice": 95,
		"Bob":   87,
	}

	tags := []string{"go", "programming", "beginner"}

	// TODO: marshal scores and tags separately and print each
	data1, _ := json.Marshal(nil)
	data2, _ := json.Marshal(nil)

	fmt.Println("Scores:", string(data1))
	fmt.Println("Tags:", string(data2))
}`,
    expectedOutput: ["95", "go", "Tags:", "Scores:"],
    hint: "Pass `scores` and `tags` to json.Marshal instead of nil.",
  },
  {
    title: "Pretty Printing JSON",
    instruction:
      "`json.MarshalIndent(v, prefix, indent)` adds whitespace for readability. Use `\"\"` as prefix and `\"  \"` (two spaces) as indent. Marshal a struct with nested data and print the indented result.",
    starter: `package main

import (
	"encoding/json"
	"fmt"
)

type Address struct {
	City    string \`json:"city"\`
	Country string \`json:"country"\`
}

type User struct {
	Name    string  \`json:"name"\`
	Age     int     \`json:"age"\`
	Address Address \`json:"address"\`
}

func main() {
	u := User{
		Name: "Alice",
		Age:  30,
		Address: Address{City: "Dublin", Country: "Ireland"},
	}

	// TODO: use json.MarshalIndent with prefix="" and indent="  " (2 spaces)
	data, err := json.Marshal(u)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println(string(data))
}`,
    expectedOutput: ["  \"name\"", "Dublin", "Ireland"],
    hint: "Change `json.Marshal(u)` to `json.MarshalIndent(u, \"\", \"  \")`.",
  },
];
