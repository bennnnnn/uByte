import type { PracticeProblem } from "./types";

export const EASY_PROBLEMS: PracticeProblem[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    difficulty: "easy",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" },
      { input: "nums = [3, 3], target = 6", output: "[0, 1]" },
    ],
    starter: {
      go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
\t// TODO: return indices of two numbers that add up to target
\treturn nil
}

func main() {
\tnums := []int{2, 7, 11, 15}
\ttarget := 9
\tresult := twoSum(nums, target)
\tfmt.Println(result) // expect [0 1]
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # TODO: return indices of two numbers that add up to target
    return []

if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    print(two_sum(nums, target))  # expect [0, 1]
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // TODO: return indices of two numbers that add up to target
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    for (int i : result) cout << i << " ";
    cout << endl;
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // TODO: return indices of two numbers that add up to target
    return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
console.log(twoSum(nums, target)); // expect [0, 1]`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // TODO: return indices of two numbers that add up to target
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println(Arrays.toString(result)); // expect [0, 1]
    }
}`,
      rust: `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    // TODO: return indices of two numbers that add up to target
    vec![]
}

fn main() {
    let nums = vec![2, 7, 11, 15];
    let target = 9;
    let result = two_sum(nums, target);
    println!("{:?}", result); // expect [0, 1]
}`,
    },
    testCases: [
      { stdin: "2 7 11 15|9", expectedOutput: "[0 1]" },
      { stdin: "3 2 4|6", expectedOutput: "[1 2]" },
      { stdin: "3 3|6", expectedOutput: "[0 1]" },
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
\t\tnumsStr := strings.Fields(parts[0])
\t\tnums := make([]int, len(numsStr))
\t\tfor i, s := range numsStr { nums[i], _ = strconv.Atoi(s) }
\t\ttarget, _ := strconv.Atoi(strings.TrimSpace(parts[1]))
\t\tfmt.Println(twoSum(nums, target))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  a, _, b = line.partition("|")
  nums = [int(x) for x in a.split()]
  target = int(b.strip())
  print(two_sum(nums, target))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
function fmt(v) {
  if (Array.isArray(v)) {
    if (v.length && Array.isArray(v[0])) return "[" + v.map((x) => fmt(x)).join(" ") + "]";
    return "[" + v.join(" ") + "]";
  }
  return String(v);
}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const [a, b] = line.split("|");
  const nums = a.trim().split(/\\s+/).filter(Boolean).map(Number);
  const target = Number((b ?? "").trim());
  console.log(fmt(twoSum(nums, target)));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
static string fmtVec(const vector<int>& v) {
  string out = "[";
  for (size_t i = 0; i < v.size(); i++) {
    if (i) out += " ";
    out += to_string(v[i]);
  }
  out += "]";
  return out;
}
int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    string a = (bar == string::npos) ? line : line.substr(0, bar);
    string b = (bar == string::npos) ? "" : line.substr(bar + 1);
    vector<int> nums;
    { istringstream iss(a); int x; while (iss >> x) nums.push_back(x); }
    int target = 0; { istringstream iss(b); iss >> target; }
    auto res = twoSum(nums, target);
    cout << fmtVec(res) << "\\n";
  }
  return 0;
}
`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  static String fmtIntArray(int[] a) {
    StringBuilder sb = new StringBuilder();
    sb.append('[');
    for (int i = 0; i < a.length; i++) {
      if (i > 0) sb.append(' ');
      sb.append(a[i]);
    }
    sb.append(']');
    return sb.toString();
  }
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim();
      if (line.isEmpty()) continue;
      String[] parts = line.split("\\\\|", 2);
      String[] numsStr = parts[0].trim().isEmpty() ? new String[0] : parts[0].trim().split("\\\\s+");
      int[] nums = new int[numsStr.length];
      for (int i = 0; i < numsStr.length; i++) nums[i] = Integer.parseInt(numsStr[i]);
      int target = Integer.parseInt(parts.length > 1 ? parts[1].trim() : "0");
      int[] res = twoSum(nums, target);
      System.out.println(fmtIntArray(res));
    }
  }
}
`,
      rust: `use std::io::{self, Read};
{{SOLUTION}}
fn fmt_vec(v: &Vec<i32>) -> String {
  let mut out = String::from(\"[\");
  for (i, x) in v.iter().enumerate() {
    if i > 0 { out.push(' '); }
    out.push_str(&x.to_string());
  }
  out.push(']');
  out
}
fn main() {
  let mut input = String::new();
  io::stdin().read_to_string(&mut input).unwrap();
  for line in input.lines() {
    let line = line.trim();
    if line.is_empty() { continue; }
    let mut it = line.splitn(2, '|');
    let a = it.next().unwrap_or(\"\");
    let b = it.next().unwrap_or(\"0\");
    let nums: Vec<i32> = a.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    let target: i32 = b.trim().parse().unwrap_or(0);
    let res = two_sum(nums, target);
    println!(\"{}\", fmt_vec(&res));
  }
}
`,
    },
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    description:
      "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets are closed by the same type of brackets.\n- Open brackets are closed in the correct order.\n- Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "easy",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    starter: {
      go: `package main

import "fmt"

func isValid(s string) bool {
\t// TODO: use a stack to check valid parentheses
\treturn false
}

func main() {
\tfmt.Println(isValid("()"))     // true
\tfmt.Println(isValid("()[]{}")) // true
\tfmt.Println(isValid("(]"))     // false
}`,
      python: `def is_valid(s: str) -> bool:
    # TODO: use a stack to check valid parentheses
    return False

print(is_valid("()"))      # True
print(is_valid("()[]{}"))  # True
print(is_valid("(]"))      # False`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(string s) {
    // TODO: use a stack to check valid parentheses
    return false;
}

int main() {
    cout << boolalpha;
    cout << isValid("()") << endl;      // true
    cout << isValid("()[]{}") << endl;  // true
    cout << isValid("(]") << endl;      // false
    return 0;
}`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // TODO: use a stack to check valid parentheses
    return false;
}

console.log(isValid("()"));      // true
console.log(isValid("()[]{}"));  // true
console.log(isValid("(]"));      // false`,
      java: `public class Main {
    public static boolean isValid(String s) {
        // TODO: use a stack to check valid parentheses
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isValid("()"));      // true
        System.out.println(isValid("()[]{}"));  // true
        System.out.println(isValid("(]"));      // false
    }
}`,
      rust: `fn is_valid(s: &str) -> bool {
    // TODO: use a stack to check valid parentheses
    false
}

fn main() {
    println!("{}", is_valid("()"));      // true
    println!("{}", is_valid("()[]{}"));  // true
    println!("{}", is_valid("(]"));      // false
}`,
    },
    testCases: [
      { stdin: "()", expectedOutput: "true" },
      { stdin: "()[]{}", expectedOutput: "true" },
      { stdin: "(]", expectedOutput: "false" },
      { stdin: "([)]", expectedOutput: "false" },
      { stdin: "{[]}", expectedOutput: "true" },
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
\t\tif s == "" { continue }
\t\tfmt.Println(isValid(s))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  s = line.strip()
  if not s: continue
  print(is_valid(s))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const s = lineRaw.trim();
  if (!s) continue;
  console.log(String(isValid(s)));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  cout << boolalpha;
  string s;
  while (getline(cin, s)) {
    if (s.empty()) continue;
    cout << isValid(s) << "\\n";
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
      s = s.trim();
      if (s.isEmpty()) continue;
      System.out.println(isValid(s));
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
    let s = line.trim();
    if s.is_empty() { continue; }
    println!(\"{}\", is_valid(s));
  }
}
`,
    },
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    description:
      "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    difficulty: "easy",
    examples: [
      { input: "nums = [1, 2, 3, 1]", output: "true" },
      { input: "nums = [1, 2, 3, 4]", output: "false" },
      { input: "nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]", output: "true" },
    ],
    starter: {
      go: `package main

import "fmt"

func containsDuplicate(nums []int) bool {
\t// TODO: return true if any value appears more than once
\treturn false
}

func main() {
\tfmt.Println(containsDuplicate([]int{1, 2, 3, 1}))          // true
\tfmt.Println(containsDuplicate([]int{1, 2, 3, 4}))          // false
}`,
      python: `def contains_duplicate(nums: list[int]) -> bool:
    # TODO: return True if any value appears more than once
    return False

print(contains_duplicate([1, 2, 3, 1]))  # True
print(contains_duplicate([1, 2, 3, 4]))  # False`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

bool containsDuplicate(vector<int>& nums) {
    // TODO: return true if any value appears more than once
    return false;
}

int main() {
    vector<int> a = {1, 2, 3, 1};
    vector<int> b = {1, 2, 3, 4};
    cout << boolalpha << containsDuplicate(a) << endl; // true
    cout << containsDuplicate(b) << endl;               // false
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
    // TODO: return true if any value appears more than once
    return false;
}

console.log(containsDuplicate([1, 2, 3, 1])); // true
console.log(containsDuplicate([1, 2, 3, 4])); // false`,
      java: `import java.util.*;

public class Main {
    public static boolean containsDuplicate(int[] nums) {
        // TODO: return true if any value appears more than once
        return false;
    }

    public static void main(String[] args) {
        System.out.println(containsDuplicate(new int[]{1, 2, 3, 1})); // true
        System.out.println(containsDuplicate(new int[]{1, 2, 3, 4})); // false
    }
}`,
      rust: `use std::collections::HashSet;

fn contains_duplicate(nums: Vec<i32>) -> bool {
    // TODO: return true if any value appears more than once
    false
}

fn main() {
    println!("{}", contains_duplicate(vec![1, 2, 3, 1])); // true
    println!("{}", contains_duplicate(vec![1, 2, 3, 4])); // false
}`,
    },
    testCases: [
      { stdin: "1 2 3 1", expectedOutput: "true" },
      { stdin: "1 2 3 4", expectedOutput: "false" },
      { stdin: "1 1 1 3 3 4 3 2 4 2", expectedOutput: "true" },
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
\t\tparts := strings.Fields(line)
\t\tnums := make([]int, len(parts))
\t\tfor i, s := range parts { nums[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(containsDuplicate(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(contains_duplicate(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\\s+/).filter(Boolean).map(Number);
  console.log(String(containsDuplicate(nums)));
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
    line = std::regex_replace(line, std::regex("^\\s+|\\s+$"), "");
    if (line.empty()) continue;
    vector<int> nums;
    { istringstream iss(line); int x; while (iss >> x) nums.push_back(x); }
    cout << containsDuplicate(nums) << "\\n";
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
      String[] parts = line.split("\\\\s+");
      int[] nums = new int[parts.length];
      for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
      System.out.println(containsDuplicate(nums));
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
    let nums: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    println!(\"{}\", contains_duplicate(nums));
  }
}
`,
    },
  },
  {
    slug: "best-time-to-buy-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    description:
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
    difficulty: "easy",
    examples: [
      {
        input: "prices = [7, 1, 5, 3, 6, 4]",
        output: "5",
        explanation: "Buy on day 2 (price=1), sell on day 5 (price=6). Profit = 6 - 1 = 5.",
      },
      {
        input: "prices = [7, 6, 4, 3, 1]",
        output: "0",
        explanation: "Prices only decrease — no profit possible.",
      },
    ],
    starter: {
      go: `package main

import "fmt"

func maxProfit(prices []int) int {
\t// TODO: find the maximum profit from a single buy/sell
\treturn 0
}

func main() {
\tfmt.Println(maxProfit([]int{7, 1, 5, 3, 6, 4})) // 5
\tfmt.Println(maxProfit([]int{7, 6, 4, 3, 1}))     // 0
}`,
      python: `def max_profit(prices: list[int]) -> int:
    # TODO: find the maximum profit from a single buy/sell
    return 0

print(max_profit([7, 1, 5, 3, 6, 4]))  # 5
print(max_profit([7, 6, 4, 3, 1]))      # 0`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxProfit(vector<int>& prices) {
    // TODO: find the maximum profit from a single buy/sell
    return 0;
}

int main() {
    vector<int> a = {7, 1, 5, 3, 6, 4};
    vector<int> b = {7, 6, 4, 3, 1};
    cout << maxProfit(a) << endl; // 5
    cout << maxProfit(b) << endl; // 0
    return 0;
}`,
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    // TODO: find the maximum profit from a single buy/sell
    return 0;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
console.log(maxProfit([7, 6, 4, 3, 1]));     // 0`,
      java: `public class Main {
    public static int maxProfit(int[] prices) {
        // TODO: find the maximum profit from a single buy/sell
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxProfit(new int[]{7, 1, 5, 3, 6, 4})); // 5
        System.out.println(maxProfit(new int[]{7, 6, 4, 3, 1}));     // 0
    }
}`,
      rust: `fn max_profit(prices: Vec<i32>) -> i32 {
    // TODO: find the maximum profit from a single buy/sell
    0
}

fn main() {
    println!("{}", max_profit(vec![7, 1, 5, 3, 6, 4])); // 5
    println!("{}", max_profit(vec![7, 6, 4, 3, 1]));     // 0
}`,
    },
    testCases: [
      { stdin: "7 1 5 3 6 4", expectedOutput: "5" },
      { stdin: "7 6 4 3 1", expectedOutput: "0" },
      { stdin: "1 2", expectedOutput: "1" },
      { stdin: "2 4 1", expectedOutput: "2" },
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
\t\tparts := strings.Fields(line)
\t\tprices := make([]int, len(parts))
\t\tfor i, s := range parts { prices[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(maxProfit(prices))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  prices = [int(x) for x in line.split()]
  print(max_profit(prices))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const prices = line.split(/\\s+/).filter(Boolean).map(Number);
  console.log(String(maxProfit(prices)));
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
    vector<int> prices;
    { istringstream iss(line); int x; while (iss >> x) prices.push_back(x); }
    cout << maxProfit(prices) << "\\n";
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
      String[] parts = line.split("\\\\s+");
      int[] prices = new int[parts.length];
      for (int i = 0; i < parts.length; i++) prices[i] = Integer.parseInt(parts[i]);
      System.out.println(maxProfit(prices));
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
    let prices: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    println!(\"{}\", max_profit(prices));
  }
}
`,
    },
  },
  {
    slug: "reverse-string",
    title: "Reverse String",
    description:
      "Write a function that reverses a string. The input is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\nHint: Use two pointers — one at the start and one at the end, swap, and move inward.",
    difficulty: "easy",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    starter: {
      go: `package main

import "fmt"

func reverseString(s []byte) {
\t// TODO: reverse s in-place using two pointers
}

func main() {
\ts := []byte("hello")
\treverseString(s)
\tfmt.Println(string(s)) // "olleh"
}`,
      python: `def reverse_string(s: list[str]) -> None:
    # TODO: reverse s in-place using two pointers
    pass

s = list("hello")
reverse_string(s)
print("".join(s))  # "olleh"`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

void reverseString(vector<char>& s) {
    // TODO: reverse s in-place using two pointers
}

int main() {
    vector<char> s = {'h', 'e', 'l', 'l', 'o'};
    reverseString(s);
    for (char c : s) cout << c;
    cout << endl; // "olleh"
    return 0;
}`,
      javascript: `/**
 * @param {character[]} s
 * @return {void}
 */
function reverseString(s) {
    // TODO: reverse s in-place using two pointers
}

const s = ["h","e","l","l","o"];
reverseString(s);
console.log(s.join("")); // "olleh"`,
      java: `import java.util.*;

public class Main {
    public static void reverseString(char[] s) {
        // TODO: reverse s in-place using two pointers
    }

    public static void main(String[] args) {
        char[] s = {'h', 'e', 'l', 'l', 'o'};
        reverseString(s);
        System.out.println(new String(s)); // "olleh"
    }
}`,
      rust: `fn reverse_string(s: &mut Vec<char>) {
    // TODO: reverse s in-place using two pointers
}

fn main() {
    let mut s: Vec<char> = "hello".chars().collect();
    reverse_string(&mut s);
    let result: String = s.into_iter().collect();
    println!("{}", result); // "olleh"
}`,
    },
    testCases: [
      { stdin: "hello", expectedOutput: "olleh" },
      { stdin: "Hannah", expectedOutput: "hannaH" },
      { stdin: "a", expectedOutput: "a" },
      { stdin: "ab", expectedOutput: "ba" },
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
\t\ts := []byte(scanner.Text())
\t\tif len(s) == 0 { continue }
\t\treverseString(s)
\t\tfmt.Println(string(s))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  s = list(line.strip())
  if not s: continue
  reverse_string(s)
  print("".join(s))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const s = lineRaw.trim();
  if (!s) continue;
  const arr = s.split("");
  reverseString(arr);
  console.log(arr.join(""));
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
    vector<char> s(line.begin(), line.end());
    reverseString(s);
    for (char c : s) cout << c;
    cout << "\\n";
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
      char[] s = line.toCharArray();
      reverseString(s);
      System.out.println(new String(s));
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
    let mut s: Vec<char> = line.chars().collect();
    reverse_string(&mut s);
    let out: String = s.into_iter().collect();
    println!(\"{}\", out);
  }
}
`,
    },
  },
  {
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    description:
      "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?\n\nHint: This is the Fibonacci sequence — the number of ways to reach step n equals ways(n-1) + ways(n-2).",
    difficulty: "easy",
    examples: [
      { input: "n = 2", output: "2", explanation: "1+1 or 2." },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, or 2+1." },
    ],
    starter: {
      go: `package main

import "fmt"

func climbStairs(n int) int {
\t// TODO: use dynamic programming (Fibonacci pattern)
\treturn 0
}

func main() {
\tfmt.Println(climbStairs(2)) // 2
\tfmt.Println(climbStairs(3)) // 3
\tfmt.Println(climbStairs(5)) // 8
}`,
      python: `def climb_stairs(n: int) -> int:
    # TODO: use dynamic programming (Fibonacci pattern)
    return 0

print(climb_stairs(2))  # 2
print(climb_stairs(3))  # 3
print(climb_stairs(5))  # 8`,
      cpp: `#include <iostream>
using namespace std;

int climbStairs(int n) {
    // TODO: use dynamic programming (Fibonacci pattern)
    return 0;
}

int main() {
    cout << climbStairs(2) << endl; // 2
    cout << climbStairs(3) << endl; // 3
    cout << climbStairs(5) << endl; // 8
    return 0;
}`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    // TODO: use dynamic programming (Fibonacci pattern)
    return 0;
}

console.log(climbStairs(2)); // 2
console.log(climbStairs(3)); // 3
console.log(climbStairs(5)); // 8`,
      java: `public class Main {
    public static int climbStairs(int n) {
        // TODO: use dynamic programming (Fibonacci pattern)
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(climbStairs(2)); // 2
        System.out.println(climbStairs(3)); // 3
        System.out.println(climbStairs(5)); // 8
    }
}`,
      rust: `fn climb_stairs(n: u32) -> u32 {
    // TODO: use dynamic programming (Fibonacci pattern)
    0
}

fn main() {
    println!("{}", climb_stairs(2)); // 2
    println!("{}", climb_stairs(3)); // 3
    println!("{}", climb_stairs(5)); // 8
}`,
    },
    testCases: [
      { stdin: "2", expectedOutput: "2" },
      { stdin: "3", expectedOutput: "3" },
      { stdin: "5", expectedOutput: "8" },
      { stdin: "10", expectedOutput: "89" },
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
\t\tline := strings.TrimSpace(scanner.Text())
\t\tif line == "" { continue }
\t\tn, _ := strconv.Atoi(line)
\t\tfmt.Println(climbStairs(n))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  n = int(line)
  print(climb_stairs(n))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const n = Number(line);
  console.log(String(climbStairs(n)));
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
    line.erase(0, line.find_first_not_of(" \t\r\n"));
    line.erase(line.find_last_not_of(" \t\r\n") + 1);
    if (line.empty()) continue;
    int n = stoi(line);
    cout << climbStairs(n) << "\\n";
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
      int n = Integer.parseInt(line);
      System.out.println(climbStairs(n));
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
    let n: u32 = line.parse().unwrap_or(0);
    println!(\"{}\", climb_stairs(n));
  }
}
`,
    },
  },
];
