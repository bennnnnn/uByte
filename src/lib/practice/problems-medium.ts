import type { PracticeProblem } from "./types";

export const MEDIUM_PROBLEMS: PracticeProblem[] = [
  {
    slug: "three-sum",
    category: "array",
    title: "Three Sum",
    description:
      "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nThe solution set must not contain duplicate triplets.\n\nHint: Sort the array, then use a fixed pointer + two-pointer technique.",
    difficulty: "medium",
    examples: [
      {
        input: "nums = [-1, 0, 1, 2, -1, -4]",
        output: "[[-1, -1, 2], [-1, 0, 1]]",
      },
      { input: "nums = [0, 1, 1]", output: "[]" },
      { input: "nums = [0, 0, 0]", output: "[[0, 0, 0]]" },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"sort"
)

func threeSum(nums []int) [][]int {
\t// TODO: find all unique triplets that sum to zero
\t// Hint: sort, then two-pointer for each fixed element
\treturn nil
}

func main() {
\tfmt.Println(threeSum([]int{-1, 0, 1, 2, -1, -4})) // [[-1 -1 2] [-1 0 1]]
\tfmt.Println(threeSum([]int{0, 0, 0}))               // [[0 0 0]]
}`,
      python: `def three_sum(nums: list[int]) -> list[list[int]]:
    # TODO: find all unique triplets that sum to zero
    # Hint: sort, then two-pointer for each fixed element
    return []

print(three_sum([-1, 0, 1, 2, -1, -4]))  # [[-1,-1,2],[-1,0,1]]
print(three_sum([0, 0, 0]))               # [[0,0,0]]`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> threeSum(vector<int>& nums) {
    // TODO: find all unique triplets that sum to zero
    return {};
}

int main() {
    vector<int> nums = {-1, 0, 1, 2, -1, -4};
    auto result = threeSum(nums);
    for (auto& t : result) {
        cout << "[" << t[0] << ", " << t[1] << ", " << t[2] << "]\n";
    }
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
    // TODO: find all unique triplets that sum to zero
    return [];
}

console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1,-1,2],[-1,0,1]]
console.log(threeSum([0, 0, 0]));               // [[0,0,0]]`,
      java: `import java.util.*;

public class Main {
    public static List<List<Integer>> threeSum(int[] nums) {
        // TODO: find all unique triplets that sum to zero
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(threeSum(new int[]{-1, 0, 1, 2, -1, -4}));
        System.out.println(threeSum(new int[]{0, 0, 0}));
    }
}`,
      rust: `fn three_sum(mut nums: Vec<i32>) -> Vec<Vec<i32>> {
    // TODO: find all unique triplets that sum to zero
    vec![]
}

fn main() {
    println!("{:?}", three_sum(vec![-1, 0, 1, 2, -1, -4]));
    println!("{:?}", three_sum(vec![0, 0, 0]));
}`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public IList<IList<int>> ThreeSum(int[] nums) {
        // TODO: find all unique triplets that sum to zero
        return new List<IList<int>>();
    }
}`,
    },
    testCases: [
      { stdin: "-1 0 1 2 -1 -4", expectedOutput: "[[-1 -1 2] [-1 0 1]]" },
      { stdin: "0 1 1", expectedOutput: "[]" },
      { stdin: "0 0 0", expectedOutput: "[[0 0 0]]" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"sort"
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
\t\tfmt.Println(threeSum(nums))
\t}
\t_ = sort.Ints
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(three_sum(nums))
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
  const nums = line.split(/\\s+/).filter(Boolean).map(Number);
  console.log(fmt(threeSum(nums)));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
static string fmt2D(const vector<vector<int>>& a) {
  if (a.empty()) return "[]";
  string out = "[";
  for (size_t i = 0; i < a.size(); i++) {
    if (i) out += " ";
    out += "[";
    for (size_t j = 0; j < a[i].size(); j++) {
      if (j) out += " ";
      out += to_string(a[i][j]);
    }
    out += "]";
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
    vector<int> nums;
    { istringstream iss(line); int x; while (iss >> x) nums.push_back(x); }
    auto res = threeSum(nums);
    cout << fmt2D(res) << "\\n";
  }
  return 0;
}
`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  static String fmt2DList(List<List<Integer>> a) {
    if (a == null || a.isEmpty()) return "[]";
    StringBuilder out = new StringBuilder();
    out.append('[');
    for (int i = 0; i < a.size(); i++) {
      if (i > 0) out.append(' ');
      out.append('[');
      List<Integer> row = a.get(i);
      for (int j = 0; j < row.size(); j++) {
        if (j > 0) out.append(' ');
        out.append(row.get(j));
      }
      out.append(']');
    }
    out.append(']');
    return out.toString();
  }
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim();
      if (line.isEmpty()) continue;
      String[] parts = line.split("\\\\s+");
      int[] nums = new int[parts.length];
      for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
      List<List<Integer>> res = threeSum(nums);
      System.out.println(fmt2DList(res));
    }
  }
}
`,
      rust: `use std::io::{self, Read};
{{SOLUTION}}
fn fmt_2d(a: &Vec<Vec<i32>>) -> String {
  if a.is_empty() { return "[]".to_string(); }
  let mut out = String::from("[");
  for (i, row) in a.iter().enumerate() {
    if i > 0 { out.push(' '); }
    out.push('[');
    for (j, x) in row.iter().enumerate() {
      if j > 0 { out.push(' '); }
      out.push_str(&x.to_string());
    }
    out.push(']');
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
    let nums: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    let res = three_sum(nums);
    println!(\"{}\", fmt_2d(&res));
  }
}
`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

{{SOLUTION}}
class __Judge__ {
    static string Fmt(IList<IList<int>> res) => "[" + string.Join(" ", res.Select(r => "[" + string.Join(" ", r) + "]")) + "]";
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            int[] nums = line.Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
            Console.WriteLine(Fmt(new Solution().ThreeSum(nums)));
        }
    }
}`,
    },
  },
  {
    slug: "maximum-subarray",
    category: "array",
    title: "Maximum Subarray",
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty part of an array.\n\nHint: Use Kadane's algorithm — track the current sum and reset when it goes negative.",
    difficulty: "medium",
    examples: [
      {
        input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        output: "6",
        explanation: "The subarray [4, -1, 2, 1] has the largest sum 6.",
      },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5, 4, -1, 7, 8]", output: "23" },
    ],
    starter: {
      go: `package main

import "fmt"

func maxSubArray(nums []int) int {
\t// TODO: Kadane's algorithm — track maxSum and currentSum
\treturn 0
}

func main() {
\tfmt.Println(maxSubArray([]int{-2, 1, -3, 4, -1, 2, 1, -5, 4})) // 6
\tfmt.Println(maxSubArray([]int{5, 4, -1, 7, 8}))                  // 23
}`,
      python: `def max_sub_array(nums: list[int]) -> int:
    # TODO: Kadane's algorithm — track max_sum and current_sum
    return 0

print(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # 6
print(max_sub_array([5, 4, -1, 7, 8]))                   # 23`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // TODO: Kadane's algorithm
    return 0;
}

int main() {
    vector<int> a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    vector<int> b = {5, 4, -1, 7, 8};
    cout << maxSubArray(a) << endl; // 6
    cout << maxSubArray(b) << endl; // 23
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // TODO: Kadane's algorithm
    return 0;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArray([5, 4, -1, 7, 8]));                  // 23`,
      java: `public class Main {
    public static int maxSubArray(int[] nums) {
        // TODO: Kadane's algorithm
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})); // 6
        System.out.println(maxSubArray(new int[]{5,4,-1,7,8}));             // 23
    }
}`,
      rust: `fn max_sub_array(nums: Vec<i32>) -> i32 {
    // TODO: Kadane's algorithm
    0
}

fn main() {
    println!("{}", max_sub_array(vec![-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
    println!("{}", max_sub_array(vec![5, 4, -1, 7, 8]));                  // 23
}`,
      csharp: `public class Solution {
    public int MaxSubArray(int[] nums) {
        // TODO: find the subarray with the largest sum (Kadane's algorithm)
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
      { stdin: "1", expectedOutput: "1" },
      { stdin: "5 4 -1 7 8", expectedOutput: "23" },
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
\t\tfmt.Println(maxSubArray(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(max_sub_array(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\\s+/).filter(Boolean).map(Number);
  console.log(String(maxSubArray(nums)));
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
    cout << maxSubArray(nums) << "\\n";
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
      System.out.println(maxSubArray(nums));
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
    println!(\"{}\", max_sub_array(nums));
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
            int[] nums = line.Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
            Console.WriteLine(new Solution().MaxSubArray(nums));
        }
    }
}`,
    },
  },
  {
    slug: "longest-substring-without-repeating",
    category: "string",
    title: "Longest Substring Without Repeating Characters",
    description:
      "Given a string `s`, find the length of the longest substring without repeating characters.\n\nHint: Use a sliding window — keep a set of current characters, expand the right pointer, and shrink the left pointer when a duplicate is found.",
    difficulty: "medium",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc" with length 3.',
      },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b".' },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke" with length 3.',
      },
    ],
    starter: {
      go: `package main

import "fmt"

func lengthOfLongestSubstring(s string) int {
\t// TODO: sliding window with a map to track char positions
\treturn 0
}

func main() {
\tfmt.Println(lengthOfLongestSubstring("abcabcbb")) // 3
\tfmt.Println(lengthOfLongestSubstring("bbbbb"))    // 1
\tfmt.Println(lengthOfLongestSubstring("pwwkew"))   // 3
}`,
      python: `def length_of_longest_substring(s: str) -> int:
    # TODO: sliding window with a set or dict
    return 0

print(length_of_longest_substring("abcabcbb"))  # 3
print(length_of_longest_substring("bbbbb"))     # 1
print(length_of_longest_substring("pwwkew"))    # 3`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // TODO: sliding window with a map
    return 0;
}

int main() {
    cout << lengthOfLongestSubstring("abcabcbb") << endl; // 3
    cout << lengthOfLongestSubstring("bbbbb")    << endl; // 1
    cout << lengthOfLongestSubstring("pwwkew")   << endl; // 3
    return 0;
}`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
    // TODO: sliding window with a Map or Set
    return 0;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));    // 1
console.log(lengthOfLongestSubstring("pwwkew"));   // 3`,
      java: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // TODO: sliding window with a HashMap
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3
        System.out.println(lengthOfLongestSubstring("bbbbb"));    // 1
        System.out.println(lengthOfLongestSubstring("pwwkew"));   // 3
    }
}`,
      rust: `use std::collections::HashMap;

fn length_of_longest_substring(s: &str) -> usize {
    // TODO: sliding window with a HashMap
    0
}

fn main() {
    println!("{}", length_of_longest_substring("abcabcbb")); // 3
    println!("{}", length_of_longest_substring("bbbbb"));    // 1
    println!("{}", length_of_longest_substring("pwwkew"));   // 3
}`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public int LengthOfLongestSubstring(string s) {
        // TODO: sliding window to find the longest substring without repeating chars
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "abcabcbb", expectedOutput: "3" },
      { stdin: "bbbbb", expectedOutput: "1" },
      { stdin: "pwwkew", expectedOutput: "3" },
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
\t\tfmt.Println(lengthOfLongestSubstring(s))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  s = line.strip()
  print(length_of_longest_substring(s))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const s = lineRaw.trim();
  console.log(String(lengthOfLongestSubstring(s)));
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
    cout << lengthOfLongestSubstring(s) << "\\n";
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
      System.out.println(lengthOfLongestSubstring(s));
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
    let s = line;
    println!(\"{}\", length_of_longest_substring(s));
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
            Console.WriteLine(new Solution().LengthOfLongestSubstring(line));
        }
    }
}`,
    },
  },
  {
    slug: "merge-intervals",
    category: "sorting",
    title: "Merge Intervals",
    description:
      "Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\nHint: Sort by start time, then greedily merge when the current interval overlaps with the previous one.",
    difficulty: "medium",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Intervals [1,3] and [2,6] overlap, merge to [1,6].",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Intervals [1,4] and [4,5] are considered overlapping.",
      },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"sort"
)

func merge(intervals [][]int) [][]int {
\t// TODO: sort by start, then merge overlapping intervals
\treturn nil
}

func main() {
\tfmt.Println(merge([][]int{{1,3},{2,6},{8,10},{15,18}})) // [[1 6] [8 10] [15 18]]
\tfmt.Println(merge([][]int{{1,4},{4,5}}))                 // [[1 5]]
}`,
      python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    # TODO: sort by start, then merge overlapping intervals
    return []

print(merge([[1,3],[2,6],[8,10],[15,18]]))  # [[1,6],[8,10],[15,18]]
print(merge([[1,4],[4,5]]))                  # [[1,5]]`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> merge(vector<vector<int>>& intervals) {
    // TODO: sort by start, then merge overlapping intervals
    return {};
}

int main() {
    vector<vector<int>> a = {{1,3},{2,6},{8,10},{15,18}};
    auto result = merge(a);
    for (auto& v : result)
        cout << "[" << v[0] << "," << v[1] << "] ";
    cout << endl;
    return 0;
}`,
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
    // TODO: sort by start, then merge overlapping intervals
    return [];
}

console.log(merge([[1,3],[2,6],[8,10],[15,18]])); // [[1,6],[8,10],[15,18]]
console.log(merge([[1,4],[4,5]]));                 // [[1,5]]`,
      java: `import java.util.*;

public class Main {
    public static int[][] merge(int[][] intervals) {
        // TODO: sort by start, then merge overlapping intervals
        return new int[][]{};
    }

    public static void main(String[] args) {
        int[][] a = {{1,3},{2,6},{8,10},{15,18}};
        System.out.println(Arrays.deepToString(merge(a)));
    }
}`,
      rust: `fn merge(mut intervals: Vec<Vec<i32>>) -> Vec<Vec<i32>> {
    // TODO: sort by start, then merge overlapping intervals
    vec![]
}

fn main() {
    println!("{:?}", merge(vec![vec![1,3],vec![2,6],vec![8,10],vec![15,18]]));
    println!("{:?}", merge(vec![vec![1,4],vec![4,5]]));
}`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public int[][] Merge(int[][] intervals) {
        // TODO: merge all overlapping intervals
        return intervals;
    }
}`,
    },
    testCases: [
      { stdin: "1 3|2 6|8 10|15 18", expectedOutput: "[[1 6] [8 10] [15 18]]" },
      { stdin: "1 4|4 5", expectedOutput: "[[1 5]]" },
      { stdin: "1 4|0 2|3 5", expectedOutput: "[[0 5]]" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"sort"
\t"strconv"
\t"strings"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text()
\t\tif line == "" { continue }
\t\tivStrs := strings.Split(line, "|")
\t\tintervals := make([][]int, len(ivStrs))
\t\tfor i, iv := range ivStrs {
\t\t\tparts := strings.Fields(iv)
\t\t\ts, _ := strconv.Atoi(parts[0])
\t\t\te, _ := strconv.Atoi(parts[1])
\t\t\tintervals[i] = []int{s, e}
\t\t}
\t\tfmt.Println(merge(intervals))
\t}
\t_ = sort.Ints
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  intervals = []
  for part in line.split("|"):
    a, b = part.split()
    intervals.append([int(a), int(b)])
  print(merge(intervals))
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
  const intervals = line.split("|").map((p) => p.trim()).filter(Boolean).map((p) => {
    const [a, b] = p.split(/\\s+/);
    return [Number(a), Number(b)];
  });
  console.log(fmt(merge(intervals)));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
static string fmt2D(const vector<vector<int>>& a) {
  if (a.empty()) return "[]";
  string out = "[";
  for (size_t i = 0; i < a.size(); i++) {
    if (i) out += " ";
    out += "[";
    for (size_t j = 0; j < a[i].size(); j++) {
      if (j) out += " ";
      out += to_string(a[i][j]);
    }
    out += "]";
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
    vector<vector<int>> intervals;
    for (string part; ; ) {
      auto pos = line.find('|');
      part = (pos == string::npos) ? line : line.substr(0, pos);
      if (pos != string::npos) line = line.substr(pos + 1);
      part.erase(0, part.find_first_not_of(" \t\r\n"));
      part.erase(part.find_last_not_of(" \t\r\n") + 1);
      if (!part.empty()) {
        istringstream iss(part);
        int a, b;
        iss >> a >> b;
        intervals.push_back({a, b});
      }
      if (pos == string::npos) break;
    }
    auto res = merge(intervals);
    cout << fmt2D(res) << "\\n";
  }
  return 0;
}
`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  static String fmt2D(int[][] a) {
    if (a == null || a.length == 0) return "[]";
    StringBuilder out = new StringBuilder();
    out.append('[');
    for (int i = 0; i < a.length; i++) {
      if (i > 0) out.append(' ');
      out.append('[').append(a[i][0]).append(' ').append(a[i][1]).append(']');
    }
    out.append(']');
    return out.toString();
  }
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim();
      if (line.isEmpty()) continue;
      String[] parts = line.split("\\\\|");
      int[][] intervals = new int[parts.length][2];
      for (int i = 0; i < parts.length; i++) {
        String[] ab = parts[i].trim().split("\\\\s+");
        intervals[i][0] = Integer.parseInt(ab[0]);
        intervals[i][1] = Integer.parseInt(ab[1]);
      }
      System.out.println(fmt2D(merge(intervals)));
    }
  }
}
`,
      rust: `use std::io::{self, Read};
{{SOLUTION}}
fn fmt_2d(a: &Vec<Vec<i32>>) -> String {
  if a.is_empty() { return "[]".to_string(); }
  let mut out = String::from("[");
  for (i, row) in a.iter().enumerate() {
    if i > 0 { out.push(' '); }
    out.push('[');
    out.push_str(&row[0].to_string());
    out.push(' ');
    out.push_str(&row[1].to_string());
    out.push(']');
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
    let mut intervals: Vec<Vec<i32>> = Vec::new();
    for part in line.split('|') {
      let p = part.trim();
      if p.is_empty() { continue; }
      let nums: Vec<i32> = p.split_whitespace().filter_map(|s| s.parse().ok()).collect();
      if nums.len() >= 2 { intervals.push(vec![nums[0], nums[1]]); }
    }
    let res = merge(intervals);
    println!(\"{}\", fmt_2d(&res));
  }
}
`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

{{SOLUTION}}class __Judge__ {
    static string Fmt(int[][] res) => "[" + string.Join(" ", res.Select(r => "[" + string.Join(" ", r) + "]")) + "]";
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            int[][] intervals = line.Split('|').Select(p => p.Trim().Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray()).ToArray();
            Console.WriteLine(Fmt(new Solution().Merge(intervals)));
        }
    }
}`,
    },
  },
];
