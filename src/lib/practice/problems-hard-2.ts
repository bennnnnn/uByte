import type { PracticeProblem } from "./types";

export const HARD_PROBLEMS_2: PracticeProblem[] = [
  // ── 1. Word Break ────────────────────────────────────────────────────────
  {
    slug: "word-break",
    title: "Word Break",
    category: "dynamic-programming",
    difficulty: "hard",
    description:
      "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.\n\nNote that the same word in the dictionary may be reused multiple times in the segmentation.\n\nHint: Bottom-up DP — `dp[i]` is `true` if the substring `s[0..i]` can be segmented. For each `i`, check all `j < i` where `dp[j]` is true and `s[j..i]` is in the dictionary.",
    examples: [
      {
        input: 's = "leetcode", wordDict = ["leet", "code"]',
        output: "true",
        explanation: '"leetcode" → "leet" + "code".',
      },
      {
        input: 's = "applepenapple", wordDict = ["apple", "pen"]',
        output: "true",
        explanation: '"applepenapple" → "apple" + "pen" + "apple". Reuse is allowed.',
      },
      {
        input: 's = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]',
        output: "false",
      },
    ],
    starter: {
      go: `package main

import "fmt"

func wordBreak(s string, wordDict []string) bool {
\t// TODO: dp[i] = true if s[:i] can be segmented
\treturn false
}

func main() {
\tfmt.Println(wordBreak("leetcode", []string{"leet", "code"}))                          // true
\tfmt.Println(wordBreak("applepenapple", []string{"apple", "pen"}))                     // true
\tfmt.Println(wordBreak("catsandog", []string{"cats", "dog", "sand", "and", "cat"}))    // false
}`,
      python: `def word_break(s: str, word_dict: list[str]) -> bool:
    # TODO: dp[i] = True if s[:i] can be segmented
    return False

print(word_break("leetcode", ["leet", "code"]))                           # True
print(word_break("applepenapple", ["apple", "pen"]))                      # True
print(word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]))    # False`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>
using namespace std;

bool wordBreak(string s, vector<string>& wordDict) {
    // TODO: dp[i] = true if s[0..i] can be segmented
    return false;
}

int main() {
    vector<string> d1 = {"leet", "code"};
    vector<string> d2 = {"cats","dog","sand","and","cat"};
    cout << boolalpha << wordBreak("leetcode", d1)      << endl; // true
    cout << wordBreak("catsandog", d2)                  << endl; // false
    return 0;
}`,
      javascript: `/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
function wordBreak(s, wordDict) {
    // TODO: dp[i] = true if s.slice(0,i) can be segmented
    return false;
}

console.log(wordBreak("leetcode", ["leet", "code"]));                          // true
console.log(wordBreak("applepenapple", ["apple", "pen"]));                     // true
console.log(wordBreak("catsandog", ["cats","dog","sand","and","cat"]));        // false`,
      java: `import java.util.*;

public class Main {
    public static boolean wordBreak(String s, List<String> wordDict) {
        // TODO: dp[i] = true if s[0..i] can be segmented
        return false;
    }

    public static void main(String[] args) {
        System.out.println(wordBreak("leetcode", Arrays.asList("leet","code")));   // true
        System.out.println(wordBreak("applepenapple", Arrays.asList("apple","pen"))); // true
        System.out.println(wordBreak("catsandog", Arrays.asList("cats","dog","sand","and","cat"))); // false
    }
}`,
      rust: `use std::collections::HashSet;

fn word_break(s: String, word_dict: Vec<String>) -> bool {
    // TODO: dp[i] = true if s[0..i] can be segmented
    false
}

fn main() {
    println!("{}", word_break("leetcode".to_string(), vec!["leet".to_string(),"code".to_string()])); // true
    println!("{}", word_break("catsandog".to_string(), vec!["cats".to_string(),"dog".to_string(),"sand".to_string(),"and".to_string(),"cat".to_string()])); // false
}`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public bool WordBreak(string s, IList<string> wordDict) {
        // TODO: DP to check if s can be segmented using wordDict
        return false;
    }
}`,
    },
    testCases: [
      { stdin: "leetcode|leet code", expectedOutput: "true" },
      { stdin: "applepenapple|apple pen", expectedOutput: "true" },
      { stdin: "catsandog|cats dog sand and cat", expectedOutput: "false" },
      { stdin: "cars|car ca rs", expectedOutput: "true" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"strings"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text()
\t\tif line == "" { continue }
\t\tparts := strings.SplitN(line, "|", 2)
\t\ts := strings.TrimSpace(parts[0])
\t\tdict := strings.Fields(strings.TrimSpace(parts[1]))
\t\tfmt.Println(wordBreak(s, dict))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  a, _, b = line.partition("|")
  s = a.strip()
  word_dict = b.strip().split()
  print(word_break(s, word_dict))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const [a, b] = line.split("|");
  const s = ( a || "").trim();
  const wordDict = ( b || "").trim().split(/\s+/).filter(Boolean);
  console.log(String(wordBreak(s, wordDict)));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  cout << boolalpha;
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    string s = (bar == string::npos) ? line : line.substr(0, bar);
    string rest = (bar == string::npos) ? "" : line.substr(bar + 1);
    // trim
    s.erase(0, s.find_first_not_of(" \\t"));
    s.erase(s.find_last_not_of(" \\t") + 1);
    vector<string> wordDict;
    { istringstream iss(rest); string w; while (iss >> w) wordDict.push_back(w); }
    cout << wordBreak(s, wordDict) << "\\n";
  }
  return 0;
}
`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim();
      if (line.isEmpty()) continue;
      String[] parts = line.split("\\\\|", 2);
      String s = parts[0].trim();
      List<String> wordDict = new ArrayList<>();
      if (parts.length > 1) {
        for (String w : parts[1].trim().split("\\\\s+")) if (!w.isEmpty()) wordDict.add(w);
      }
      System.out.println(wordBreak(s, wordDict));
    }
  }
}
`,
      rust: `use std::io::{self, Read};
{{SOLUTION}}
fn main() {
  let mut input = String::new();
  io::stdin().read_to_string(&mut input).unwrap();
  for line in input.lines() {
    let line = line.trim();
    if line.is_empty() { continue; }
    let mut it = line.splitn(2, '|');
    let s = it.next().unwrap_or(\"\").trim().to_string();
    let dict_str = it.next().unwrap_or(\"\");
    let word_dict: Vec<String> = dict_str.split_whitespace().map(|w| w.to_string()).collect();
    println!(\"{}\", word_break(s, word_dict));
  }
}
`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

{{SOLUTION}}
class __Judge__ {
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            var parts = line.Split(new char[]{'|'}, 2);
            string s = parts[0].Trim();
            var dict = parts[1].Trim().Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).ToList();
            Console.WriteLine(new Solution().WordBreak(s, dict).ToString().ToLower());
        }
    }
}`,
    },
  },

  // ── 2. Longest Valid Parentheses ─────────────────────────────────────────
  {
    slug: "longest-valid-parentheses",
    title: "Longest Valid Parentheses",
    category: "stack",
    difficulty: "hard",
    description:
      "Given a string containing just the characters `'('` and `')'`, return the length of the longest valid (well-formed) parentheses substring.\n\nHint: Use a stack. Push indices of unmatched `'('`. When you see `')'`, pop from the stack — if empty, push the current index as the new base; otherwise, the current valid length is `i - stack.top()`.",
    examples: [
      { input: 's = "(()"', output: "2", explanation: 'The longest valid parentheses substring is "()".' },
      {
        input: 's = ")()())"',
        output: "4",
        explanation: 'The longest valid parentheses substring is "()()".',
      },
      { input: 's = ")("', output: "0" },
    ],
    starter: {
      go: `package main

import "fmt"

func longestValidParentheses(s string) int {
\t// TODO: stack-based — push index, track base
\treturn 0
}

func main() {
\tfmt.Println(longestValidParentheses("(()"))    // 2
\tfmt.Println(longestValidParentheses(")()())")) // 4
\tfmt.Println(longestValidParentheses(")("))     // 0
}`,
      python: `def longest_valid_parentheses(s: str) -> int:
    # TODO: stack-based
    return 0

print(longest_valid_parentheses("(()"))    # 2
print(longest_valid_parentheses(")()())")) # 4
print(longest_valid_parentheses(")("))     # 0`,
      cpp: `#include <iostream>
#include <string>
#include <stack>
#include <algorithm>
using namespace std;

int longestValidParentheses(string s) {
    // TODO: stack-based
    return 0;
}

int main() {
    cout << longestValidParentheses("(()") << endl;    // 2
    cout << longestValidParentheses(")()())") << endl; // 4
    cout << longestValidParentheses(")(") << endl;     // 0
    return 0;
}`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function longestValidParentheses(s) {
    // TODO: stack-based
    return 0;
}

console.log(longestValidParentheses("(()"));    // 2
console.log(longestValidParentheses(")()())")); // 4
console.log(longestValidParentheses(")("));     // 0`,
      java: `import java.util.*;

public class Main {
    public static int longestValidParentheses(String s) {
        // TODO: stack-based
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestValidParentheses("(()"));    // 2
        System.out.println(longestValidParentheses(")()())")); // 4
        System.out.println(longestValidParentheses(")("));     // 0
    }
}`,
      rust: `fn longest_valid_parentheses(s: &str) -> i32 {
    // TODO: stack-based
    0
}

fn main() {
    println!("{}", longest_valid_parentheses("(()"));    // 2
    println!("{}", longest_valid_parentheses(")()())")); // 4
    println!("{}", longest_valid_parentheses(")("));     // 0
}`,
      csharp: `public class Solution {
    public int LongestValidParentheses(string s) {
        // TODO: find the longest valid parentheses substring
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "(()", expectedOutput: "2" },
      { stdin: ")()())", expectedOutput: "4" },
      { stdin: ")(", expectedOutput: "0" },
      { stdin: "()()", expectedOutput: "4" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\ts := scanner.Text()
\t\tfmt.Println(longestValidParentheses(s))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  s = line.rstrip("\\n")
  print(longest_valid_parentheses(s))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  const s = lines[i];
  if (i === lines.length - 1 && s === "") break;
  console.log(String(longestValidParentheses(s)));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  string s;
  while (getline(cin, s)) {
    if (!s.empty() && s.back() == '\\r') s.pop_back();
    cout << longestValidParentheses(s) << "\\n";
  }
  return 0;
}
`,
      java: `import java.io.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String s;
    while ((s = br.readLine()) != null) {
      System.out.println(longestValidParentheses(s));
    }
  }
}
`,
      rust: `use std::io::{self, BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let s = line.unwrap();
    println!(\"{}\", longest_valid_parentheses(&s));
  }
}
`,
      csharp: `using System;

{{SOLUTION}}
class __Judge__ {
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            Console.WriteLine(new Solution().LongestValidParentheses(line));
        }
    }
}`,
    },
  },
];
