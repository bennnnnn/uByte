import type { PracticeProblem } from "./types";

export const HARD_PROBLEMS_4: PracticeProblem[] = [
  // ── 1. Median of Two Sorted Arrays ───────────────────────────────────────
  {
    slug: "median-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    category: "binary-search",
    difficulty: "hard",
    description:
      "Given two sorted arrays `nums1` and `nums2`, return the median of the two sorted arrays. The overall run time complexity must be O(log(m + n)).\n\nHint: Binary search on the smaller array. Find a partition such that all elements on the left of the combined arrays are ≤ all elements on the right. The median is the average of the max-left and min-right elements.",
    examples: [
      { input: "nums1 = [1, 3], nums2 = [2]", output: "2.00000", explanation: "Merged: [1, 2, 3]. Median is 2." },
      { input: "nums1 = [1, 2], nums2 = [3, 4]", output: "2.50000", explanation: "Merged: [1, 2, 3, 4]. Median is (2+3)/2 = 2.5." },
    ],
    starter: {
      go: `package main

import "fmt"

func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
\t// TODO: binary search on the smaller array — O(log(min(m,n)))
\treturn 0.0
}

func main() {
\tfmt.Printf("%.5f\\n", findMedianSortedArrays([]int{1, 3}, []int{2}))    // 2.00000
\tfmt.Printf("%.5f\\n", findMedianSortedArrays([]int{1, 2}, []int{3, 4})) // 2.50000
}`,
      python: `def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:
    # TODO: binary search on the smaller array
    return 0.0

print(f"{find_median_sorted_arrays([1, 3], [2]):.5f}")    # 2.00000
print(f"{find_median_sorted_arrays([1, 2], [3, 4]):.5f}") # 2.50000`,
      cpp: `#include <iostream>
#include <vector>
#include <iomanip>
using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // TODO: binary search on the smaller array
    return 0.0;
}

int main() {
    vector<int> a = {1, 3}, b = {2};
    vector<int> c = {1, 2}, d = {3, 4};
    cout << fixed << setprecision(5) << findMedianSortedArrays(a, b) << endl; // 2.00000
    cout << fixed << setprecision(5) << findMedianSortedArrays(c, d) << endl; // 2.50000
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
    // TODO: binary search on the smaller array
    return 0;
}

console.log(findMedianSortedArrays([1, 3], [2]).toFixed(5));    // 2.00000
console.log(findMedianSortedArrays([1, 2], [3, 4]).toFixed(5)); // 2.50000`,
      java: `public class Main {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // TODO: binary search on the smaller array
        return 0.0;
    }

    public static void main(String[] args) {
        System.out.printf("%.5f%n", findMedianSortedArrays(new int[]{1,3}, new int[]{2}));    // 2.00000
        System.out.printf("%.5f%n", findMedianSortedArrays(new int[]{1,2}, new int[]{3,4})); // 2.50000
    }
}`,
      rust: `fn find_median_sorted_arrays(nums1: Vec<i32>, nums2: Vec<i32>) -> f64 {
    // TODO: binary search on the smaller array
    0.0
}

fn main() {
    println!("{:.5}", find_median_sorted_arrays(vec![1, 3], vec![2]));    // 2.00000
    println!("{:.5}", find_median_sorted_arrays(vec![1, 2], vec![3, 4])); // 2.50000
}`,
      csharp: `public class Solution {
    public double FindMedianSortedArrays(int[] nums1, int[] nums2) {
        // TODO: O(log(min(m,n))) binary search approach
        return 0.0;
    }
}`,
    },
    // stdin: "1 3|2"  →  nums1 | nums2
    testCases: [
      { stdin: "1 3|2", expectedOutput: "2.00000" },
      { stdin: "1 2|3 4", expectedOutput: "2.50000" },
      { stdin: "0 0|0 0", expectedOutput: "0.00000" },
      { stdin: "1 3 5|2 4 6", expectedOutput: "3.50000" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"strconv"
\t"strings"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text()
\t\tif line == "" { continue }
\t\tparts := strings.SplitN(line, "|", 2)
\t\tparseInts := func(s string) []int {
\t\t\tfs := strings.Fields(strings.TrimSpace(s))
\t\t\tout := make([]int, len(fs))
\t\t\tfor i, f := range fs { out[i], _ = strconv.Atoi(f) }
\t\t\treturn out
\t\t}
\t\tnums1 := parseInts(parts[0])
\t\tnums2 := parseInts(parts[1])
\t\tfmt.Printf("%.5f\\n", findMedianSortedArrays(nums1, nums2))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  a, _, b = line.partition("|")
  nums1 = [int(x) for x in a.split()]
  nums2 = [int(x) for x in b.split()]
  print(f"{find_median_sorted_arrays(nums1, nums2):.5f}")
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  const [a, b] = line.split("|");
  const nums1 = (a ?? "").trim().split(/\s+/).map(Number);
  const nums2 = (b ?? "").trim().split(/\s+/).map(Number);
  console.log(findMedianSortedArrays(nums1, nums2).toFixed(5));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  cout << fixed << setprecision(5);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    auto parseNums = [](const string& s) {
      istringstream iss(s); vector<int> v; int x;
      while (iss >> x) v.push_back(x);
      return v;
    };
    auto nums1 = parseNums(line.substr(0, bar));
    auto nums2 = parseNums(line.substr(bar + 1));
    cout << findMedianSortedArrays(nums1, nums2) << "\\n";
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
      String[] halves = line.split("\\\\|", 2);
      int[] nums1 = Arrays.stream(halves[0].trim().split("\\\\s+")).mapToInt(Integer::parseInt).toArray();
      int[] nums2 = Arrays.stream(halves[1].trim().split("\\\\s+")).mapToInt(Integer::parseInt).toArray();
      System.out.printf("%.5f%n", findMedianSortedArrays(nums1, nums2));
    }
  }
}
`,
      rust: `use std::io::{self, BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap();
    let line = line.trim();
    if line.is_empty() { continue; }
    let mut it = line.splitn(2, '|');
    let parse = |s: &str| s.split_whitespace().map(|x| x.parse::<i32>().unwrap()).collect::<Vec<_>>();
    let nums1 = parse(it.next().unwrap_or(""));
    let nums2 = parse(it.next().unwrap_or(""));
    println!(\"{:.5}\", find_median_sorted_arrays(nums1, nums2));
  }
}
`,
      csharp: `using System;
using System.Linq;

{{SOLUTION}}
class __Judge__ {
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            var parts = line.Split(new char[]{'|'}, 2);
            int[] nums1 = parts[0].Trim().Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
            int[] nums2 = parts[1].Trim().Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
            Console.WriteLine(new Solution().FindMedianSortedArrays(nums1, nums2).ToString("F5"));
        }
    }
}`,
    },
  },

  // ── 2. Regular Expression Matching ───────────────────────────────────────
  {
    slug: "regular-expression-matching",
    title: "Regular Expression Matching",
    category: "dynamic-programming",
    difficulty: "hard",
    description:
      "Given an input string `s` and a pattern `p`, implement regular expression matching with support for `'.'` and `'*'`.\n\n- `'.'` matches any single character.\n- `'*'` matches zero or more of the preceding element.\n\nThe matching must cover the **entire** input string.\n\nHint: 2D DP. `dp[i][j]` = true if `s[0..i]` matches `p[0..j]`. Handle the `'*'` case by checking zero occurrences (`dp[i][j-2]`) or one-or-more (`dp[i-1][j]` when the preceding pattern character matches `s[i-1]`).",
    examples: [
      { input: 's = "aa", p = "a"', output: "false", explanation: '"a" does not match the entire string "aa".' },
      { input: 's = "aa", p = "a*"', output: "true", explanation: '"a*" matches any number of "a"s.' },
      { input: 's = "ab", p = ".*"', output: "true", explanation: '".*" matches any string.' },
      { input: 's = "aab", p = "c*a*b"', output: "true", explanation: '"c*" matches 0 "c"s, "a*" matches 2 "a"s, then "b".' },
    ],
    starter: {
      go: `package main

import "fmt"

func isMatch(s string, p string) bool {
\t// TODO: 2D DP — dp[i][j] = s[:i] matches p[:j]
\treturn false
}

func main() {
\tfmt.Println(isMatch("aa", "a"))    // false
\tfmt.Println(isMatch("aa", "a*"))   // true
\tfmt.Println(isMatch("ab", ".*"))   // true
\tfmt.Println(isMatch("aab", "c*a*b")) // true
}`,
      python: `def is_match(s: str, p: str) -> bool:
    # TODO: 2D DP
    return False

print(is_match("aa", "a"))       # False
print(is_match("aa", "a*"))      # True
print(is_match("ab", ".*"))      # True
print(is_match("aab", "c*a*b"))  # True`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

bool isMatch(string s, string p) {
    // TODO: 2D DP
    return false;
}

int main() {
    cout << boolalpha;
    cout << isMatch("aa", "a")      << endl; // false
    cout << isMatch("aa", "a*")     << endl; // true
    cout << isMatch("ab", ".*")     << endl; // true
    cout << isMatch("aab", "c*a*b") << endl; // true
    return 0;
}`,
      javascript: `/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
function isMatch(s, p) {
    // TODO: 2D DP
    return false;
}

console.log(isMatch("aa", "a"));       // false
console.log(isMatch("aa", "a*"));      // true
console.log(isMatch("ab", ".*"));      // true
console.log(isMatch("aab", "c*a*b"));  // true`,
      java: `public class Main {
    public static boolean isMatch(String s, String p) {
        // TODO: 2D DP
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isMatch("aa", "a"));       // false
        System.out.println(isMatch("aa", "a*"));      // true
        System.out.println(isMatch("ab", ".*"));      // true
        System.out.println(isMatch("aab", "c*a*b"));  // true
    }
}`,
      rust: `fn is_match(s: &str, p: &str) -> bool {
    // TODO: 2D DP
    false
}

fn main() {
    println!("{}", is_match("aa", "a"));       // false
    println!("{}", is_match("aa", "a*"));      // true
    println!("{}", is_match("ab", ".*"));      // true
    println!("{}", is_match("aab", "c*a*b"));  // true
}`,
      csharp: `public class Solution {
    public bool IsMatch(string s, string p) {
        // TODO: implement regex matching with '.' and '*'
        return false;
    }
}`,
    },
    testCases: [
      { stdin: "aa|a", expectedOutput: "false" },
      { stdin: "aa|a*", expectedOutput: "true" },
      { stdin: "ab|.*", expectedOutput: "true" },
      { stdin: "aab|c*a*b", expectedOutput: "true" },
      { stdin: "mississippi|mis*is*p*.", expectedOutput: "false" },
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
\t\tp := strings.TrimSpace(parts[1])
\t\tfmt.Println(isMatch(s, p))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  a, _, b = line.partition("|")
  print(is_match(a.strip(), b.strip()))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  const [a, b] = line.split("|");
  console.log(String(isMatch((a ?? "").trim(), (b ?? "").trim())));
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
    string s = line.substr(0, bar);
    string p = line.substr(bar + 1);
    s.erase(0, s.find_first_not_of(" \\t"));
    s.erase(s.find_last_not_of(" \\t") + 1);
    p.erase(0, p.find_first_not_of(" \\t"));
    p.erase(p.find_last_not_of(" \\t") + 1);
    cout << isMatch(s, p) << "\\n";
  }
  return 0;
}
`,
      java: `import java.io.*;
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
      String p = parts.length > 1 ? parts[1].trim() : "";
      System.out.println(isMatch(s, p));
    }
  }
}
`,
      rust: `use std::io::{self, BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap();
    let line = line.trim();
    if line.is_empty() { continue; }
    let mut it = line.splitn(2, '|');
    let s = it.next().unwrap_or("").trim();
    let p = it.next().unwrap_or("").trim();
    println!(\"{}\", is_match(s, p));
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
            var parts = line.Split(new char[]{'|'}, 2);
            Console.WriteLine(new Solution().IsMatch(parts[0], parts[1]).ToString().ToLower());
        }
    }
}`,
    },
  },

  // ── 3. N-Queens Count ────────────────────────────────────────────────────
  {
    slug: "n-queens-ii",
    title: "N-Queens II",
    category: "backtracking",
    difficulty: "hard",
    description:
      "The N-Queens puzzle places `n` queens on an `n x n` chess board so that no two queens attack each other. Given an integer `n`, return the number of distinct solutions.\n\nHint: Backtracking. For each row, try placing a queen in each column. Use three sets to track which columns, and which diagonals (`row - col` and `row + col`) are already occupied. Count the arrangements where all `n` rows have been placed.",
    examples: [
      { input: "n = 4", output: "2", explanation: "There are two distinct solutions to the 4-queens puzzle." },
      { input: "n = 1", output: "1" },
    ],
    starter: {
      go: `package main

import "fmt"

func totalNQueens(n int) int {
\t// TODO: backtracking — track cols, diag1, diag2
\treturn 0
}

func main() {
\tfmt.Println(totalNQueens(4)) // 2
\tfmt.Println(totalNQueens(1)) // 1
\tfmt.Println(totalNQueens(8)) // 92
}`,
      python: `def total_n_queens(n: int) -> int:
    # TODO: backtracking
    return 0

print(total_n_queens(4))  # 2
print(total_n_queens(1))  # 1
print(total_n_queens(8))  # 92`,
      cpp: `#include <iostream>
using namespace std;

int totalNQueens(int n) {
    // TODO: backtracking
    return 0;
}

int main() {
    cout << totalNQueens(4) << endl; // 2
    cout << totalNQueens(1) << endl; // 1
    cout << totalNQueens(8) << endl; // 92
    return 0;
}`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function totalNQueens(n) {
    // TODO: backtracking
    return 0;
}

console.log(totalNQueens(4)); // 2
console.log(totalNQueens(1)); // 1
console.log(totalNQueens(8)); // 92`,
      java: `public class Main {
    public static int totalNQueens(int n) {
        // TODO: backtracking
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(totalNQueens(4)); // 2
        System.out.println(totalNQueens(1)); // 1
        System.out.println(totalNQueens(8)); // 92
    }
}`,
      rust: `fn total_n_queens(n: i32) -> i32 {
    // TODO: backtracking
    0
}

fn main() {
    println!("{}", total_n_queens(4)); // 2
    println!("{}", total_n_queens(1)); // 1
    println!("{}", total_n_queens(8)); // 92
}`,
      csharp: `public class Solution {
    public int TotalNQueens(int n) {
        // TODO: count the number of distinct N-Queens solutions
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "1", expectedOutput: "1" },
      { stdin: "4", expectedOutput: "2" },
      { stdin: "5", expectedOutput: "10" },
      { stdin: "8", expectedOutput: "92" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"strconv"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text()
\t\tif line == "" { continue }
\t\tn, _ := strconv.Atoi(line)
\t\tfmt.Println(totalNQueens(n))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  print(total_n_queens(int(line)))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  console.log(String(totalNQueens(parseInt(line, 10))));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    cout << totalNQueens(stoi(line)) << "\\n";
  }
  return 0;
}
`,
      java: `import java.io.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim();
      if (line.isEmpty()) continue;
      System.out.println(totalNQueens(Integer.parseInt(line)));
    }
  }
}
`,
      rust: `use std::io::{self, BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap();
    let line = line.trim();
    if line.is_empty() { continue; }
    let n: i32 = line.parse().unwrap();
    println!(\"{}\", total_n_queens(n));
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
            int n = int.Parse(line);
            Console.WriteLine(new Solution().TotalNQueens(n));
        }
    }
}`,
    },
  },
];
