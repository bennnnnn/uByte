import type { PracticeProblem } from "./types";

export const MEDIUM_PROBLEMS_4: PracticeProblem[] = [
  // ── 1. Number of Islands ─────────────────────────────────────────────────
  {
    slug: "number-of-islands",
    title: "Number of Islands",
    category: "graph",
    difficulty: "medium",
    description:
      "Given an `m x n` grid of `'1'` (land) and `'0'` (water), count the number of islands. An island is surrounded by water and is formed by connecting adjacent (horizontally or vertically) land cells.\n\nHint: Use DFS or BFS. For each unvisited `'1'`, start a search and mark all connected land cells as visited. Increment a counter for each search started.",
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: "1",
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: "3",
      },
    ],
    starter: {
      go: `package main

import "fmt"

func numIslands(grid [][]byte) int {
\t// TODO: DFS/BFS — mark visited land, count components
\treturn 0
}

func main() {
\tg1 := [][]byte{
\t\t{'1','1','1','1','0'},
\t\t{'1','1','0','1','0'},
\t\t{'1','1','0','0','0'},
\t\t{'0','0','0','0','0'},
\t}
\tfmt.Println(numIslands(g1)) // 1

\tg2 := [][]byte{
\t\t{'1','1','0','0','0'},
\t\t{'1','1','0','0','0'},
\t\t{'0','0','1','0','0'},
\t\t{'0','0','0','1','1'},
\t}
\tfmt.Println(numIslands(g2)) // 3
}`,
      python: `def num_islands(grid: list[list[str]]) -> int:
    # TODO: DFS/BFS — mark visited land, count components
    return 0

grid1 = [
    ["1","1","1","1","0"],
    ["1","1","0","1","0"],
    ["1","1","0","0","0"],
    ["0","0","0","0","0"],
]
grid2 = [
    ["1","1","0","0","0"],
    ["1","1","0","0","0"],
    ["0","0","1","0","0"],
    ["0","0","0","1","1"],
]
print(num_islands(grid1))  # 1
print(num_islands(grid2))  # 3`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int numIslands(vector<vector<char>>& grid) {
    // TODO: DFS/BFS — mark visited land, count components
    return 0;
}

int main() {
    vector<vector<char>> g1 = {{'1','1','1','1','0'},{'1','1','0','1','0'},{'1','1','0','0','0'},{'0','0','0','0','0'}};
    vector<vector<char>> g2 = {{'1','1','0','0','0'},{'1','1','0','0','0'},{'0','0','1','0','0'},{'0','0','0','1','1'}};
    cout << numIslands(g1) << endl; // 1
    cout << numIslands(g2) << endl; // 3
    return 0;
}`,
      javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
    // TODO: DFS/BFS — mark visited land, count components
    return 0;
}

const g1 = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]];
const g2 = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]];
console.log(numIslands(g1)); // 1
console.log(numIslands(g2)); // 3`,
      java: `public class Main {
    public static int numIslands(char[][] grid) {
        // TODO: DFS/BFS — mark visited land, count components
        return 0;
    }

    public static void main(String[] args) {
        char[][] g1 = {{'1','1','1','1','0'},{'1','1','0','1','0'},{'1','1','0','0','0'},{'0','0','0','0','0'}};
        char[][] g2 = {{'1','1','0','0','0'},{'1','1','0','0','0'},{'0','0','1','0','0'},{'0','0','0','1','1'}};
        System.out.println(numIslands(g1)); // 1
        System.out.println(numIslands(g2)); // 3
    }
}`,
      rust: `fn num_islands(grid: &mut Vec<Vec<char>>) -> i32 {
    // TODO: DFS/BFS — mark visited land, count components
    0
}

fn main() {
    let mut g1 = vec![
        vec!['1','1','1','1','0'],
        vec!['1','1','0','1','0'],
        vec!['1','1','0','0','0'],
        vec!['0','0','0','0','0'],
    ];
    let mut g2 = vec![
        vec!['1','1','0','0','0'],
        vec!['1','1','0','0','0'],
        vec!['0','0','1','0','0'],
        vec!['0','0','0','1','1'],
    ];
    println!("{}", num_islands(&mut g1)); // 1
    println!("{}", num_islands(&mut g2)); // 3
}`,
      csharp: `public class Solution {
    public int NumIslands(char[][] grid) {
        // TODO: DFS/BFS to count islands
        return 0;
    }
}`,
    },
    // stdin: rows joined by "|" using "0"/"1" chars. e.g. "11110|11010|11011|00001"
    testCases: [
      { stdin: "11110|11010|11011|00001", expectedOutput: "3" },
      { stdin: "11000|11000|00100|00011", expectedOutput: "3" },
      { stdin: "1111|1001|1001|1111", expectedOutput: "2" },
      { stdin: "0", expectedOutput: "0" },
      { stdin: "1", expectedOutput: "1" },
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
\t\trows := strings.Split(line, "|")
\t\tgrid := make([][]byte, len(rows))
\t\tfor i, r := range rows {
\t\t\tgrid[i] = []byte(r)
\t\t}
\t\tfmt.Println(numIslands(grid))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  rows = line.split("|")
  grid = [list(r) for r in rows]
  print(num_islands(grid))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  const grid = line.split("|").map(r => r.split(""));
  console.log(String(numIslands(grid)));
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
    vector<vector<char>> grid;
    istringstream ss(line);
    string row;
    while (getline(ss, row, '|')) {
      grid.push_back(vector<char>(row.begin(), row.end()));
    }
    cout << numIslands(grid) << "\\n";
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
      String[] rows = line.split("\\\\|");
      char[][] grid = new char[rows.length][];
      for (int i = 0; i < rows.length; i++) grid[i] = rows[i].toCharArray();
      System.out.println(numIslands(grid));
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
    let mut grid: Vec<Vec<char>> = line.split('|').map(|r| r.chars().collect()).collect();
    println!(\"{}\", num_islands(&mut grid));
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
            char[][] grid = line.Split('|').Select(r => r.ToCharArray()).ToArray();
            Console.WriteLine(new Solution().NumIslands(grid));
        }
    }
}`,
    },
  },

  // ── 2. Kth Largest Element in an Array ───────────────────────────────────
  {
    slug: "kth-largest-element",
    title: "Kth Largest Element in an Array",
    category: "heap",
    difficulty: "medium",
    description:
      "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.\n\nNote: it is the `k`th largest element in sorted order, not the `k`th distinct element.\n\nHint: Use a min-heap of size `k`. For each element, push it onto the heap. If the heap size exceeds `k`, pop the minimum. The heap's minimum is the kth largest.",
    examples: [
      { input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5" },
      { input: "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4", output: "4" },
    ],
    starter: {
      go: `package main

import "fmt"

func findKthLargest(nums []int, k int) int {
\t// TODO: min-heap of size k, or sort descending
\treturn 0
}

func main() {
\tfmt.Println(findKthLargest([]int{3, 2, 1, 5, 6, 4}, 2))            // 5
\tfmt.Println(findKthLargest([]int{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4))  // 4
}`,
      python: `def find_kth_largest(nums: list[int], k: int) -> int:
    # TODO: min-heap of size k, or sort descending
    return 0

print(find_kth_largest([3, 2, 1, 5, 6, 4], 2))           # 5
print(find_kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))  # 4`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int findKthLargest(vector<int>& nums, int k) {
    // TODO: sort descending, or use nth_element
    return 0;
}

int main() {
    vector<int> a = {3, 2, 1, 5, 6, 4};
    vector<int> b = {3, 2, 3, 1, 2, 4, 5, 5, 6};
    cout << findKthLargest(a, 2) << endl; // 5
    cout << findKthLargest(b, 4) << endl; // 4
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function findKthLargest(nums, k) {
    // TODO: min-heap of size k, or sort descending
    return 0;
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2));           // 5
console.log(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4));  // 4`,
      java: `import java.util.*;

public class Main {
    public static int findKthLargest(int[] nums, int k) {
        // TODO: min-heap of size k
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findKthLargest(new int[]{3, 2, 1, 5, 6, 4}, 2));           // 5
        System.out.println(findKthLargest(new int[]{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4));  // 4
    }
}`,
      rust: `fn find_kth_largest(mut nums: Vec<i32>, k: usize) -> i32 {
    // TODO: sort descending, return nums[k-1]
    0
}

fn main() {
    println!("{}", find_kth_largest(vec![3, 2, 1, 5, 6, 4], 2));           // 5
    println!("{}", find_kth_largest(vec![3, 2, 3, 1, 2, 4, 5, 5, 6], 4));  // 4
}`,
      csharp: `public class Solution {
    public int FindKthLargest(int[] nums, int k) {
        // TODO: find the kth largest element (1-indexed)
        return 0;
    }
}`,
    },
    // stdin: "3 2 1 5 6 4|2"  → nums | k
    testCases: [
      { stdin: "3 2 1 5 6 4|2", expectedOutput: "5" },
      { stdin: "3 2 3 1 2 4 5 5 6|4", expectedOutput: "4" },
      { stdin: "1|1", expectedOutput: "1" },
      { stdin: "7 6 5 4 3 2 1|5", expectedOutput: "3" },
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
\t\tfields := strings.Fields(parts[0])
\t\tnums := make([]int, len(fields))
\t\tfor i, s := range fields { nums[i], _ = strconv.Atoi(s) }
\t\tk, _ := strconv.Atoi(strings.TrimSpace(parts[1]))
\t\tfmt.Println(findKthLargest(nums, k))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  a, _, b = line.partition("|")
  nums = [int(x) for x in a.split()]
  k = int(b.strip())
  print(find_kth_largest(nums, k))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  const [a, b] = line.split("|");
  const nums = (a ?? "").trim().split(/\s+/).map(Number);
  const k = parseInt((b ?? "").trim(), 10);
  console.log(String(findKthLargest(nums, k)));
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
    string numsStr = line.substr(0, bar);
    int k = stoi(line.substr(bar + 1));
    istringstream iss(numsStr);
    vector<int> nums;
    int x; while (iss >> x) nums.push_back(x);
    cout << findKthLargest(nums, k) << "\\n";
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
      String[] tokens = parts[0].trim().split("\\\\s+");
      int[] nums = new int[tokens.length];
      for (int i = 0; i < tokens.length; i++) nums[i] = Integer.parseInt(tokens[i]);
      int k = Integer.parseInt(parts[1].trim());
      System.out.println(findKthLargest(nums, k));
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
    let nums: Vec<i32> = it.next().unwrap_or("").split_whitespace().map(|s| s.parse().unwrap()).collect();
    let k: usize = it.next().unwrap_or("1").trim().parse().unwrap();
    println!(\"{}\", find_kth_largest(nums, k));
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
            int[] nums = parts[0].Trim().Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
            int k = int.Parse(parts[1].Trim());
            Console.WriteLine(new Solution().FindKthLargest(nums, k));
        }
    }
}`,
    },
  },

  // ── 3. Longest Increasing Subsequence ────────────────────────────────────
  {
    slug: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "Given an integer array `nums`, return the length of the longest **strictly increasing** subsequence.\n\nA subsequence is a sequence derived from the array by deleting some (or no) elements without changing the order of remaining elements.\n\nHint: O(n log n) solution — maintain a `tails` array. For each number, binary search for the first element in `tails` that is ≥ the number and replace it, or append if larger than all.",
    examples: [
      { input: "nums = [10, 9, 2, 5, 3, 7, 101, 18]", output: "4", explanation: "[2, 3, 7, 101]" },
      { input: "nums = [0, 1, 0, 3, 2, 3]", output: "4" },
      { input: "nums = [7, 7, 7, 7, 7]", output: "1" },
    ],
    starter: {
      go: `package main

import "fmt"

func lengthOfLIS(nums []int) int {
\t// TODO: O(n log n) with binary search, or O(n^2) DP
\treturn 0
}

func main() {
\tfmt.Println(lengthOfLIS([]int{10, 9, 2, 5, 3, 7, 101, 18})) // 4
\tfmt.Println(lengthOfLIS([]int{0, 1, 0, 3, 2, 3}))           // 4
\tfmt.Println(lengthOfLIS([]int{7, 7, 7, 7, 7}))              // 1
}`,
      python: `def length_of_lis(nums: list[int]) -> int:
    # TODO: O(n log n) with bisect, or O(n^2) DP
    return 0

print(length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]))  # 4
print(length_of_lis([0, 1, 0, 3, 2, 3]))             # 4
print(length_of_lis([7, 7, 7, 7, 7]))                # 1`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLIS(vector<int>& nums) {
    // TODO: patience sorting / binary search
    return 0;
}

int main() {
    vector<int> a = {10, 9, 2, 5, 3, 7, 101, 18};
    vector<int> b = {0, 1, 0, 3, 2, 3};
    vector<int> c = {7, 7, 7, 7, 7};
    cout << lengthOfLIS(a) << endl; // 4
    cout << lengthOfLIS(b) << endl; // 4
    cout << lengthOfLIS(c) << endl; // 1
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function lengthOfLIS(nums) {
    // TODO: O(n log n) patience sorting
    return 0;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));            // 4
console.log(lengthOfLIS([7, 7, 7, 7, 7]));               // 1`,
      java: `public class Main {
    public static int lengthOfLIS(int[] nums) {
        // TODO: O(n log n) with Arrays.binarySearch
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLIS(new int[]{10, 9, 2, 5, 3, 7, 101, 18})); // 4
        System.out.println(lengthOfLIS(new int[]{0, 1, 0, 3, 2, 3}));            // 4
        System.out.println(lengthOfLIS(new int[]{7, 7, 7, 7, 7}));               // 1
    }
}`,
      rust: `fn length_of_lis(nums: Vec<i32>) -> i32 {
    // TODO: patience sorting with binary search
    0
}

fn main() {
    println!("{}", length_of_lis(vec![10, 9, 2, 5, 3, 7, 101, 18])); // 4
    println!("{}", length_of_lis(vec![0, 1, 0, 3, 2, 3]));            // 4
    println!("{}", length_of_lis(vec![7, 7, 7, 7, 7]));               // 1
}`,
      csharp: `public class Solution {
    public int LengthOfLIS(int[] nums) {
        // TODO: find the length of the longest increasing subsequence
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "10 9 2 5 3 7 101 18", expectedOutput: "4" },
      { stdin: "0 1 0 3 2 3", expectedOutput: "4" },
      { stdin: "7 7 7 7 7", expectedOutput: "1" },
      { stdin: "1 3 6 7 9 4 10 5 6", expectedOutput: "6" },
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
\t\tfmt.Println(lengthOfLIS(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(length_of_lis(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).map(Number);
  console.log(String(lengthOfLIS(nums)));
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
    istringstream iss(line);
    vector<int> nums;
    int x; while (iss >> x) nums.push_back(x);
    cout << lengthOfLIS(nums) << "\\n";
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
      System.out.println(lengthOfLIS(nums));
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
    let nums: Vec<i32> = line.split_whitespace().map(|s| s.parse().unwrap()).collect();
    println!(\"{}\", length_of_lis(nums));
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
            Console.WriteLine(new Solution().LengthOfLIS(nums));
        }
    }
}`,
    },
  },

  // ── 4. Letter Combinations of a Phone Number ─────────────────────────────
  {
    slug: "letter-combinations",
    title: "Letter Combinations of a Phone Number",
    category: "backtracking",
    difficulty: "medium",
    description:
      "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in lexicographic order.\n\nPhone key mapping: 2→abc, 3→def, 4→ghi, 5→jkl, 6→mno, 7→pqrs, 8→tuv, 9→wxyz.\n\nHint: Use backtracking — at each position, iterate over the letters for the current digit and recurse for the remaining digits.",
    examples: [
      {
        input: 'digits = "23"',
        output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]',
        explanation: "2→abc, 3→def",
      },
      { input: 'digits = ""', output: "[]" },
      { input: 'digits = "2"', output: '["a","b","c"]' },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"strings"
)

func letterCombinations(digits string) []string {
\t// TODO: backtracking over phone digit mapping
\treturn nil
}

func main() {
\tres := letterCombinations("23")
\tfmt.Println(strings.Join(res, " ")) // ad ae af bd be bf cd ce cf
\tfmt.Println(letterCombinations(""))  // []
}`,
      python: `def letter_combinations(digits: str) -> list[str]:
    # TODO: backtracking over phone digit mapping
    return []

print(" ".join(letter_combinations("23")))  # ad ae af bd be bf cd ce cf
print(letter_combinations(""))              # []`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> letterCombinations(string digits) {
    // TODO: backtracking
    return {};
}

int main() {
    auto res = letterCombinations("23");
    for (const auto& s : res) cout << s << " ";
    cout << endl;
    return 0;
}`,
      javascript: `/**
 * @param {string} digits
 * @return {string[]}
 */
function letterCombinations(digits) {
    // TODO: backtracking
    return [];
}

console.log(letterCombinations("23").join(" ")); // ad ae af bd be bf cd ce cf`,
      java: `import java.util.*;

public class Main {
    public static List<String> letterCombinations(String digits) {
        // TODO: backtracking
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(String.join(" ", letterCombinations("23")));
    }
}`,
      rust: `fn letter_combinations(digits: &str) -> Vec<String> {
    // TODO: backtracking
    vec![]
}

fn main() {
    let res = letter_combinations("23");
    println!("{}", res.join(" "));
}`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public IList<string> LetterCombinations(string digits) {
        // TODO: return all possible letter combinations for the phone digits
        return new List<string>();
    }
}`,
    },
    testCases: [
      { stdin: "23", expectedOutput: "ad ae af bd be bf cd ce cf" },
      { stdin: "2", expectedOutput: "a b c" },
      { stdin: "79", expectedOutput: "pw px py pz qw qx qy qz rw rx ry rz sw sx sy sz" },
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
\t\tdigits := scanner.Text()
\t\tif digits == "" { continue }
\t\tres := letterCombinations(digits)
\t\tfmt.Println(strings.Join(res, " "))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  digits = line.strip()
  if not digits: continue
  print(" ".join(letter_combinations(digits)))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const digits = raw.trim();
  if (!digits) continue;
  console.log(letterCombinations(digits).join(" "));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  string digits;
  while (getline(cin, digits)) {
    if (digits.empty()) continue;
    auto res = letterCombinations(digits);
    for (int i = 0; i < (int)res.size(); i++) {
      if (i) cout << ' ';
      cout << res[i];
    }
    cout << "\\n";
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
    String digits;
    while ((digits = br.readLine()) != null) {
      digits = digits.trim();
      if (digits.isEmpty()) continue;
      System.out.println(String.join(" ", letterCombinations(digits)));
    }
  }
}
`,
      rust: `use std::io::{self, BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let digits = line.unwrap();
    let digits = digits.trim();
    if digits.is_empty() { continue; }
    let res = letter_combinations(digits);
    println!(\"{}\", res.join(\" \"));
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
            var res = new Solution().LetterCombinations(line);
            Console.WriteLine(string.Join(" ", res));
        }
    }
}`,
    },
  },
];
