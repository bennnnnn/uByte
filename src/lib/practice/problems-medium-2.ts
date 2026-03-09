import type { PracticeProblem } from "./types";

export const MEDIUM_PROBLEMS_2: PracticeProblem[] = [
  // ── 1. Product of Array Except Self ─────────────────────────────────────
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    category: "array",
    difficulty: "medium",
    description:
      "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`.\n\nYou must write an algorithm that runs in **O(n)** time and without using the division operation.\n\nHint: Build a prefix-products array left to right, then multiply with suffix products right to left in a single pass.",
    examples: [
      {
        input: "nums = [1, 2, 3, 4]",
        output: "[24, 12, 8, 6]",
        explanation: "24=2×3×4, 12=1×3×4, 8=1×2×4, 6=1×2×3.",
      },
      { input: "nums = [-1, 1, 0, -3, 3]", output: "[0, 0, 9, 0, 0]" },
    ],
    starter: {
      go: `package main

import "fmt"

func productExceptSelf(nums []int) []int {
\t// TODO: prefix pass, then suffix pass — no division
\treturn nil
}

func main() {
\tfmt.Println(productExceptSelf([]int{1, 2, 3, 4}))        // [24 12 8 6]
\tfmt.Println(productExceptSelf([]int{-1, 1, 0, -3, 3}))   // [0 0 9 0 0]
}`,
      python: `def product_except_self(nums: list[int]) -> list[int]:
    # TODO: prefix pass, then suffix pass — no division
    return []

print(product_except_self([1, 2, 3, 4]))         # [24, 12, 8, 6]
print(product_except_self([-1, 1, 0, -3, 3]))    # [0, 0, 9, 0, 0]`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> productExceptSelf(vector<int>& nums) {
    // TODO: prefix pass, then suffix pass
    return {};
}

int main() {
    vector<int> a = {1, 2, 3, 4};
    auto r = productExceptSelf(a);
    cout << "[";
    for (int i = 0; i < (int)r.size(); i++) { if (i) cout << " "; cout << r[i]; }
    cout << "]" << endl;
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
    // TODO: prefix pass, then suffix pass — no division
    return [];
}

const r = productExceptSelf([1, 2, 3, 4]);
console.log("[" + r.join(" ") + "]"); // [24 12 8 6]`,
      java: `public class Main {
    public static int[] productExceptSelf(int[] nums) {
        // TODO: prefix pass, then suffix pass
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] r = productExceptSelf(new int[]{1, 2, 3, 4});
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(' '); sb.append(r[i]); }
        System.out.println(sb.append(']')); // [24 12 8 6]
    }
}`,
      rust: `fn product_except_self(nums: Vec<i32>) -> Vec<i32> {
    // TODO: prefix pass, then suffix pass
    vec![]
}

fn main() {
    println!("{:?}", product_except_self(vec![1, 2, 3, 4])); // [24, 12, 8, 6]
}`,
    },
    testCases: [
      { stdin: "1 2 3 4", expectedOutput: "[24 12 8 6]" },
      { stdin: "-1 1 0 -3 3", expectedOutput: "[0 0 9 0 0]" },
      { stdin: "2 3", expectedOutput: "[3 2]" },
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
\t\tfmt.Println(productExceptSelf(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(product_except_self(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).filter(Boolean).map(Number);
  const res = productExceptSelf(nums);
  console.log("[" + res.join(" ") + "]");
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
    vector<int> nums;
    { istringstream iss(line); int x; while (iss >> x) nums.push_back(x); }
    auto res = productExceptSelf(nums);
    cout << "[";
    for (size_t i = 0; i < res.size(); i++) { if (i) cout << " "; cout << res[i]; }
    cout << "]\\n";
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
      int[] nums = new int[parts.length];
      for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
      int[] res = productExceptSelf(nums);
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < res.length; i++) { if (i > 0) sb.append(' '); sb.append(res[i]); }
      System.out.println(sb.append(']'));
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
    let res = product_except_self(nums);
    let parts: Vec<String> = res.iter().map(|x| x.to_string()).collect();
    println!(\"[{}]\", parts.join(\" \"));
  }
}
`,
    },
  },

  // ── 2. House Robber ──────────────────────────────────────────────────────
  {
    slug: "house-robber",
    title: "House Robber",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money. You cannot rob two adjacent houses (the alarm will trigger).\n\nGiven an integer array `nums` representing each house's money, return the maximum amount you can rob.\n\nHint: DP — at each house you either rob it (plus best from 2 before) or skip it (best from previous house). `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`.",
    examples: [
      { input: "nums = [1, 2, 3, 1]", output: "4", explanation: "Rob house 1 (1) + house 3 (3) = 4." },
      { input: "nums = [2, 7, 9, 3, 1]", output: "12", explanation: "Rob house 1 (2) + house 3 (9) + house 5 (1) = 12." },
    ],
    starter: {
      go: `package main

import "fmt"

func rob(nums []int) int {
\t// TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
\treturn 0
}

func main() {
\tfmt.Println(rob([]int{1, 2, 3, 1}))    // 4
\tfmt.Println(rob([]int{2, 7, 9, 3, 1})) // 12
}`,
      python: `def rob(nums: list[int]) -> int:
    # TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return 0

print(rob([1, 2, 3, 1]))    # 4
print(rob([2, 7, 9, 3, 1])) # 12`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int rob(vector<int>& nums) {
    // TODO: dp — track two previous values
    return 0;
}

int main() {
    vector<int> a = {1, 2, 3, 1};
    vector<int> b = {2, 7, 9, 3, 1};
    cout << rob(a) << endl; // 4
    cout << rob(b) << endl; // 12
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function rob(nums) {
    // TODO: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return 0;
}

console.log(rob([1, 2, 3, 1]));    // 4
console.log(rob([2, 7, 9, 3, 1])); // 12`,
      java: `public class Main {
    public static int rob(int[] nums) {
        // TODO: dp — track two previous values
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(rob(new int[]{1, 2, 3, 1}));    // 4
        System.out.println(rob(new int[]{2, 7, 9, 3, 1})); // 12
    }
}`,
      rust: `fn rob(nums: Vec<i32>) -> i32 {
    // TODO: dp — track two previous values
    0
}

fn main() {
    println!("{}", rob(vec![1, 2, 3, 1]));    // 4
    println!("{}", rob(vec![2, 7, 9, 3, 1])); // 12
}`,
    },
    testCases: [
      { stdin: "1 2 3 1", expectedOutput: "4" },
      { stdin: "2 7 9 3 1", expectedOutput: "12" },
      { stdin: "1 2", expectedOutput: "2" },
      { stdin: "5", expectedOutput: "5" },
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
\t\tfmt.Println(rob(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(rob(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).filter(Boolean).map(Number);
  console.log(String(rob(nums)));
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
    vector<int> nums;
    { istringstream iss(line); int x; while (iss >> x) nums.push_back(x); }
    cout << rob(nums) << "\\n";
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
      int[] nums = new int[parts.length];
      for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
      System.out.println(rob(nums));
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
    println!(\"{}\", rob(nums));
  }
}
`,
    },
  },

  // ── 3. Coin Change ───────────────────────────────────────────────────────
  {
    slug: "coin-change",
    title: "Coin Change",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins needed to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n\nHint: Bottom-up DP — `dp[i] = min(dp[i], dp[i - coin] + 1)` for each coin.",
    examples: [
      { input: "coins = [1, 5, 10], amount = 11", output: "2", explanation: "10 + 1 = 11 using 2 coins." },
      { input: "coins = [2], amount = 3", output: "-1", explanation: "Cannot make 3 with only 2-cent coins." },
      { input: "coins = [1, 2, 5], amount = 11", output: "3", explanation: "5 + 5 + 1 = 11 using 3 coins." },
    ],
    starter: {
      go: `package main

import "fmt"

func coinChange(coins []int, amount int) int {
\t// TODO: bottom-up DP — dp[i] = min coins to make i
\treturn -1
}

func main() {
\tfmt.Println(coinChange([]int{1, 5, 10}, 11)) // 2
\tfmt.Println(coinChange([]int{2}, 3))          // -1
\tfmt.Println(coinChange([]int{1, 2, 5}, 11))  // 3
}`,
      python: `def coin_change(coins: list[int], amount: int) -> int:
    # TODO: bottom-up DP
    return -1

print(coin_change([1, 5, 10], 11))  # 2
print(coin_change([2], 3))           # -1
print(coin_change([1, 2, 5], 11))   # 3`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    // TODO: bottom-up DP
    return -1;
}

int main() {
    vector<int> a = {1, 5, 10};
    vector<int> b = {2};
    cout << coinChange(a, 11) << endl; // 2
    cout << coinChange(b, 3)  << endl; // -1
    return 0;
}`,
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
    // TODO: bottom-up DP
    return -1;
}

console.log(coinChange([1, 5, 10], 11)); // 2
console.log(coinChange([2], 3));          // -1
console.log(coinChange([1, 2, 5], 11));  // 3`,
      java: `import java.util.*;

public class Main {
    public static int coinChange(int[] coins, int amount) {
        // TODO: bottom-up DP
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(coinChange(new int[]{1, 5, 10}, 11)); // 2
        System.out.println(coinChange(new int[]{2}, 3));          // -1
    }
}`,
      rust: `fn coin_change(coins: Vec<i32>, amount: i32) -> i32 {
    // TODO: bottom-up DP
    -1
}

fn main() {
    println!("{}", coin_change(vec![1, 5, 10], 11)); // 2
    println!("{}", coin_change(vec![2], 3));           // -1
    println!("{}", coin_change(vec![1, 2, 5], 11));   // 3
}`,
    },
    testCases: [
      { stdin: "1 5 10|11", expectedOutput: "2" },
      { stdin: "2|3", expectedOutput: "-1" },
      { stdin: "1 2 5|11", expectedOutput: "3" },
      { stdin: "1|0", expectedOutput: "0" },
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
\t\tcoinStrs := strings.Fields(parts[0])
\t\tcoins := make([]int, len(coinStrs))
\t\tfor i, s := range coinStrs { coins[i], _ = strconv.Atoi(s) }
\t\tamount, _ := strconv.Atoi(strings.TrimSpace(parts[1]))
\t\tfmt.Println(coinChange(coins, amount))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  a, _, b = line.partition("|")
  coins = [int(x) for x in a.split()]
  amount = int(b.strip())
  print(coin_change(coins, amount))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const [a, b] = line.split("|");
  const coins = a.trim().split(/\s+/).filter(Boolean).map(Number);
  const amount = Number((b ?? "0").trim());
  console.log(String(coinChange(coins, amount)));
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
    auto bar = line.find('|');
    string a = line.substr(0, bar);
    string b = (bar == string::npos) ? "0" : line.substr(bar + 1);
    vector<int> coins;
    { istringstream iss(a); int x; while (iss >> x) coins.push_back(x); }
    int amount = 0; { istringstream iss(b); iss >> amount; }
    cout << coinChange(coins, amount) << "\\n";
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
      String[] cs = parts[0].trim().split("\\\\s+");
      int[] coins = new int[cs.length];
      for (int i = 0; i < cs.length; i++) coins[i] = Integer.parseInt(cs[i]);
      int amount = Integer.parseInt(parts.length > 1 ? parts[1].trim() : "0");
      System.out.println(coinChange(coins, amount));
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
    let a = it.next().unwrap_or(\"\");
    let b = it.next().unwrap_or(\"0\");
    let coins: Vec<i32> = a.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    let amount: i32 = b.trim().parse().unwrap_or(0);
    println!(\"{}\", coin_change(coins, amount));
  }
}
`,
    },
  },

  // ── 4. Find Minimum in Rotated Sorted Array ──────────────────────────────
  {
    slug: "find-minimum-rotated-sorted-array",
    title: "Find Minimum in Rotated Sorted Array",
    category: "binary-search",
    difficulty: "medium",
    description:
      "Suppose a sorted array of unique elements has been **rotated** at some pivot. For example, `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`.\n\nGiven such an array `nums`, return the **minimum element**.\n\nYou must write an algorithm that runs in **O(log n)** time.\n\nHint: Binary search — if `nums[mid] > nums[right]`, the min is in the right half; otherwise it's in the left half (including `mid`).",
    examples: [
      { input: "nums = [3, 4, 5, 1, 2]", output: "1" },
      { input: "nums = [4, 5, 6, 7, 0, 1, 2]", output: "0" },
      { input: "nums = [11, 13, 15, 17]", output: "11", explanation: "Not rotated — minimum is first element." },
    ],
    starter: {
      go: `package main

import "fmt"

func findMin(nums []int) int {
\t// TODO: binary search — if nums[mid] > nums[right], min is right half
\treturn nums[0]
}

func main() {
\tfmt.Println(findMin([]int{3, 4, 5, 1, 2}))       // 1
\tfmt.Println(findMin([]int{4, 5, 6, 7, 0, 1, 2})) // 0
\tfmt.Println(findMin([]int{11, 13, 15, 17}))       // 11
}`,
      python: `def find_min(nums: list[int]) -> int:
    # TODO: binary search
    return nums[0]

print(find_min([3, 4, 5, 1, 2]))        # 1
print(find_min([4, 5, 6, 7, 0, 1, 2]))  # 0
print(find_min([11, 13, 15, 17]))        # 11`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int findMin(vector<int>& nums) {
    // TODO: binary search
    return nums[0];
}

int main() {
    vector<int> a = {3, 4, 5, 1, 2};
    vector<int> b = {4, 5, 6, 7, 0, 1, 2};
    cout << findMin(a) << endl; // 1
    cout << findMin(b) << endl; // 0
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMin(nums) {
    // TODO: binary search
    return nums[0];
}

console.log(findMin([3, 4, 5, 1, 2]));        // 1
console.log(findMin([4, 5, 6, 7, 0, 1, 2]));  // 0
console.log(findMin([11, 13, 15, 17]));        // 11`,
      java: `public class Main {
    public static int findMin(int[] nums) {
        // TODO: binary search
        return nums[0];
    }

    public static void main(String[] args) {
        System.out.println(findMin(new int[]{3, 4, 5, 1, 2}));        // 1
        System.out.println(findMin(new int[]{4, 5, 6, 7, 0, 1, 2}));  // 0
        System.out.println(findMin(new int[]{11, 13, 15, 17}));        // 11
    }
}`,
      rust: `fn find_min(nums: Vec<i32>) -> i32 {
    // TODO: binary search
    nums[0]
}

fn main() {
    println!("{}", find_min(vec![3, 4, 5, 1, 2]));        // 1
    println!("{}", find_min(vec![4, 5, 6, 7, 0, 1, 2]));  // 0
    println!("{}", find_min(vec![11, 13, 15, 17]));        // 11
}`,
    },
    testCases: [
      { stdin: "3 4 5 1 2", expectedOutput: "1" },
      { stdin: "4 5 6 7 0 1 2", expectedOutput: "0" },
      { stdin: "11 13 15 17", expectedOutput: "11" },
      { stdin: "1", expectedOutput: "1" },
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
\t\tfmt.Println(findMin(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(find_min(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).filter(Boolean).map(Number);
  console.log(String(findMin(nums)));
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
    vector<int> nums;
    { istringstream iss(line); int x; while (iss >> x) nums.push_back(x); }
    cout << findMin(nums) << "\\n";
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
      int[] nums = new int[parts.length];
      for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
      System.out.println(findMin(nums));
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
    println!(\"{}\", find_min(nums));
  }
}
`,
    },
  },

  // ── 5. Maximum Product Subarray ──────────────────────────────────────────
  {
    slug: "max-product-subarray",
    title: "Maximum Product Subarray",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "Given an integer array `nums`, find a subarray that has the largest product, and return the product.\n\nThe test cases are generated so that the answer will fit in a 32-bit integer.\n\nHint: Track both the maximum and minimum product ending at each position — a negative minimum can become the new maximum when multiplied by another negative.",
    examples: [
      { input: "nums = [2, 3, -2, 4]", output: "6", explanation: "Subarray [2, 3] has the largest product 6." },
      { input: "nums = [-2, 0, -1]", output: "0", explanation: "The result cannot be 2 because [-2,-1] is not a contiguous subarray." },
      { input: "nums = [-2, 3, -4]", output: "24" },
    ],
    starter: {
      go: `package main

import "fmt"

func maxProduct(nums []int) int {
\t// TODO: track curMax, curMin (negatives flip) and globalMax
\treturn nums[0]
}

func main() {
\tfmt.Println(maxProduct([]int{2, 3, -2, 4}))  // 6
\tfmt.Println(maxProduct([]int{-2, 0, -1}))     // 0
\tfmt.Println(maxProduct([]int{-2, 3, -4}))     // 24
}`,
      python: `def max_product(nums: list[int]) -> int:
    # TODO: track cur_max, cur_min (negatives flip) and global_max
    return nums[0]

print(max_product([2, 3, -2, 4]))   # 6
print(max_product([-2, 0, -1]))     # 0
print(max_product([-2, 3, -4]))     # 24`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxProduct(vector<int>& nums) {
    // TODO: track curMax, curMin
    return nums[0];
}

int main() {
    vector<int> a = {2, 3, -2, 4};
    vector<int> b = {-2, 0, -1};
    cout << maxProduct(a) << endl; // 6
    cout << maxProduct(b) << endl; // 0
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxProduct(nums) {
    // TODO: track curMax, curMin
    return nums[0];
}

console.log(maxProduct([2, 3, -2, 4]));  // 6
console.log(maxProduct([-2, 0, -1]));     // 0
console.log(maxProduct([-2, 3, -4]));     // 24`,
      java: `public class Main {
    public static int maxProduct(int[] nums) {
        // TODO: track curMax, curMin
        return nums[0];
    }

    public static void main(String[] args) {
        System.out.println(maxProduct(new int[]{2, 3, -2, 4}));  // 6
        System.out.println(maxProduct(new int[]{-2, 0, -1}));     // 0
        System.out.println(maxProduct(new int[]{-2, 3, -4}));     // 24
    }
}`,
      rust: `fn max_product(nums: Vec<i32>) -> i32 {
    // TODO: track cur_max, cur_min
    nums[0]
}

fn main() {
    println!("{}", max_product(vec![2, 3, -2, 4]));  // 6
    println!("{}", max_product(vec![-2, 0, -1]));     // 0
    println!("{}", max_product(vec![-2, 3, -4]));     // 24
}`,
    },
    testCases: [
      { stdin: "2 3 -2 4", expectedOutput: "6" },
      { stdin: "-2 0 -1", expectedOutput: "0" },
      { stdin: "-2 3 -4", expectedOutput: "24" },
      { stdin: "1", expectedOutput: "1" },
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
\t\tfmt.Println(maxProduct(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(max_product(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).filter(Boolean).map(Number);
  console.log(String(maxProduct(nums)));
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
    vector<int> nums;
    { istringstream iss(line); int x; while (iss >> x) nums.push_back(x); }
    cout << maxProduct(nums) << "\\n";
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
      int[] nums = new int[parts.length];
      for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
      System.out.println(maxProduct(nums));
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
    println!(\"{}\", max_product(nums));
  }
}
`,
    },
  },

  // ── 6. Search in Rotated Sorted Array ────────────────────────────────────
  {
    slug: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    category: "binary-search",
    difficulty: "medium",
    description:
      "Given a rotated sorted array `nums` (with unique values) and a `target`, return the **index** of `target` if it is in the array, or `-1` otherwise.\n\nYou must write an algorithm with **O(log n)** runtime complexity.\n\nHint: In each binary search step, one half is always sorted — use that to decide which half to search next.",
    examples: [
      { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 0", output: "4" },
      { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 3", output: "-1" },
      { input: "nums = [1], target = 0", output: "-1" },
    ],
    starter: {
      go: `package main

import "fmt"

func search(nums []int, target int) int {
\t// TODO: modified binary search — one half is always sorted
\treturn -1
}

func main() {
\tfmt.Println(search([]int{4, 5, 6, 7, 0, 1, 2}, 0)) // 4
\tfmt.Println(search([]int{4, 5, 6, 7, 0, 1, 2}, 3)) // -1
\tfmt.Println(search([]int{1}, 0))                    // -1
}`,
      python: `def search(nums: list[int], target: int) -> int:
    # TODO: modified binary search
    return -1

print(search([4, 5, 6, 7, 0, 1, 2], 0))  # 4
print(search([4, 5, 6, 7, 0, 1, 2], 3))  # -1
print(search([1], 0))                      # -1`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int search(vector<int>& nums, int target) {
    // TODO: modified binary search
    return -1;
}

int main() {
    vector<int> a = {4, 5, 6, 7, 0, 1, 2};
    cout << search(a, 0) << endl; // 4
    cout << search(a, 3) << endl; // -1
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    // TODO: modified binary search
    return -1;
}

console.log(search([4, 5, 6, 7, 0, 1, 2], 0)); // 4
console.log(search([4, 5, 6, 7, 0, 1, 2], 3)); // -1
console.log(search([1], 0));                     // -1`,
      java: `public class Main {
    public static int search(int[] nums, int target) {
        // TODO: modified binary search
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(search(new int[]{4, 5, 6, 7, 0, 1, 2}, 0)); // 4
        System.out.println(search(new int[]{4, 5, 6, 7, 0, 1, 2}, 3)); // -1
        System.out.println(search(new int[]{1}, 0));                     // -1
    }
}`,
      rust: `fn search(nums: Vec<i32>, target: i32) -> i32 {
    // TODO: modified binary search
    -1
}

fn main() {
    println!("{}", search(vec![4, 5, 6, 7, 0, 1, 2], 0)); // 4
    println!("{}", search(vec![4, 5, 6, 7, 0, 1, 2], 3)); // -1
    println!("{}", search(vec![1], 0));                     // -1
}`,
    },
    testCases: [
      { stdin: "4 5 6 7 0 1 2|0", expectedOutput: "4" },
      { stdin: "4 5 6 7 0 1 2|3", expectedOutput: "-1" },
      { stdin: "1|0", expectedOutput: "-1" },
      { stdin: "1 3|3", expectedOutput: "1" },
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
\t\tfmt.Println(search(nums, target))
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
  print(search(nums, target))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const [a, b] = line.split("|");
  const nums = a.trim().split(/\s+/).filter(Boolean).map(Number);
  const target = Number((b ?? "0").trim());
  console.log(String(search(nums, target)));
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
    auto bar = line.find('|');
    string a = line.substr(0, bar);
    string b = (bar == string::npos) ? "0" : line.substr(bar + 1);
    vector<int> nums;
    { istringstream iss(a); int x; while (iss >> x) nums.push_back(x); }
    int target = 0; { istringstream iss(b); iss >> target; }
    cout << search(nums, target) << "\\n";
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
      String[] ns = parts[0].trim().split("\\\\s+");
      int[] nums = new int[ns.length];
      for (int i = 0; i < ns.length; i++) nums[i] = Integer.parseInt(ns[i]);
      int target = Integer.parseInt(parts.length > 1 ? parts[1].trim() : "0");
      System.out.println(search(nums, target));
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
    let a = it.next().unwrap_or(\"\");
    let b = it.next().unwrap_or(\"0\");
    let nums: Vec<i32> = a.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    let target: i32 = b.trim().parse().unwrap_or(0);
    println!(\"{}\", search(nums, target));
  }
}
`,
    },
  },
];
