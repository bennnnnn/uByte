import type { PracticeProblem } from "./types";

// ── Shared harness snippets (reused across problems in this file) ────────────
// All harnesses follow the same stdin-loop pattern as problems-easy.ts.

export const EASY_PROBLEMS_2: PracticeProblem[] = [
  // ── 1. Missing Number ────────────────────────────────────────────────────
  {
    slug: "missing-number",
    title: "Missing Number",
    category: "array",
    difficulty: "easy",
    description:
      "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.\n\nHint: The expected sum of [0..n] is `n*(n+1)/2`. Subtract the actual sum to find the missing number.",
    examples: [
      { input: "nums = [3, 0, 1]", output: "2", explanation: "n = 3, range [0,3]. 2 is missing." },
      { input: "nums = [0, 1]", output: "2", explanation: "n = 2, range [0,2]. 2 is missing." },
      { input: "nums = [9,6,4,2,3,5,7,0,1]", output: "8" },
    ],
    starter: {
      go: `package main

import "fmt"

func missingNumber(nums []int) int {
\t// TODO: use Gauss sum — n*(n+1)/2 minus actual sum
\treturn 0
}

func main() {
\tfmt.Println(missingNumber([]int{3, 0, 1})) // 2
\tfmt.Println(missingNumber([]int{0, 1}))     // 2
}`,
      python: `def missing_number(nums: list[int]) -> int:
    # TODO: use Gauss sum — n*(n+1)/2 minus actual sum
    return 0

print(missing_number([3, 0, 1]))  # 2
print(missing_number([0, 1]))     # 2`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int missingNumber(vector<int>& nums) {
    // TODO: use Gauss sum or XOR trick
    return 0;
}

int main() {
    vector<int> a = {3, 0, 1};
    vector<int> b = {0, 1};
    cout << missingNumber(a) << endl; // 2
    cout << missingNumber(b) << endl; // 2
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function missingNumber(nums) {
    // TODO: use Gauss sum — n*(n+1)/2 minus actual sum
    return 0;
}

console.log(missingNumber([3, 0, 1])); // 2
console.log(missingNumber([0, 1]));     // 2`,
      java: `public class Main {
    public static int missingNumber(int[] nums) {
        // TODO: use Gauss sum — n*(n+1)/2 minus actual sum
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(missingNumber(new int[]{3, 0, 1})); // 2
        System.out.println(missingNumber(new int[]{0, 1}));    // 2
    }
}`,
      rust: `fn missing_number(nums: Vec<i32>) -> i32 {
    // TODO: use Gauss sum or XOR trick
    0
}

fn main() {
    println!("{}", missing_number(vec![3, 0, 1])); // 2
    println!("{}", missing_number(vec![0, 1]));     // 2
}`,
      csharp: `using System.Linq;

public class Solution {
    public int MissingNumber(int[] nums) {
        // TODO: find the missing number in 0..n
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "3 0 1", expectedOutput: "2" },
      { stdin: "0 1", expectedOutput: "2" },
      { stdin: "9 6 4 2 3 5 7 0 1", expectedOutput: "8" },
      { stdin: "0", expectedOutput: "1" },
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
\t\tfmt.Println(missingNumber(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(missing_number(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).filter(Boolean).map(Number);
  console.log(String(missingNumber(nums)));
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
    cout << missingNumber(nums) << "\\n";
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
      System.out.println(missingNumber(nums));
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
    println!(\"{}\", missing_number(nums));
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
            Console.WriteLine(new Solution().MissingNumber(nums));
        }
    }
}`,
    },
  },

  // ── 2. Single Number ────────────────────────────────────────────────────
  {
    slug: "single-number",
    title: "Single Number",
    category: "array",
    difficulty: "easy",
    description:
      "Given a non-empty array of integers `nums`, every element appears **twice** except for one. Find that single one.\n\nYou must implement a solution with linear runtime complexity and use only constant extra space.\n\nHint: XOR is your friend — `a ^ a = 0` and `a ^ 0 = a`, so XOR-ing all elements cancels duplicates.",
    examples: [
      { input: "nums = [2, 2, 1]", output: "1" },
      { input: "nums = [4, 1, 2, 1, 2]", output: "4" },
      { input: "nums = [1]", output: "1" },
    ],
    starter: {
      go: `package main

import "fmt"

func singleNumber(nums []int) int {
\t// TODO: XOR all elements — duplicates cancel out
\treturn 0
}

func main() {
\tfmt.Println(singleNumber([]int{2, 2, 1}))       // 1
\tfmt.Println(singleNumber([]int{4, 1, 2, 1, 2})) // 4
}`,
      python: `def single_number(nums: list[int]) -> int:
    # TODO: XOR all elements — duplicates cancel out
    return 0

print(single_number([2, 2, 1]))        # 1
print(single_number([4, 1, 2, 1, 2]))  # 4`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int singleNumber(vector<int>& nums) {
    // TODO: XOR all elements
    return 0;
}

int main() {
    vector<int> a = {2, 2, 1};
    vector<int> b = {4, 1, 2, 1, 2};
    cout << singleNumber(a) << endl; // 1
    cout << singleNumber(b) << endl; // 4
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function singleNumber(nums) {
    // TODO: XOR all elements — duplicates cancel out
    return 0;
}

console.log(singleNumber([2, 2, 1]));        // 1
console.log(singleNumber([4, 1, 2, 1, 2]));  // 4`,
      java: `public class Main {
    public static int singleNumber(int[] nums) {
        // TODO: XOR all elements
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(singleNumber(new int[]{2, 2, 1}));        // 1
        System.out.println(singleNumber(new int[]{4, 1, 2, 1, 2})); // 4
    }
}`,
      rust: `fn single_number(nums: Vec<i32>) -> i32 {
    // TODO: XOR all elements — duplicates cancel out
    0
}

fn main() {
    println!("{}", single_number(vec![2, 2, 1]));        // 1
    println!("{}", single_number(vec![4, 1, 2, 1, 2]));  // 4
}`,
      csharp: `public class Solution {
    public int SingleNumber(int[] nums) {
        // TODO: find the element that appears only once
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "2 2 1", expectedOutput: "1" },
      { stdin: "4 1 2 1 2", expectedOutput: "4" },
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
\t\tfmt.Println(singleNumber(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(single_number(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).filter(Boolean).map(Number);
  console.log(String(singleNumber(nums)));
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
    cout << singleNumber(nums) << "\\n";
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
      System.out.println(singleNumber(nums));
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
    println!(\"{}\", single_number(nums));
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
            Console.WriteLine(new Solution().SingleNumber(nums));
        }
    }
}`,
    },
  },

  // ── 3. Move Zeroes ──────────────────────────────────────────────────────
  {
    slug: "move-zeroes",
    title: "Move Zeroes",
    category: "two-pointers",
    difficulty: "easy",
    description:
      "Given an integer array `nums`, move all `0`s to the end of it while maintaining the relative order of the non-zero elements.\n\nYou must do this **in-place** without making a copy of the array. After moving, print the modified array.\n\nHint: Use two pointers — one for the write position (for non-zeros) and one to scan.",
    examples: [
      { input: "nums = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]" },
      { input: "nums = [0]", output: "[0]" },
      { input: "nums = [1]", output: "[1]" },
    ],
    starter: {
      go: `package main

import "fmt"

func moveZeroes(nums []int) {
\t// TODO: use two pointers — write non-zeros forward, fill rest with zeros
}

func main() {
\tnums := []int{0, 1, 0, 3, 12}
\tmoveZeroes(nums)
\tfmt.Println(nums) // [1 3 12 0 0]
}`,
      python: `def move_zeroes(nums: list[int]) -> None:
    # TODO: use two pointers — write non-zeros forward, fill rest with zeros
    pass

nums = [0, 1, 0, 3, 12]
move_zeroes(nums)
print(nums)  # [1, 3, 12, 0, 0]`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void moveZeroes(vector<int>& nums) {
    // TODO: use two pointers
}

int main() {
    vector<int> nums = {0, 1, 0, 3, 12};
    moveZeroes(nums);
    cout << "[";
    for (int i = 0; i < (int)nums.size(); i++) {
        if (i) cout << " ";
        cout << nums[i];
    }
    cout << "]" << endl;
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {void}
 */
function moveZeroes(nums) {
    // TODO: use two pointers
}

const nums = [0, 1, 0, 3, 12];
moveZeroes(nums);
console.log("[" + nums.join(" ") + "]"); // [1 3 12 0 0]`,
      java: `public class Main {
    public static void moveZeroes(int[] nums) {
        // TODO: use two pointers
    }

    public static void main(String[] args) {
        int[] nums = {0, 1, 0, 3, 12};
        moveZeroes(nums);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < nums.length; i++) {
            if (i > 0) sb.append(' ');
            sb.append(nums[i]);
        }
        sb.append(']');
        System.out.println(sb); // [1 3 12 0 0]
    }
}`,
      rust: `fn move_zeroes(nums: &mut Vec<i32>) {
    // TODO: use two pointers
}

fn main() {
    let mut nums = vec![0, 1, 0, 3, 12];
    move_zeroes(&mut nums);
    println!("{:?}", nums); // [1, 3, 12, 0, 0]
}`,
      csharp: `public class Solution {
    public void MoveZeroes(int[] nums) {
        // TODO: move all zeroes to the end in-place
    }
}`,
    },
    testCases: [
      { stdin: "0 1 0 3 12", expectedOutput: "[1 3 12 0 0]" },
      { stdin: "0", expectedOutput: "[0]" },
      { stdin: "1", expectedOutput: "[1]" },
      { stdin: "1 0 1", expectedOutput: "[1 1 0]" },
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
\t\tmoveZeroes(nums)
\t\tfmt.Println(nums)
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  move_zeroes(nums)
  print(nums)
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).filter(Boolean).map(Number);
  moveZeroes(nums);
  console.log("[" + nums.join(" ") + "]");
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
    moveZeroes(nums);
    cout << "[";
    for (size_t i = 0; i < nums.size(); i++) {
      if (i) cout << " ";
      cout << nums[i];
    }
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
      moveZeroes(nums);
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < nums.length; i++) {
        if (i > 0) sb.append(' ');
        sb.append(nums[i]);
      }
      sb.append(']');
      System.out.println(sb);
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
    let mut nums: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    move_zeroes(&mut nums);
    let parts: Vec<String> = nums.iter().map(|x| x.to_string()).collect();
    println!(\"[{}]\", parts.join(\" \"));
  }
}
`,
      csharp: `using System;
using System.Linq;

{{SOLUTION}}
class __Judge__ {
    static string FmtArr(int[] a) => "[" + string.Join(" ", a) + "]";
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            int[] nums = line.Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
            new Solution().MoveZeroes(nums);
            Console.WriteLine(FmtArr(nums));
        }
    }
}`,
    },
  },

  // ── 4. Is Palindrome String ────────────────────────────────────────────
  {
    slug: "is-palindrome-string",
    title: "Is Palindrome String",
    category: "two-pointers",
    difficulty: "easy",
    description:
      "Given a string `s`, return `true` if it is a palindrome (reads the same forwards and backwards), or `false` otherwise.\n\nA palindrome ignores case — `\"Racecar\"` is a palindrome. Only consider alphanumeric characters and ignore all others.\n\nHint: Use two pointers starting at each end and compare characters, skipping non-alphanumeric ones.",
    examples: [
      { input: 's = "racecar"', output: "true", explanation: '"racecar" reads the same forwards and backwards.' },
      { input: 's = "hello"', output: "false" },
      { input: 's = "A man a plan a canal Panama"', output: "true", explanation: 'Ignoring spaces and case.' },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"unicode"
)

func isPalindromeStr(s string) bool {
\t// TODO: two-pointer approach, skip non-alphanumeric, compare lowercased
\treturn false
}

func main() {
\tfmt.Println(isPalindromeStr("racecar"))                    // true
\tfmt.Println(isPalindromeStr("hello"))                      // false
\tfmt.Println(isPalindromeStr("A man a plan a canal Panama")) // true
\t_ = unicode.IsLetter
}`,
      python: `def is_palindrome_str(s: str) -> bool:
    # TODO: filter alphanumeric, lowercase, check if equal to reverse
    return False

print(is_palindrome_str("racecar"))                      # True
print(is_palindrome_str("hello"))                        # False
print(is_palindrome_str("A man a plan a canal Panama"))  # True`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindromeStr(string s) {
    // TODO: two-pointer, skip non-alphanumeric, compare lowercased
    return false;
}

int main() {
    cout << boolalpha;
    cout << isPalindromeStr("racecar") << endl;  // true
    cout << isPalindromeStr("hello") << endl;    // false
    return 0;
}`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindromeStr(s) {
    // TODO: filter alphanumeric, lowercase, check palindrome
    return false;
}

console.log(isPalindromeStr("racecar")); // true
console.log(isPalindromeStr("hello"));   // false`,
      java: `public class Main {
    public static boolean isPalindromeStr(String s) {
        // TODO: two-pointer, skip non-alphanumeric, compare lowercased
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindromeStr("racecar")); // true
        System.out.println(isPalindromeStr("hello"));   // false
    }
}`,
      rust: `fn is_palindrome_str(s: &str) -> bool {
    // TODO: collect alphanumeric lowercase chars, check palindrome
    false
}

fn main() {
    println!("{}", is_palindrome_str("racecar")); // true
    println!("{}", is_palindrome_str("hello"));   // false
}`,
      csharp: `using System;
using System.Linq;

public class Solution {
    public bool IsPalindrome(string s) {
        // TODO: check if s is a palindrome (alphanumeric only, case-insensitive)
        return false;
    }
}`,
    },
    testCases: [
      { stdin: "racecar", expectedOutput: "true" },
      { stdin: "hello", expectedOutput: "false" },
      { stdin: "A man a plan a canal Panama", expectedOutput: "true" },
      { stdin: "race a car", expectedOutput: "false" },
      { stdin: "a", expectedOutput: "true" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"unicode"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\ts := scanner.Text()
\t\tfmt.Println(isPalindromeStr(s))
\t}
\t_ = unicode.IsLetter
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  s = line.rstrip("\\n")
  print(is_palindrome_str(s))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  const s = lines[i];
  if (i === lines.length - 1 && s === "") break;
  console.log(String(isPalindromeStr(s)));
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
    if (!s.empty() && s.back() == '\\r') s.pop_back();
    cout << isPalindromeStr(s) << "\\n";
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
      System.out.println(isPalindromeStr(s));
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
    println!(\"{}\", is_palindrome_str(&s));
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
            Console.WriteLine(new Solution().IsPalindrome(line).ToString().ToLower());
        }
    }
}`,
    },
  },

  // ── 5. First Unique Character ──────────────────────────────────────────
  {
    slug: "first-unique-character",
    title: "First Unique Character in a String",
    category: "hash-map",
    difficulty: "easy",
    description:
      "Given a string `s`, find the **first** non-repeating character and return its index. If it does not exist, return `-1`.\n\nHint: Count character frequencies with a hash map, then scan left to right for the first char with count 1.",
    examples: [
      { input: 's = "leetcode"', output: "0", explanation: '"l" appears once and is at index 0.' },
      { input: 's = "loveleetcode"', output: "2", explanation: '"v" is the first unique character.' },
      { input: 's = "aabb"', output: "-1" },
    ],
    starter: {
      go: `package main

import "fmt"

func firstUniqChar(s string) int {
\t// TODO: count frequency, scan for first char with count 1
\treturn -1
}

func main() {
\tfmt.Println(firstUniqChar("leetcode"))    // 0
\tfmt.Println(firstUniqChar("loveleetcode")) // 2
\tfmt.Println(firstUniqChar("aabb"))        // -1
}`,
      python: `def first_uniq_char(s: str) -> int:
    # TODO: count frequency, scan for first char with count 1
    return -1

print(first_uniq_char("leetcode"))     # 0
print(first_uniq_char("loveleetcode")) # 2
print(first_uniq_char("aabb"))         # -1`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

int firstUniqChar(string s) {
    // TODO: count frequency, scan for first char with count 1
    return -1;
}

int main() {
    cout << firstUniqChar("leetcode")    << endl; // 0
    cout << firstUniqChar("loveleetcode") << endl; // 2
    cout << firstUniqChar("aabb")        << endl; // -1
    return 0;
}`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function firstUniqChar(s) {
    // TODO: count frequency, scan for first char with count 1
    return -1;
}

console.log(firstUniqChar("leetcode"));     // 0
console.log(firstUniqChar("loveleetcode")); // 2
console.log(firstUniqChar("aabb"));         // -1`,
      java: `import java.util.*;

public class Main {
    public static int firstUniqChar(String s) {
        // TODO: count frequency, scan for first char with count 1
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(firstUniqChar("leetcode"));     // 0
        System.out.println(firstUniqChar("loveleetcode")); // 2
        System.out.println(firstUniqChar("aabb"));         // -1
    }
}`,
      rust: `use std::collections::HashMap;

fn first_uniq_char(s: &str) -> i32 {
    // TODO: count frequency, scan for first char with count 1
    -1
}

fn main() {
    println!("{}", first_uniq_char("leetcode"));     // 0
    println!("{}", first_uniq_char("loveleetcode")); // 2
    println!("{}", first_uniq_char("aabb"));         // -1
}`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public int FirstUniqChar(string s) {
        // TODO: return the index of the first non-repeating character, or -1
        return -1;
    }
}`,
    },
    testCases: [
      { stdin: "leetcode", expectedOutput: "0" },
      { stdin: "loveleetcode", expectedOutput: "2" },
      { stdin: "aabb", expectedOutput: "-1" },
      { stdin: "z", expectedOutput: "0" },
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
\t\tfmt.Println(firstUniqChar(s))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  s = line.rstrip("\\n")
  print(first_uniq_char(s))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  const s = lines[i];
  if (i === lines.length - 1 && s === "") break;
  console.log(String(firstUniqChar(s)));
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
    cout << firstUniqChar(s) << "\\n";
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
      System.out.println(firstUniqChar(s));
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
    println!(\"{}\", first_uniq_char(&s));
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
            Console.WriteLine(new Solution().FirstUniqChar(line));
        }
    }
}`,
    },
  },

  // ── 6. Majority Element ────────────────────────────────────────────────
  {
    slug: "majority-element",
    title: "Majority Element",
    category: "array",
    difficulty: "easy",
    description:
      "Given an array `nums` of size `n`, return the majority element.\n\nThe majority element is the element that appears **more than** `⌊n / 2⌋` times. You may assume that the majority element always exists.\n\nHint: Boyer-Moore Voting Algorithm — maintain a candidate and count. When count hits 0, switch candidates.",
    examples: [
      { input: "nums = [3, 2, 3]", output: "3" },
      { input: "nums = [2, 2, 1, 1, 1, 2, 2]", output: "2" },
    ],
    starter: {
      go: `package main

import "fmt"

func majorityElement(nums []int) int {
\t// TODO: Boyer-Moore voting — candidate + count
\treturn 0
}

func main() {
\tfmt.Println(majorityElement([]int{3, 2, 3}))             // 3
\tfmt.Println(majorityElement([]int{2, 2, 1, 1, 1, 2, 2})) // 2
}`,
      python: `def majority_element(nums: list[int]) -> int:
    # TODO: Boyer-Moore voting — candidate + count
    return 0

print(majority_element([3, 2, 3]))              # 3
print(majority_element([2, 2, 1, 1, 1, 2, 2])) # 2`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int majorityElement(vector<int>& nums) {
    // TODO: Boyer-Moore voting
    return 0;
}

int main() {
    vector<int> a = {3, 2, 3};
    vector<int> b = {2, 2, 1, 1, 1, 2, 2};
    cout << majorityElement(a) << endl; // 3
    cout << majorityElement(b) << endl; // 2
    return 0;
}`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function majorityElement(nums) {
    // TODO: Boyer-Moore voting — candidate + count
    return 0;
}

console.log(majorityElement([3, 2, 3]));              // 3
console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2`,
      java: `public class Main {
    public static int majorityElement(int[] nums) {
        // TODO: Boyer-Moore voting
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(majorityElement(new int[]{3, 2, 3}));              // 3
        System.out.println(majorityElement(new int[]{2, 2, 1, 1, 1, 2, 2})); // 2
    }
}`,
      rust: `fn majority_element(nums: Vec<i32>) -> i32 {
    // TODO: Boyer-Moore voting — candidate + count
    0
}

fn main() {
    println!("{}", majority_element(vec![3, 2, 3]));              // 3
    println!("{}", majority_element(vec![2, 2, 1, 1, 1, 2, 2])); // 2
}`,
      csharp: `public class Solution {
    public int MajorityElement(int[] nums) {
        // TODO: find the element that appears more than n/2 times
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "3 2 3", expectedOutput: "3" },
      { stdin: "2 2 1 1 1 2 2", expectedOutput: "2" },
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
\t\tfmt.Println(majorityElement(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  nums = [int(x) for x in line.split()]
  print(majority_element(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const nums = line.split(/\s+/).filter(Boolean).map(Number);
  console.log(String(majorityElement(nums)));
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
    cout << majorityElement(nums) << "\\n";
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
      System.out.println(majorityElement(nums));
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
    println!(\"{}\", majority_element(nums));
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
            Console.WriteLine(new Solution().MajorityElement(nums));
        }
    }
}`,
    },
  },

  // ── 7. Plus One ─────────────────────────────────────────────────────────
  {
    slug: "plus-one",
    title: "Plus One",
    category: "array",
    difficulty: "easy",
    description:
      "You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the `i`th digit of the integer. The digits are ordered from most significant to least significant.\n\nIncrement the large integer by one and return the resulting array of digits.\n\nHint: Start from the last digit. If it's 9 set it to 0 and carry over; otherwise just increment it and return.",
    examples: [
      { input: "digits = [1, 2, 3]", output: "[1, 2, 4]", explanation: "123 + 1 = 124." },
      { input: "digits = [4, 3, 2, 1]", output: "[4, 3, 2, 2]" },
      { input: "digits = [9]", output: "[1, 0]", explanation: "9 + 1 = 10." },
    ],
    starter: {
      go: `package main

import "fmt"

func plusOne(digits []int) []int {
\t// TODO: iterate from the end, add 1, handle carry
\treturn digits
}

func main() {
\tfmt.Println(plusOne([]int{1, 2, 3}))    // [1 2 4]
\tfmt.Println(plusOne([]int{9}))           // [1 0]
\tfmt.Println(plusOne([]int{9, 9}))        // [1 0 0]
}`,
      python: `def plus_one(digits: list[int]) -> list[int]:
    # TODO: iterate from the end, add 1, handle carry
    return digits

print(plus_one([1, 2, 3]))  # [1, 2, 4]
print(plus_one([9]))         # [1, 0]
print(plus_one([9, 9]))      # [1, 0, 0]`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> plusOne(vector<int>& digits) {
    // TODO: iterate from the end, add 1, handle carry
    return digits;
}

int main() {
    vector<int> a = {1, 2, 3};
    auto r = plusOne(a);
    cout << "[";
    for (int i = 0; i < (int)r.size(); i++) { if (i) cout << " "; cout << r[i]; }
    cout << "]" << endl;
    return 0;
}`,
      javascript: `/**
 * @param {number[]} digits
 * @return {number[]}
 */
function plusOne(digits) {
    // TODO: iterate from end, add 1, handle carry
    return digits;
}

console.log("[" + plusOne([1, 2, 3]).join(" ") + "]"); // [1 2 4]
console.log("[" + plusOne([9]).join(" ") + "]");        // [1 0]`,
      java: `public class Main {
    public static int[] plusOne(int[] digits) {
        // TODO: iterate from end, add 1, handle carry
        return digits;
    }

    public static void main(String[] args) {
        int[] r = plusOne(new int[]{1, 2, 3});
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(' '); sb.append(r[i]); }
        System.out.println(sb.append(']')); // [1 2 4]
    }
}`,
      rust: `fn plus_one(digits: Vec<i32>) -> Vec<i32> {
    // TODO: iterate from end, add 1, handle carry
    digits
}

fn main() {
    println!("{:?}", plus_one(vec![1, 2, 3])); // [1, 2, 4]
    println!("{:?}", plus_one(vec![9]));         // [1, 0]
}`,
      csharp: `public class Solution {
    public int[] PlusOne(int[] digits) {
        // TODO: increment the large integer represented by digits
        return digits;
    }
}`,
    },
    testCases: [
      { stdin: "1 2 3", expectedOutput: "[1 2 4]" },
      { stdin: "4 3 2 1", expectedOutput: "[4 3 2 2]" },
      { stdin: "9", expectedOutput: "[1 0]" },
      { stdin: "9 9", expectedOutput: "[1 0 0]" },
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
\t\tdigits := make([]int, len(parts))
\t\tfor i, s := range parts { digits[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(plusOne(digits))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  digits = [int(x) for x in line.split()]
  print(plus_one(digits))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const digits = line.split(/\s+/).filter(Boolean).map(Number);
  const res = plusOne(digits);
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
    vector<int> digits;
    { istringstream iss(line); int x; while (iss >> x) digits.push_back(x); }
    auto res = plusOne(digits);
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
      int[] digits = new int[parts.length];
      for (int i = 0; i < parts.length; i++) digits[i] = Integer.parseInt(parts[i]);
      int[] res = plusOne(digits);
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
    let digits: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    let res = plus_one(digits);
    let parts: Vec<String> = res.iter().map(|x| x.to_string()).collect();
    println!(\"[{}]\", parts.join(\" \"));
  }
}
`,
      csharp: `using System;
using System.Linq;

{{SOLUTION}}
class __Judge__ {
    static string FmtArr(int[] a) => "[" + string.Join(" ", a) + "]";
    static void Main() {
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            int[] digits = line.Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
            Console.WriteLine(FmtArr(new Solution().PlusOne(digits)));
        }
    }
}`,
    },
  },

  // ── 8. Fibonacci Number ────────────────────────────────────────────────
  {
    slug: "fibonacci-number",
    title: "Fibonacci Number",
    category: "dynamic-programming",
    difficulty: "easy",
    description:
      "The **Fibonacci numbers** form a sequence: `F(0) = 0`, `F(1) = 1`, and `F(n) = F(n - 1) + F(n - 2)` for `n > 1`.\n\nGiven `n`, compute `F(n)`.\n\nHint: For efficiency, use bottom-up DP — just two variables are enough instead of recursion or a full array.",
    examples: [
      { input: "n = 2", output: "1", explanation: "F(2) = F(1) + F(0) = 1 + 0 = 1." },
      { input: "n = 3", output: "2", explanation: "F(3) = F(2) + F(1) = 1 + 1 = 2." },
      { input: "n = 10", output: "55" },
    ],
    starter: {
      go: `package main

import "fmt"

func fib(n int) int {
\t// TODO: bottom-up DP using two variables
\treturn 0
}

func main() {
\tfmt.Println(fib(0))  // 0
\tfmt.Println(fib(1))  // 1
\tfmt.Println(fib(5))  // 5
\tfmt.Println(fib(10)) // 55
}`,
      python: `def fib(n: int) -> int:
    # TODO: bottom-up DP using two variables
    return 0

print(fib(0))  # 0
print(fib(1))  # 1
print(fib(5))  # 5
print(fib(10)) # 55`,
      cpp: `#include <iostream>
using namespace std;

int fib(int n) {
    // TODO: bottom-up DP
    return 0;
}

int main() {
    cout << fib(0)  << endl; // 0
    cout << fib(1)  << endl; // 1
    cout << fib(5)  << endl; // 5
    cout << fib(10) << endl; // 55
    return 0;
}`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function fib(n) {
    // TODO: bottom-up DP
    return 0;
}

console.log(fib(0));  // 0
console.log(fib(1));  // 1
console.log(fib(5));  // 5
console.log(fib(10)); // 55`,
      java: `public class Main {
    public static int fib(int n) {
        // TODO: bottom-up DP
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(fib(0));  // 0
        System.out.println(fib(1));  // 1
        System.out.println(fib(5));  // 5
        System.out.println(fib(10)); // 55
    }
}`,
      rust: `fn fib(n: u32) -> u32 {
    // TODO: bottom-up DP
    0
}

fn main() {
    println!("{}", fib(0));  // 0
    println!("{}", fib(1));  // 1
    println!("{}", fib(5));  // 5
    println!("{}", fib(10)); // 55
}`,
      csharp: `public class Solution {
    public int Fib(int n) {
        // TODO: return the nth Fibonacci number
        return 0;
    }
}`,
    },
    testCases: [
      { stdin: "0", expectedOutput: "0" },
      { stdin: "1", expectedOutput: "1" },
      { stdin: "5", expectedOutput: "5" },
      { stdin: "10", expectedOutput: "55" },
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
\t\tfmt.Println(fib(n))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  print(fib(int(line)))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  console.log(String(fib(Number(line))));
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
    line.erase(0, line.find_first_not_of(" \\t\\r\\n"));
    line.erase(line.find_last_not_of(" \\t\\r\\n") + 1);
    if (line.empty()) continue;
    cout << fib(stoi(line)) << "\\n";
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
      System.out.println(fib(Integer.parseInt(line)));
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
    println!(\"{}\", fib(n));
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
            Console.WriteLine(new Solution().Fib(n));
        }
    }
}`,
    },
  },
];
