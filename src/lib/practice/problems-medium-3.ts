import type { PracticeProblem } from "./types";

export const MEDIUM_PROBLEMS_3: PracticeProblem[] = [
  // ─── 1. Permutation in String ────────────────────────────────────────────────
  {
    slug: "permutation-in-string",
    title: "Permutation in String",
    category: "sliding-window",
    difficulty: "medium",
    description:
      "Given two strings `s1` and `s2`, return `true` if `s2` **contains a permutation** of `s1`, or `false` otherwise.\n\nIn other words, return `true` if one of `s1`'s permutations is a substring of `s2`.\n\n**Constraints:**\n- `1 <= s1.length, s2.length <= 10⁴`\n- `s1` and `s2` consist of lowercase English letters.\n\n**Hint:** Use a sliding window of size `len(s1)` over `s2`, maintaining character frequency counts.",
    examples: [
      { input: 's1 = "ab", s2 = "eidbaooo"', output: "true", explanation: 'Permutation "ba" is a substring.' },
      { input: 's1 = "ab", s2 = "eidboaoo"', output: "false" },
    ],
    starter: {
      go: `package main

import "fmt"

func checkInclusion(s1 string, s2 string) bool {
\t// TODO: return true if any permutation of s1 exists in s2
\t// Hint: sliding window of size len(s1), compare frequency arrays
\treturn false
}

func main() {
\tfmt.Println(checkInclusion("ab", "eidbaooo")) // true
\tfmt.Println(checkInclusion("ab", "eidboaoo")) // false
}`,
      python: `def check_inclusion(s1: str, s2: str) -> bool:
    # TODO: return True if any permutation of s1 exists in s2
    # Hint: sliding window + character frequency counts
    return False

if __name__ == "__main__":
    print(check_inclusion("ab", "eidbaooo"))  # True
    print(check_inclusion("ab", "eidboaoo"))  # False
`,
      javascript: `/**
 * @param {string} s1
 * @param {string} s2
 * @return {boolean}
 */
function checkInclusion(s1, s2) {
    // TODO: return true if any permutation of s1 exists in s2
    return false;
}

console.log(checkInclusion("ab", "eidbaooo")); // true
console.log(checkInclusion("ab", "eidboaoo")); // false`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

bool checkInclusion(string s1, string s2) {
    // TODO: return true if any permutation of s1 exists in s2
    return false;
}

int main() {
    cout << (checkInclusion("ab", "eidbaooo") ? "true" : "false") << endl;
    cout << (checkInclusion("ab", "eidboaoo") ? "true" : "false") << endl;
    return 0;
}`,
      java: `public class Main {
    public static boolean checkInclusion(String s1, String s2) {
        // TODO: return true if any permutation of s1 exists in s2
        return false;
    }

    public static void main(String[] args) {
        System.out.println(checkInclusion("ab", "eidbaooo")); // true
        System.out.println(checkInclusion("ab", "eidboaoo")); // false
    }
}`,
      rust: `fn check_inclusion(s1: String, s2: String) -> bool {
    // TODO: return true if any permutation of s1 exists in s2
    false
}

fn main() {
    println!("{}", check_inclusion("ab".to_string(), "eidbaooo".to_string())); // true
    println!("{}", check_inclusion("ab".to_string(), "eidboaoo".to_string())); // false
}`,
    },
    testCases: [
      { stdin: "ab|eidbaooo", expectedOutput: "true" },
      { stdin: "ab|eidboaoo", expectedOutput: "false" },
      { stdin: "a|ab", expectedOutput: "true" },
      { stdin: "abc|bbbca", expectedOutput: "true" },
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
\t\ts1, s2 := p[0], ""; if len(p) > 1 { s2 = p[1] }
\t\tfmt.Println(checkInclusion(s1, s2))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    s1, _, s2 = line.partition("|")
    print(str(check_inclusion(s1, s2)).lower())
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [s1, s2] = l.split("|");
  console.log(checkInclusion(s1 || "", s2 || "") ? "true" : "false");
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    string s1 = line.substr(0, bar), s2 = (bar==string::npos)?"":line.substr(bar+1);
    cout << (checkInclusion(s1, s2) ? "true" : "false") << "\\n";
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
      String s1 = p[0], s2 = p.length > 1 ? p[1] : "";
      System.out.println(checkInclusion(s1, s2) ? "true" : "false");
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
    let s1 = p[0].to_string(); let s2 = if p.len()>1{p[1].to_string()}else{String::new()};
    println!("{}", check_inclusion(s1, s2));
  }
}`,
    },
  },

  // ─── 2. Top K Frequent Elements ──────────────────────────────────────────────
  {
    slug: "top-k-frequent",
    title: "Top K Frequent Elements",
    category: "hash-map",
    difficulty: "medium",
    description:
      "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. Return them **sorted in ascending order**.\n\nYou may assume the answer is unique — there is always exactly one answer with a unique top-k.\n\n**Constraints:**\n- `1 <= nums.length <= 10⁵`\n- `-10⁴ <= nums[i] <= 10⁴`\n- `k` is in the range `[1, number of unique elements]`\n\n**Hint:** Use a hash map for counts, then sort by frequency.",
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", explanation: "1 appears 3x, 2 appears 2x." },
      { input: "nums = [1], k = 1", output: "[1]" },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"sort"
)

func topKFrequent(nums []int, k int) []int {
\t// TODO: return k most frequent elements, sorted ascending
\treturn nil
}

func main() {
\tres := topKFrequent([]int{1, 1, 1, 2, 2, 3}, 2)
\tsort.Ints(res)
\tfmt.Println(res) // [1 2]
}`,
      python: `def top_k_frequent(nums: list[int], k: int) -> list[int]:
    # TODO: return k most frequent elements
    return []

if __name__ == "__main__":
    res = sorted(top_k_frequent([1, 1, 1, 2, 2, 3], 2))
    print(res)  # [1, 2]
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function topKFrequent(nums, k) {
    // TODO: return k most frequent elements
    return [];
}

const res = topKFrequent([1, 1, 1, 2, 2, 3], 2).sort((a,b)=>a-b);
console.log(res); // [1, 2]`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <unordered_map>
using namespace std;

vector<int> topKFrequent(vector<int>& nums, int k) {
    // TODO: return k most frequent elements
    return {};
}

int main() {
    vector<int> nums = {1,1,1,2,2,3};
    auto res = topKFrequent(nums, 2);
    sort(res.begin(), res.end());
    for (int x : res) cout << x << " ";
    cout << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static int[] topKFrequent(int[] nums, int k) {
        // TODO: return k most frequent elements
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] res = topKFrequent(new int[]{1,1,1,2,2,3}, 2);
        Arrays.sort(res);
        System.out.println(Arrays.toString(res)); // [1, 2]
    }
}`,
      rust: `fn top_k_frequent(nums: Vec<i32>, k: i32) -> Vec<i32> {
    // TODO: return k most frequent elements
    vec![]
}

fn main() {
    let mut res = top_k_frequent(vec![1,1,1,2,2,3], 2);
    res.sort();
    println!("{:?}", res); // [1, 2]
}`,
    },
    testCases: [
      { stdin: "1 1 1 2 2 3|2", expectedOutput: "[1 2]" },
      { stdin: "1|1", expectedOutput: "[1]" },
      { stdin: "4 4 4 1 1 2|2", expectedOutput: "[1 4]" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"sort";"strconv";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tp := strings.SplitN(l, "|", 2)
\t\tparts := strings.Fields(p[0])
\t\tnums := make([]int, len(parts))
\t\tfor i, s := range parts { nums[i], _ = strconv.Atoi(s) }
\t\tk, _ := strconv.Atoi(strings.TrimSpace(p[1]))
\t\tres := topKFrequent(nums, k)
\t\tsort.Ints(res)
\t\tfmt.Println(res)
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    a, _, b = line.partition("|")
    nums = list(map(int, a.split()))
    k = int(b.strip())
    res = sorted(top_k_frequent(nums, k))
    print(res)
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
function fmt(v) { return "[" + v.join(" ") + "]"; }
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [a, b] = l.split("|");
  const nums = a.trim().split(/\s+/).map(Number);
  const k = Number(b.trim());
  const res = topKFrequent(nums, k).sort((x,y)=>x-y);
  console.log(fmt(res));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    string a = line.substr(0,bar), b = line.substr(bar+1);
    vector<int> nums; { istringstream iss(a); int x; while(iss>>x) nums.push_back(x); }
    int k; { istringstream iss(b); iss>>k; }
    auto res = topKFrequent(nums, k);
    sort(res.begin(), res.end());
    cout<<"["; for(size_t i=0;i<res.size();i++){if(i)cout<<" ";cout<<res[i];} cout<<"]\\n";
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
      String[] p = line.split("\\|", 2);
      String[] ns = p[0].trim().split("\\s+");
      int[] nums = new int[ns.length];
      for (int i=0;i<ns.length;i++) nums[i]=Integer.parseInt(ns[i]);
      int k = Integer.parseInt(p[1].trim());
      int[] res = topKFrequent(nums, k);
      Arrays.sort(res);
      StringBuilder sb = new StringBuilder("[");
      for (int i=0;i<res.length;i++){if(i>0)sb.append(" ");sb.append(res[i]);}
      sb.append("]"); System.out.println(sb);
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
    let nums: Vec<i32> = p[0].split_whitespace().filter_map(|s|s.parse().ok()).collect();
    let k: i32 = p[1].trim().parse().unwrap_or(1);
    let mut res = top_k_frequent(nums, k);
    res.sort();
    let inner: Vec<String> = res.iter().map(|x|x.to_string()).collect();
    println!("[{}]", inner.join(" "));
  }
}`,
    },
  },

  // ─── 3. Jump Game ────────────────────────────────────────────────────────────
  {
    slug: "jump-game",
    title: "Jump Game",
    category: "greedy",
    difficulty: "medium",
    description:
      "You are given an integer array `nums`. You are initially positioned at the **first index** and each element represents your maximum jump length from that position.\n\nReturn `true` if you can reach the last index, or `false` otherwise.\n\n**Constraints:**\n- `1 <= nums.length <= 10⁴`\n- `0 <= nums[i] <= 10⁵`\n\n**Hint:** Track the farthest index you can reach at each step.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true", explanation: "Jump 1 to index 1, then 3 to the last." },
      { input: "nums = [3,2,1,0,4]", output: "false", explanation: "Always stuck at index 3." },
    ],
    starter: {
      go: `package main

import "fmt"

func canJump(nums []int) bool {
\t// TODO: return true if you can reach the last index
\t// Hint: track maxReach at each index
\treturn false
}

func main() {
\tfmt.Println(canJump([]int{2, 3, 1, 1, 4})) // true
\tfmt.Println(canJump([]int{3, 2, 1, 0, 4})) // false
}`,
      python: `def can_jump(nums: list[int]) -> bool:
    # TODO: return True if you can reach the last index
    return False

if __name__ == "__main__":
    print(can_jump([2, 3, 1, 1, 4]))  # True
    print(can_jump([3, 2, 1, 0, 4]))  # False
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function canJump(nums) {
    // TODO: return true if you can reach the last index
    return false;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

bool canJump(vector<int>& nums) {
    // TODO: return true if you can reach the last index
    return false;
}

int main() {
    vector<int> a = {2,3,1,1,4}, b = {3,2,1,0,4};
    cout << (canJump(a) ? "true" : "false") << endl;
    cout << (canJump(b) ? "true" : "false") << endl;
    return 0;
}`,
      java: `public class Main {
    public static boolean canJump(int[] nums) {
        // TODO: return true if you can reach the last index
        return false;
    }

    public static void main(String[] args) {
        System.out.println(canJump(new int[]{2,3,1,1,4})); // true
        System.out.println(canJump(new int[]{3,2,1,0,4})); // false
    }
}`,
      rust: `fn can_jump(nums: Vec<i32>) -> bool {
    // TODO: return true if you can reach the last index
    false
}

fn main() {
    println!("{}", can_jump(vec![2,3,1,1,4])); // true
    println!("{}", can_jump(vec![3,2,1,0,4])); // false
}`,
    },
    testCases: [
      { stdin: "2 3 1 1 4", expectedOutput: "true" },
      { stdin: "3 2 1 0 4", expectedOutput: "false" },
      { stdin: "0", expectedOutput: "true" },
      { stdin: "1 0 0 0", expectedOutput: "false" },
      { stdin: "2 0 0", expectedOutput: "true" },
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
\t\tnums := make([]int, len(parts))
\t\tfor i, s := range parts { nums[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(canJump(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    print(str(can_jump(nums)).lower())
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const nums = l.split(/\s+/).map(Number);
  console.log(canJump(nums) ? "true" : "false");
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    vector<int> nums; istringstream iss(line); int x;
    while (iss >> x) nums.push_back(x);
    cout << (canJump(nums) ? "true" : "false") << "\\n";
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
      int[] nums = new int[p.length];
      for (int i=0;i<p.length;i++) nums[i]=Integer.parseInt(p[i]);
      System.out.println(canJump(nums) ? "true" : "false");
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let nums: Vec<i32> = line.split_whitespace().filter_map(|s|s.parse().ok()).collect();
    println!("{}", can_jump(nums));
  }
}`,
    },
  },

  // ─── 4. Container With Most Water ────────────────────────────────────────────
  {
    slug: "container-with-most-water",
    title: "Container With Most Water",
    category: "two-pointers",
    difficulty: "medium",
    description:
      "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container that holds the most water. Return the **maximum amount of water** it can contain.\n\n**Constraints:**\n- `n == height.length`\n- `2 <= n <= 10⁵`\n- `0 <= height[i] <= 10⁴`\n\n**Hint:** Use two pointers from both ends. Move the pointer with the smaller height.",
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Lines at index 1 and 8 hold max water." },
      { input: "height = [1,1]", output: "1" },
    ],
    starter: {
      go: `package main

import "fmt"

func maxArea(height []int) int {
\t// TODO: find two lines forming the container with most water
\t// Hint: two-pointer from both ends, move the shorter side
\treturn 0
}

func main() {
\tfmt.Println(maxArea([]int{1, 8, 6, 2, 5, 4, 8, 3, 7})) // 49
\tfmt.Println(maxArea([]int{1, 1}))                        // 1
}`,
      python: `def max_area(height: list[int]) -> int:
    # TODO: find two lines forming the container with most water
    return 0

if __name__ == "__main__":
    print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
    print(max_area([1, 1]))                          # 1
`,
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
    // TODO: find two lines forming the container with most water
    return 0;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
console.log(maxArea([1, 1]));                        // 1`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int maxArea(vector<int>& height) {
    // TODO: find two lines forming the container with most water
    return 0;
}

int main() {
    vector<int> a = {1,8,6,2,5,4,8,3,7};
    cout << maxArea(a) << endl; // 49
    vector<int> b = {1,1};
    cout << maxArea(b) << endl; // 1
    return 0;
}`,
      java: `public class Main {
    public static int maxArea(int[] height) {
        // TODO: find two lines forming the container with most water
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxArea(new int[]{1,8,6,2,5,4,8,3,7})); // 49
        System.out.println(maxArea(new int[]{1,1}));                // 1
    }
}`,
      rust: `fn max_area(height: Vec<i32>) -> i32 {
    // TODO: find two lines forming the container with most water
    0
}

fn main() {
    println!("{}", max_area(vec![1,8,6,2,5,4,8,3,7])); // 49
    println!("{}", max_area(vec![1,1]));                // 1
}`,
    },
    testCases: [
      { stdin: "1 8 6 2 5 4 8 3 7", expectedOutput: "49" },
      { stdin: "1 1", expectedOutput: "1" },
      { stdin: "4 3 2 1 4", expectedOutput: "16" },
      { stdin: "1 2 1", expectedOutput: "2" },
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
\t\tnums := make([]int, len(parts))
\t\tfor i, s := range parts { nums[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(maxArea(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    print(max_area(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const nums = l.split(/\s+/).map(Number);
  console.log(maxArea(nums));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    vector<int> nums; istringstream iss(line); int x;
    while (iss >> x) nums.push_back(x);
    cout << maxArea(nums) << "\\n";
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
      int[] nums = new int[p.length];
      for (int i=0;i<p.length;i++) nums[i]=Integer.parseInt(p[i]);
      System.out.println(maxArea(nums));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let nums: Vec<i32> = line.split_whitespace().filter_map(|s|s.parse().ok()).collect();
    println!("{}", max_area(nums));
  }
}`,
    },
  },

  // ─── 5. Unique Paths ─────────────────────────────────────────────────────────
  {
    slug: "unique-paths",
    title: "Unique Paths",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "There is a robot on an `m x n` grid. The robot starts at the top-left corner and tries to reach the bottom-right corner.\n\nThe robot can only move **right** or **down** at any time.\n\nGiven the two integers `m` (rows) and `n` (columns), return the **number of unique paths** the robot can take.\n\n**Constraints:**\n- `1 <= m, n <= 100`\n\nInput format: `m|n`",
    examples: [
      { input: "m = 3, n = 7", output: "28" },
      { input: "m = 3, n = 2", output: "3", explanation: "Right→Down→Down, Down→Right→Down, Down→Down→Right." },
    ],
    starter: {
      go: `package main

import "fmt"

func uniquePaths(m int, n int) int {
\t// TODO: count unique paths from top-left to bottom-right
\t// Hint: dp[i][j] = dp[i-1][j] + dp[i][j-1]
\treturn 0
}

func main() {
\tfmt.Println(uniquePaths(3, 7)) // 28
\tfmt.Println(uniquePaths(3, 2)) // 3
}`,
      python: `def unique_paths(m: int, n: int) -> int:
    # TODO: count unique paths from top-left to bottom-right
    # Hint: dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return 0

if __name__ == "__main__":
    print(unique_paths(3, 7))  # 28
    print(unique_paths(3, 2))  # 3
`,
      javascript: `/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
function uniquePaths(m, n) {
    // TODO: count unique paths from top-left to bottom-right
    return 0;
}

console.log(uniquePaths(3, 7)); // 28
console.log(uniquePaths(3, 2)); // 3`,
      cpp: `#include <iostream>
using namespace std;

int uniquePaths(int m, int n) {
    // TODO: count unique paths from top-left to bottom-right
    return 0;
}

int main() {
    cout << uniquePaths(3, 7) << endl; // 28
    cout << uniquePaths(3, 2) << endl; // 3
    return 0;
}`,
      java: `public class Main {
    public static int uniquePaths(int m, int n) {
        // TODO: count unique paths from top-left to bottom-right
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(uniquePaths(3, 7)); // 28
        System.out.println(uniquePaths(3, 2)); // 3
    }
}`,
      rust: `fn unique_paths(m: i32, n: i32) -> i32 {
    // TODO: count unique paths from top-left to bottom-right
    0
}

fn main() {
    println!("{}", unique_paths(3, 7)); // 28
    println!("{}", unique_paths(3, 2)); // 3
}`,
    },
    testCases: [
      { stdin: "3|7", expectedOutput: "28" },
      { stdin: "3|2", expectedOutput: "3" },
      { stdin: "1|1", expectedOutput: "1" },
      { stdin: "7|3", expectedOutput: "28" },
      { stdin: "10|10", expectedOutput: "48620" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"strconv";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tp := strings.SplitN(l, "|", 2)
\t\tm, _ := strconv.Atoi(strings.TrimSpace(p[0]))
\t\tn, _ := strconv.Atoi(strings.TrimSpace(p[1]))
\t\tfmt.Println(uniquePaths(m, n))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    a, _, b = line.partition("|")
    print(unique_paths(int(a), int(b)))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [m, n] = l.split("|").map(Number);
  console.log(uniquePaths(m, n));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    int m = stoi(line.substr(0,bar)), n = stoi(line.substr(bar+1));
    cout << uniquePaths(m, n) << "\\n";
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
      int m = Integer.parseInt(p[0].trim()), n = Integer.parseInt(p[1].trim());
      System.out.println(uniquePaths(m, n));
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
    let m: i32 = p[0].trim().parse().unwrap_or(1);
    let n: i32 = p[1].trim().parse().unwrap_or(1);
    println!("{}", unique_paths(m, n));
  }
}`,
    },
  },

  // ─── 6. Minimum Size Subarray Sum ────────────────────────────────────────────
  {
    slug: "min-size-subarray-sum",
    title: "Minimum Size Subarray Sum",
    category: "sliding-window",
    difficulty: "medium",
    description:
      "Given an array of positive integers `nums` and a positive integer `target`, return the **minimum length** of a subarray whose sum is greater than or equal to `target`. If no such subarray exists, return `0`.\n\nInput format: `target|nums`\n\n**Constraints:**\n- `1 <= target <= 10⁹`\n- `1 <= nums.length <= 10⁵`\n- `1 <= nums[i] <= 10⁴`\n\n**Hint:** Sliding window — expand right, shrink left when sum ≥ target.",
    examples: [
      { input: "target = 7, nums = [2,3,1,2,4,3]", output: "2", explanation: '[4,3] has sum 7 and length 2.' },
      { input: "target = 4, nums = [1,4,4]", output: "1" },
      { input: "target = 11, nums = [1,1,1,1,1,1,1,1]", output: "0", explanation: "No subarray sums to ≥11." },
    ],
    starter: {
      go: `package main

import "fmt"

func minSubArrayLen(target int, nums []int) int {
\t// TODO: find minimum length subarray with sum >= target
\t// Hint: sliding window — expand right, shrink left when window sum >= target
\treturn 0
}

func main() {
\tfmt.Println(minSubArrayLen(7, []int{2, 3, 1, 2, 4, 3})) // 2
\tfmt.Println(minSubArrayLen(4, []int{1, 4, 4}))           // 1
}`,
      python: `def min_sub_array_len(target: int, nums: list[int]) -> int:
    # TODO: find minimum length subarray with sum >= target
    return 0

if __name__ == "__main__":
    print(min_sub_array_len(7, [2, 3, 1, 2, 4, 3]))  # 2
    print(min_sub_array_len(4, [1, 4, 4]))             # 1
`,
      javascript: `/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
function minSubArrayLen(target, nums) {
    // TODO: find minimum length subarray with sum >= target
    return 0;
}

console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3])); // 2
console.log(minSubArrayLen(4, [1, 4, 4]));           // 1`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int minSubArrayLen(int target, vector<int>& nums) {
    // TODO: find minimum length subarray with sum >= target
    return 0;
}

int main() {
    vector<int> a = {2,3,1,2,4,3}, b = {1,4,4};
    cout << minSubArrayLen(7, a) << endl; // 2
    cout << minSubArrayLen(4, b) << endl; // 1
    return 0;
}`,
      java: `public class Main {
    public static int minSubArrayLen(int target, int[] nums) {
        // TODO: find minimum length subarray with sum >= target
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minSubArrayLen(7, new int[]{2,3,1,2,4,3})); // 2
        System.out.println(minSubArrayLen(4, new int[]{1,4,4}));        // 1
    }
}`,
      rust: `fn min_sub_array_len(target: i32, nums: Vec<i32>) -> i32 {
    // TODO: find minimum length subarray with sum >= target
    0
}

fn main() {
    println!("{}", min_sub_array_len(7, vec![2,3,1,2,4,3])); // 2
    println!("{}", min_sub_array_len(4, vec![1,4,4]));        // 1
}`,
    },
    testCases: [
      { stdin: "7|2 3 1 2 4 3", expectedOutput: "2" },
      { stdin: "4|1 4 4", expectedOutput: "1" },
      { stdin: "11|1 1 1 1 1 1 1 1", expectedOutput: "0" },
      { stdin: "15|1 2 3 4 5", expectedOutput: "5" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"strconv";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tp := strings.SplitN(l, "|", 2)
\t\ttarget, _ := strconv.Atoi(strings.TrimSpace(p[0]))
\t\tparts := strings.Fields(p[1])
\t\tnums := make([]int, len(parts))
\t\tfor i, s := range parts { nums[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(minSubArrayLen(target, nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    a, _, b = line.partition("|")
    target = int(a.strip())
    nums = list(map(int, b.split()))
    print(min_sub_array_len(target, nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [a, b] = l.split("|");
  const target = Number(a.trim());
  const nums = b.trim().split(/\s+/).map(Number);
  console.log(minSubArrayLen(target, nums));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    int target = stoi(line.substr(0, bar));
    vector<int> nums; { istringstream iss(line.substr(bar+1)); int x; while(iss>>x) nums.push_back(x); }
    cout << minSubArrayLen(target, nums) << "\\n";
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
      String[] p = line.split("\\|", 2);
      int target = Integer.parseInt(p[0].trim());
      String[] ns = p[1].trim().split("\\s+");
      int[] nums = new int[ns.length];
      for (int i=0;i<ns.length;i++) nums[i]=Integer.parseInt(ns[i]);
      System.out.println(minSubArrayLen(target, nums));
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
    let target: i32 = p[0].trim().parse().unwrap_or(0);
    let nums: Vec<i32> = p[1].split_whitespace().filter_map(|s|s.parse().ok()).collect();
    println!("{}", min_sub_array_len(target, nums));
  }
}`,
    },
  },

  // ─── 7. Decode Ways ──────────────────────────────────────────────────────────
  {
    slug: "decode-ways",
    title: "Decode Ways",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "A message containing letters from `A-Z` is encoded as numbers using `A=1, B=2, ..., Z=26`.\n\nGiven a string `s` containing only digits, return the **number of ways** to decode it.\n\n**Constraints:**\n- `1 <= s.length <= 100`\n- `s` contains only digits, and may contain leading zeros.\n\n**Examples:**\n- `\"12\"` → `2` (decoded as `\"AB\"` or `\"L\"`)\n- `\"226\"` → `3` (`\"BZ\"`, `\"VF\"`, or `\"BBF\"`)\n- `\"06\"` → `0` (leading zero with no valid mapping)",
    examples: [
      { input: 's = "12"', output: "2", explanation: '"AB" (1,2) or "L" (12)' },
      { input: 's = "226"', output: "3" },
      { input: 's = "06"', output: "0" },
    ],
    starter: {
      go: `package main

import "fmt"

func numDecodings(s string) int {
\t// TODO: count the number of ways to decode the string
\t// Hint: dp[i] = dp[i-1] (if s[i] != '0') + dp[i-2] (if s[i-1..i] in 10-26)
\treturn 0
}

func main() {
\tfmt.Println(numDecodings("12"))  // 2
\tfmt.Println(numDecodings("226")) // 3
\tfmt.Println(numDecodings("06"))  // 0
}`,
      python: `def num_decodings(s: str) -> int:
    # TODO: count the number of ways to decode the string
    return 0

if __name__ == "__main__":
    print(num_decodings("12"))   # 2
    print(num_decodings("226"))  # 3
    print(num_decodings("06"))   # 0
`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function numDecodings(s) {
    // TODO: count the number of ways to decode the string
    return 0;
}

console.log(numDecodings("12"));   // 2
console.log(numDecodings("226"));  // 3
console.log(numDecodings("06"));   // 0`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int numDecodings(string s) {
    // TODO: count the number of ways to decode the string
    return 0;
}

int main() {
    cout << numDecodings("12")  << endl; // 2
    cout << numDecodings("226") << endl; // 3
    cout << numDecodings("06")  << endl; // 0
    return 0;
}`,
      java: `public class Main {
    public static int numDecodings(String s) {
        // TODO: count the number of ways to decode the string
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numDecodings("12"));   // 2
        System.out.println(numDecodings("226"));  // 3
        System.out.println(numDecodings("06"));   // 0
    }
}`,
      rust: `fn num_decodings(s: String) -> i32 {
    // TODO: count the number of ways to decode the string
    0
}

fn main() {
    println!("{}", num_decodings("12".to_string()));   // 2
    println!("{}", num_decodings("226".to_string()));  // 3
    println!("{}", num_decodings("06".to_string()));   // 0
}`,
    },
    testCases: [
      { stdin: "12", expectedOutput: "2" },
      { stdin: "226", expectedOutput: "3" },
      { stdin: "06", expectedOutput: "0" },
      { stdin: "1", expectedOutput: "1" },
      { stdin: "11106", expectedOutput: "2" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tfmt.Println(numDecodings(l))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    print(num_decodings(line))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  console.log(numDecodings(l));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    cout << numDecodings(line) << "\\n";
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
      System.out.println(numDecodings(line.trim()));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    println!("{}", num_decodings(line));
  }
}`,
    },
  },

  // ─── 8. Task Scheduler ───────────────────────────────────────────────────────
  {
    slug: "task-scheduler",
    title: "Task Scheduler",
    category: "greedy",
    difficulty: "medium",
    description:
      "Given a characters array `tasks` (CPU tasks, each labeled A–Z) and a non-negative integer `n` (the cooldown period between the same task), return the **minimum number of CPU intervals** required to finish all tasks.\n\nThe CPU can idle if there's no valid task available.\n\nInput format: `task1 task2 ... taskN|n`\n\n**Constraints:**\n- `1 <= tasks.length <= 10⁴`\n- `tasks[i]` is uppercase English letter\n- `0 <= n <= 100`\n\n**Hint:** The task with maximum frequency determines the minimum intervals.",
    examples: [
      { input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: "8", explanation: "A→B→idle→A→B→idle→A→B" },
      { input: 'tasks = ["A","A","A","B","B","B"], n = 0', output: "6" },
    ],
    starter: {
      go: `package main

import "fmt"

func leastInterval(tasks []byte, n int) int {
\t// TODO: return the minimum CPU intervals to finish all tasks
\t// Hint: formula — (maxCount-1)*(n+1) + numTasksWithMaxCount
\treturn 0
}

func main() {
\tfmt.Println(leastInterval([]byte("AAABBB"), 2)) // 8
\tfmt.Println(leastInterval([]byte("AAABBB"), 0)) // 6
}`,
      python: `def least_interval(tasks: list[str], n: int) -> int:
    # TODO: return minimum CPU intervals to finish all tasks
    return 0

if __name__ == "__main__":
    print(least_interval(list("AAABBB"), 2))  # 8
    print(least_interval(list("AAABBB"), 0))  # 6
`,
      javascript: `/**
 * @param {character[]} tasks
 * @param {number} n
 * @return {number}
 */
function leastInterval(tasks, n) {
    // TODO: return minimum CPU intervals to finish all tasks
    return 0;
}

console.log(leastInterval(["A","A","A","B","B","B"], 2)); // 8
console.log(leastInterval(["A","A","A","B","B","B"], 0)); // 6`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int leastInterval(vector<char>& tasks, int n) {
    // TODO: return minimum CPU intervals to finish all tasks
    return 0;
}

int main() {
    vector<char> t = {'A','A','A','B','B','B'};
    cout << leastInterval(t, 2) << endl; // 8
    cout << leastInterval(t, 0) << endl; // 6
    return 0;
}`,
      java: `public class Main {
    public static int leastInterval(char[] tasks, int n) {
        // TODO: return minimum CPU intervals to finish all tasks
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(leastInterval(new char[]{'A','A','A','B','B','B'}, 2)); // 8
        System.out.println(leastInterval(new char[]{'A','A','A','B','B','B'}, 0)); // 6
    }
}`,
      rust: `fn least_interval(tasks: Vec<char>, n: i32) -> i32 {
    // TODO: return minimum CPU intervals to finish all tasks
    0
}

fn main() {
    println!("{}", least_interval(vec!['A','A','A','B','B','B'], 2)); // 8
    println!("{}", least_interval(vec!['A','A','A','B','B','B'], 0)); // 6
}`,
    },
    testCases: [
      { stdin: "A A A B B B|2", expectedOutput: "8" },
      { stdin: "A A A B B B|0", expectedOutput: "6" },
      { stdin: "A A A A B B C C|3", expectedOutput: "10" },
      { stdin: "A|0", expectedOutput: "1" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"strconv";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tp := strings.SplitN(l, "|", 2)
\t\tn, _ := strconv.Atoi(strings.TrimSpace(p[1]))
\t\tfields := strings.Fields(p[0])
\t\ttasks := make([]byte, len(fields))
\t\tfor i, f := range fields { if len(f) > 0 { tasks[i] = f[0] } }
\t\tfmt.Println(leastInterval(tasks, n))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    a, _, b = line.partition("|")
    tasks = a.split()
    n = int(b.strip())
    print(least_interval(tasks, n))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [a, b] = l.split("|");
  const tasks = a.trim().split(/\s+/);
  const n = Number(b.trim());
  console.log(leastInterval(tasks, n));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    string a = line.substr(0, bar); int n = stoi(line.substr(bar+1));
    vector<char> tasks; istringstream iss(a); string tok;
    while (iss >> tok) if (!tok.empty()) tasks.push_back(tok[0]);
    cout << leastInterval(tasks, n) << "\\n";
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
      String[] p = line.split("\\|", 2);
      int n = Integer.parseInt(p[1].trim());
      String[] ts = p[0].trim().split("\\s+");
      char[] tasks = new char[ts.length];
      for (int i=0;i<ts.length;i++) tasks[i]=ts[i].charAt(0);
      System.out.println(leastInterval(tasks, n));
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
    let n: i32 = p[1].trim().parse().unwrap_or(0);
    let tasks: Vec<char> = p[0].split_whitespace().filter_map(|s| s.chars().next()).collect();
    println!("{}", least_interval(tasks, n));
  }
}`,
    },
  },
];
