import type { PracticeProblem } from "./types";

export const HARD_PROBLEMS_3: PracticeProblem[] = [
  // ─── 1. Minimum Window Substring ─────────────────────────────────────────────
  {
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    category: "sliding-window",
    difficulty: "hard",
    description:
      "Given two strings `s` and `t` of lengths `m` and `n`, return the **minimum window substring** of `s` such that every character in `t` (including duplicates) is included in the window.\n\nIf no such substring exists, return an empty string.\n\nInput format: `s|t`\n\n**Constraints:**\n- `m == s.length`, `n == t.length`\n- `1 <= m, n <= 10⁵`\n- `s` and `t` consist of uppercase and lowercase English letters.\n\n**Hint:** Sliding window — expand right until all characters are covered, then shrink from left.",
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""', explanation: "t needs two a's but s has only one." },
    ],
    starter: {
      go: `package main

import "fmt"

func minWindow(s string, t string) string {
\t// TODO: find the minimum window substring of s containing all chars of t
\t// Hint: sliding window with two freq maps
\treturn ""
}

func main() {
\tfmt.Println(minWindow("ADOBECODEBANC", "ABC")) // BANC
\tfmt.Println(minWindow("a", "aa"))              // ""
}`,
      python: `def min_window(s: str, t: str) -> str:
    # TODO: find the minimum window substring of s containing all chars of t
    return ""

if __name__ == "__main__":
    print(min_window("ADOBECODEBANC", "ABC"))  # BANC
    print(min_window("a", "aa"))               # ""
`,
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
    // TODO: find the minimum window substring
    return "";
}

console.log(minWindow("ADOBECODEBANC", "ABC")); // BANC
console.log(minWindow("a", "aa"));              // ""`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string minWindow(string s, string t) {
    // TODO: find the minimum window substring
    return "";
}

int main() {
    cout << minWindow("ADOBECODEBANC", "ABC") << endl; // BANC
    cout << "\"" << minWindow("a", "aa") << "\"" << endl; // ""
    return 0;
}`,
      java: `public class Main {
    public static String minWindow(String s, String t) {
        // TODO: find the minimum window substring
        return "";
    }

    public static void main(String[] args) {
        System.out.println(minWindow("ADOBECODEBANC", "ABC")); // BANC
        System.out.println(minWindow("a", "aa"));              // (empty)
    }
}`,
      rust: `fn min_window(s: String, t: String) -> String {
    // TODO: find the minimum window substring
    String::new()
}

fn main() {
    println!("{}", min_window("ADOBECODEBANC".to_string(), "ABC".to_string())); // BANC
    println!("{}", min_window("a".to_string(), "aa".to_string()));              // (empty)
}`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public string MinWindow(string s, string t) {
        // TODO: sliding window to find minimum window containing all chars of t
        return "";
    }
}`,
    },
    testCases: [
      { stdin: "ADOBECODEBANC|ABC", expectedOutput: "BANC" },
      { stdin: "a|a", expectedOutput: "a" },
      { stdin: "a|aa", expectedOutput: "" },
      { stdin: "AAABBBCCC|ABC", expectedOutput: "ABC" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tp := strings.SplitN(l, "|", 2)
\t\ts, t := p[0], ""; if len(p) > 1 { t = p[1] }
\t\tfmt.Println(minWindow(s, t))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    s, _, t = line.partition("|")
    print(min_window(s, t))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [s, t] = l.split("|");
  console.log(minWindow(s || "", t || ""));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    string s = line.substr(0,bar), t = (bar==string::npos)?"":line.substr(bar+1);
    cout << minWindow(s, t) << "\\n";
  }
}`,
      java: `import java.io.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      if (line.isEmpty()) continue;
      String[] p = line.split("\\|", 2);
      String s = p[0], t = p.length>1?p[1]:"";
      System.out.println(minWindow(s, t));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let p: Vec<&str> = line.splitn(2,'|').collect();
    let s = p[0].to_string(); let t = if p.len()>1{p[1].to_string()}else{String::new()};
    println!("{}", min_window(s, t));
  }
}`,
      csharp: `using System;

{{SOLUTION}}
class __Judge__ {
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            var parts = line.Split(new char[]{'|'}, 2);
            Console.WriteLine(new Solution().MinWindow(parts[0], parts[1]));
        }
    }
}`,
    },
  },

  // ─── 2. Largest Rectangle in Histogram ───────────────────────────────────────
  {
    slug: "largest-rectangle-histogram",
    title: "Largest Rectangle in Histogram",
    category: "stack",
    difficulty: "hard",
    description:
      "Given an array of integers `heights` representing the histogram's bar heights (each bar has width `1`), return the **area of the largest rectangle** in the histogram.\n\n**Constraints:**\n- `1 <= heights.length <= 10⁵`\n- `0 <= heights[i] <= 10⁴`\n\n**Hint:** Use a monotonic stack. For each bar, find the left and right boundaries where it is the shortest.",
    examples: [
      { input: "heights = [2,1,5,6,2,3]", output: "10", explanation: "Rectangle of height 5 spans indices 2–3 (width 2)." },
      { input: "heights = [2,4]", output: "4" },
    ],
    starter: {
      go: `package main

import "fmt"

func largestRectangleArea(heights []int) int {
\t// TODO: find the area of the largest rectangle in the histogram
\t// Hint: monotonic stack — maintain indices of bars in increasing height order
\treturn 0
}

func main() {
\tfmt.Println(largestRectangleArea([]int{2, 1, 5, 6, 2, 3})) // 10
\tfmt.Println(largestRectangleArea([]int{2, 4}))              // 4
}`,
      python: `def largest_rectangle_area(heights: list[int]) -> int:
    # TODO: find the area of the largest rectangle in the histogram
    # Hint: monotonic stack
    return 0

if __name__ == "__main__":
    print(largest_rectangle_area([2, 1, 5, 6, 2, 3]))  # 10
    print(largest_rectangle_area([2, 4]))               # 4
`,
      javascript: `/**
 * @param {number[]} heights
 * @return {number}
 */
function largestRectangleArea(heights) {
    // TODO: find the area of the largest rectangle in the histogram
    return 0;
}

console.log(largestRectangleArea([2, 1, 5, 6, 2, 3])); // 10
console.log(largestRectangleArea([2, 4]));              // 4`,
      cpp: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int largestRectangleArea(vector<int>& heights) {
    // TODO: find the area of the largest rectangle in the histogram
    return 0;
}

int main() {
    vector<int> a = {2,1,5,6,2,3}, b = {2,4};
    cout << largestRectangleArea(a) << endl; // 10
    cout << largestRectangleArea(b) << endl; // 4
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int largestRectangleArea(int[] heights) {
        // TODO: find the area of the largest rectangle in the histogram
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(largestRectangleArea(new int[]{2,1,5,6,2,3})); // 10
        System.out.println(largestRectangleArea(new int[]{2,4}));          // 4
    }
}`,
      rust: `fn largest_rectangle_area(heights: Vec<i32>) -> i32 {
    // TODO: find the area of the largest rectangle in the histogram
    0
}

fn main() {
    println!("{}", largest_rectangle_area(vec![2,1,5,6,2,3])); // 10
    println!("{}", largest_rectangle_area(vec![2,4]));          // 4
}`,
      csharp: `public class Solution {
    public int LargestRectangleArea(int[] heights) {
        // TODO: stack-based approach to find the largest rectangle
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "2 1 5 6 2 3", expectedOutput: "10" },
      { stdin: "2 4", expectedOutput: "4" },
      { stdin: "1", expectedOutput: "1" },
      { stdin: "1 2 3 4 5", expectedOutput: "9" },
      { stdin: "5 4 3 2 1", expectedOutput: "9" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"strconv";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tparts := strings.Fields(l)
\t\theights := make([]int, len(parts))
\t\tfor i, s := range parts { heights[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(largestRectangleArea(heights))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    heights = list(map(int, line.split()))
    print(largest_rectangle_area(heights))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const heights = l.split(/\s+/).map(Number);
  console.log(largestRectangleArea(heights));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    vector<int> heights; istringstream iss(line); int x;
    while (iss >> x) heights.push_back(x);
    cout << largestRectangleArea(heights) << "\\n";
  }
}`,
      java: `import java.io.*;import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      if (line.isEmpty()) continue;
      String[] p = line.trim().split("\\s+");
      int[] heights = new int[p.length];
      for (int i=0;i<p.length;i++) heights[i]=Integer.parseInt(p[i]);
      System.out.println(largestRectangleArea(heights));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let heights: Vec<i32> = line.split_whitespace().filter_map(|s|s.parse().ok()).collect();
    println!("{}", largest_rectangle_area(heights));
  }
}`,
      csharp: `using System;
using System.Linq;

{{SOLUTION}}
class __Judge__ {
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            int[] heights = line.Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
            Console.WriteLine(new Solution().LargestRectangleArea(heights));
        }
    }
}`,
    },
  },

  // ─── 3. Edit Distance ────────────────────────────────────────────────────────
  {
    slug: "edit-distance",
    title: "Edit Distance",
    category: "dynamic-programming",
    difficulty: "hard",
    description:
      "Given two strings `word1` and `word2`, return the **minimum number of operations** required to convert `word1` to `word2`.\n\nYou have three operations:\n- **Insert** a character\n- **Delete** a character\n- **Replace** a character\n\nInput format: `word1|word2`\n\n**Constraints:**\n- `0 <= word1.length, word2.length <= 500`\n- `word1` and `word2` consist of lowercase English letters.\n\n**Hint:** Classic 2D DP — `dp[i][j]` is the edit distance between `word1[:i]` and `word2[:j]`.",
    examples: [
      { input: 'word1 = "horse", word2 = "ros"', output: "3", explanation: "horse→rorse→rose→ros" },
      { input: 'word1 = "intention", word2 = "execution"', output: "5" },
    ],
    starter: {
      go: `package main

import "fmt"

func minDistance(word1 string, word2 string) int {
\t// TODO: return minimum edit distance (Levenshtein distance)
\t// Hint: dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(0 or 1))
\treturn 0
}

func main() {
\tfmt.Println(minDistance("horse", "ros"))          // 3
\tfmt.Println(minDistance("intention", "execution")) // 5
}`,
      python: `def min_distance(word1: str, word2: str) -> int:
    # TODO: return minimum edit distance (Levenshtein distance)
    return 0

if __name__ == "__main__":
    print(min_distance("horse", "ros"))           # 3
    print(min_distance("intention", "execution"))  # 5
`,
      javascript: `/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
function minDistance(word1, word2) {
    // TODO: return minimum edit distance
    return 0;
}

console.log(minDistance("horse", "ros"));          // 3
console.log(minDistance("intention", "execution")); // 5`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int minDistance(string word1, string word2) {
    // TODO: return minimum edit distance
    return 0;
}

int main() {
    cout << minDistance("horse", "ros") << endl;          // 3
    cout << minDistance("intention", "execution") << endl; // 5
    return 0;
}`,
      java: `public class Main {
    public static int minDistance(String word1, String word2) {
        // TODO: return minimum edit distance
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minDistance("horse", "ros"));          // 3
        System.out.println(minDistance("intention", "execution")); // 5
    }
}`,
      rust: `fn min_distance(word1: String, word2: String) -> i32 {
    // TODO: return minimum edit distance
    0
}

fn main() {
    println!("{}", min_distance("horse".to_string(), "ros".to_string()));          // 3
    println!("{}", min_distance("intention".to_string(), "execution".to_string())); // 5
}`,
      csharp: `public class Solution {
    public int MinDistance(string word1, string word2) {
        // TODO: DP to compute edit distance (Levenshtein)
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "horse|ros", expectedOutput: "3" },
      { stdin: "intention|execution", expectedOutput: "5" },
      { stdin: "abc|abc", expectedOutput: "0" },
      { stdin: "abc|", expectedOutput: "3" },
      { stdin: "|abc", expectedOutput: "3" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tp := strings.SplitN(l, "|", 2)
\t\tw1, w2 := p[0], ""; if len(p) > 1 { w2 = p[1] }
\t\tfmt.Println(minDistance(w1, w2))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    idx = line.find("|")
    if idx == -1:
        w1, w2 = line, ""
    else:
        w1, w2 = line[:idx], line[idx+1:]
    print(min_distance(w1, w2))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const idx = l.indexOf("|");
  const w1 = idx >= 0 ? l.slice(0, idx) : l;
  const w2 = idx >= 0 ? l.slice(idx + 1) : "";
  console.log(minDistance(w1, w2));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    string w1 = line.substr(0, bar), w2 = (bar==string::npos)?"":line.substr(bar+1);
    cout << minDistance(w1, w2) << "\\n";
  }
}`,
      java: `import java.io.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      if (line.isEmpty()) continue;
      int bar = line.indexOf('|');
      String w1 = bar>=0?line.substring(0,bar):line, w2 = bar>=0?line.substring(bar+1):"";
      System.out.println(minDistance(w1, w2));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let p: Vec<&str> = line.splitn(2,'|').collect();
    let w1 = p[0].to_string(); let w2 = if p.len()>1{p[1].to_string()}else{String::new()};
    println!("{}", min_distance(w1, w2));
  }
}`,
      csharp: `using System;

{{SOLUTION}}
class __Judge__ {
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            var parts = line.Split(new char[]{'|'}, 2);
            Console.WriteLine(new Solution().MinDistance(parts[0], parts[1]));
        }
    }
}`,
    },
  },
];
