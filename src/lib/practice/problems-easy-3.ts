import type { PracticeProblem } from "./types";

export const EASY_PROBLEMS_3: PracticeProblem[] = [
  // ─── 1. Valid Anagram ────────────────────────────────────────────────────────
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    category: "string",
    difficulty: "easy",
    description:
      "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn **anagram** is a word formed by rearranging the letters of another, using all original letters exactly once.\n\n**Constraints:**\n- `1 <= s.length, t.length <= 5 × 10⁴`\n- `s` and `t` consist of lowercase English letters.",
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true" },
      { input: 's = "rat", t = "car"', output: "false" },
    ],
    starter: {
      go: `package main

import "fmt"

func isAnagram(s string, t string) bool {
\t// TODO: return true if t is an anagram of s
\treturn false
}

func main() {
\tfmt.Println(isAnagram("anagram", "nagaram")) // true
\tfmt.Println(isAnagram("rat", "car"))          // false
}`,
      python: `def is_anagram(s: str, t: str) -> bool:
    # TODO: return True if t is an anagram of s
    return False

if __name__ == "__main__":
    print(is_anagram("anagram", "nagaram"))  # True
    print(is_anagram("rat", "car"))           # False
`,
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
    // TODO: return true if t is an anagram of s
    return false;
}

console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));          // false`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isAnagram(string s, string t) {
    // TODO: return true if t is an anagram of s
    return false;
}

int main() {
    cout << (isAnagram("anagram", "nagaram") ? "true" : "false") << endl;
    cout << (isAnagram("rat", "car") ? "true" : "false") << endl;
    return 0;
}`,
      java: `public class Main {
    public static boolean isAnagram(String s, String t) {
        // TODO: return true if t is an anagram of s
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isAnagram("anagram", "nagaram")); // true
        System.out.println(isAnagram("rat", "car"));          // false
    }
}`,
      rust: `fn is_anagram(s: String, t: String) -> bool {
    // TODO: return true if t is an anagram of s
    false
}

fn main() {
    println!("{}", is_anagram("anagram".to_string(), "nagaram".to_string())); // true
    println!("{}", is_anagram("rat".to_string(), "car".to_string()));          // false
}`,
    },
    testCases: [
      { stdin: "anagram|nagaram", expectedOutput: "true" },
      { stdin: "rat|car", expectedOutput: "false" },
      { stdin: "a|a", expectedOutput: "true" },
      { stdin: "ab|ba", expectedOutput: "true" },
      { stdin: "listen|silent", expectedOutput: "true" },
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
\t\tfmt.Println(isAnagram(s, t))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    s, _, t = line.partition("|")
    print(str(is_anagram(s, t)).lower())
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [s, t] = l.split("|");
  console.log(isAnagram(s || "", t || "") ? "true" : "false");
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    auto bar = line.find('|');
    string s = line.substr(0, bar), t = (bar == string::npos) ? "" : line.substr(bar + 1);
    cout << (isAnagram(s, t) ? "true" : "false") << "\\n";
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
      String s = p[0], t = p.length > 1 ? p[1] : "";
      System.out.println(isAnagram(s, t) ? "true" : "false");
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let p: Vec<&str> = line.splitn(2, '|').collect();
    let s = p[0].to_string(); let t = if p.len() > 1 { p[1].to_string() } else { String::new() };
    println!("{}", is_anagram(s, t));
  }
}`,
    },
  },

  // ─── 2. Roman to Integer ─────────────────────────────────────────────────────
  {
    slug: "roman-to-integer",
    title: "Roman to Integer",
    category: "math",
    difficulty: "easy",
    description:
      "Roman numerals are represented by seven symbols: `I=1, V=5, X=10, L=50, C=100, D=500, M=1000`.\n\nGiven a roman numeral string, convert it to an integer.\n\nSubtraction rules: `IV=4`, `IX=9`, `XL=40`, `XC=90`, `CD=400`, `CM=900`.\n\n**Constraints:**\n- `1 <= s.length <= 15`\n- `s` contains only `I, V, X, L, C, D, M`\n- `1 <= answer <= 3999`",
    examples: [
      { input: 's = "III"', output: "3" },
      { input: 's = "LVIII"', output: "58", explanation: "L=50, V=5, III=3" },
      { input: 's = "MCMXCIV"', output: "1994", explanation: "M=1000, CM=900, XC=90, IV=4" },
    ],
    starter: {
      go: `package main

import "fmt"

func romanToInt(s string) int {
\t// TODO: convert Roman numeral to integer
\treturn 0
}

func main() {
\tfmt.Println(romanToInt("III"))    // 3
\tfmt.Println(romanToInt("LVIII"))  // 58
\tfmt.Println(romanToInt("MCMXCIV")) // 1994
}`,
      python: `def roman_to_int(s: str) -> int:
    # TODO: convert Roman numeral to integer
    return 0

if __name__ == "__main__":
    print(roman_to_int("III"))     # 3
    print(roman_to_int("LVIII"))   # 58
    print(roman_to_int("MCMXCIV")) # 1994
`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function romanToInt(s) {
    // TODO: convert Roman numeral to integer
    return 0;
}

console.log(romanToInt("III"));    // 3
console.log(romanToInt("LVIII"));  // 58
console.log(romanToInt("MCMXCIV")); // 1994`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int romanToInt(string s) {
    // TODO: convert Roman numeral to integer
    return 0;
}

int main() {
    cout << romanToInt("III") << endl;    // 3
    cout << romanToInt("LVIII") << endl;  // 58
    cout << romanToInt("MCMXCIV") << endl; // 1994
    return 0;
}`,
      java: `public class Main {
    public static int romanToInt(String s) {
        // TODO: convert Roman numeral to integer
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(romanToInt("III"));    // 3
        System.out.println(romanToInt("LVIII"));  // 58
        System.out.println(romanToInt("MCMXCIV")); // 1994
    }
}`,
      rust: `fn roman_to_int(s: String) -> i32 {
    // TODO: convert Roman numeral to integer
    0
}

fn main() {
    println!("{}", roman_to_int("III".to_string()));    // 3
    println!("{}", roman_to_int("LVIII".to_string()));  // 58
    println!("{}", roman_to_int("MCMXCIV".to_string())); // 1994
}`,
    },
    testCases: [
      { stdin: "III", expectedOutput: "3" },
      { stdin: "LVIII", expectedOutput: "58" },
      { stdin: "MCMXCIV", expectedOutput: "1994" },
      { stdin: "IV", expectedOutput: "4" },
      { stdin: "IX", expectedOutput: "9" },
      { stdin: "XL", expectedOutput: "40" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tfmt.Println(romanToInt(l))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    print(roman_to_int(line))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  console.log(romanToInt(l));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    cout << romanToInt(line) << "\\n";
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
      System.out.println(romanToInt(line));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    println!("{}", roman_to_int(line));
  }
}`,
    },
  },

  // ─── 3. Max Consecutive Ones ─────────────────────────────────────────────────
  {
    slug: "max-consecutive-ones",
    title: "Max Consecutive Ones",
    category: "array",
    difficulty: "easy",
    description:
      "Given a binary array `nums`, return the maximum number of consecutive `1`s in the array.\n\n**Constraints:**\n- `1 <= nums.length <= 10⁵`\n- `nums[i]` is either `0` or `1`.",
    examples: [
      { input: "nums = [1,1,0,1,1,1]", output: "3", explanation: "The last three ones form the longest run." },
      { input: "nums = [1,0,1,1,0,1]", output: "2" },
    ],
    starter: {
      go: `package main

import "fmt"

func findMaxConsecutiveOnes(nums []int) int {
\t// TODO: find the maximum number of consecutive 1s
\treturn 0
}

func main() {
\tfmt.Println(findMaxConsecutiveOnes([]int{1, 1, 0, 1, 1, 1})) // 3
\tfmt.Println(findMaxConsecutiveOnes([]int{1, 0, 1, 1, 0, 1})) // 2
}`,
      python: `def find_max_consecutive_ones(nums: list[int]) -> int:
    # TODO: find the maximum number of consecutive 1s
    return 0

if __name__ == "__main__":
    print(find_max_consecutive_ones([1, 1, 0, 1, 1, 1]))  # 3
    print(find_max_consecutive_ones([1, 0, 1, 1, 0, 1]))  # 2
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMaxConsecutiveOnes(nums) {
    // TODO: find the maximum number of consecutive 1s
    return 0;
}

console.log(findMaxConsecutiveOnes([1, 1, 0, 1, 1, 1])); // 3
console.log(findMaxConsecutiveOnes([1, 0, 1, 1, 0, 1])); // 2`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int findMaxConsecutiveOnes(vector<int>& nums) {
    // TODO: find the maximum number of consecutive 1s
    return 0;
}

int main() {
    vector<int> a = {1,1,0,1,1,1}, b = {1,0,1,1,0,1};
    cout << findMaxConsecutiveOnes(a) << endl; // 3
    cout << findMaxConsecutiveOnes(b) << endl; // 2
    return 0;
}`,
      java: `public class Main {
    public static int findMaxConsecutiveOnes(int[] nums) {
        // TODO: find the maximum number of consecutive 1s
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findMaxConsecutiveOnes(new int[]{1,1,0,1,1,1})); // 3
        System.out.println(findMaxConsecutiveOnes(new int[]{1,0,1,1,0,1})); // 2
    }
}`,
      rust: `fn find_max_consecutive_ones(nums: Vec<i32>) -> i32 {
    // TODO: find the maximum number of consecutive 1s
    0
}

fn main() {
    println!("{}", find_max_consecutive_ones(vec![1,1,0,1,1,1])); // 3
    println!("{}", find_max_consecutive_ones(vec![1,0,1,1,0,1])); // 2
}`,
    },
    testCases: [
      { stdin: "1 1 0 1 1 1", expectedOutput: "3" },
      { stdin: "1 0 1 1 0 1", expectedOutput: "2" },
      { stdin: "0 0 0", expectedOutput: "0" },
      { stdin: "1 1 1 1", expectedOutput: "4" },
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
\t\tfmt.Println(findMaxConsecutiveOnes(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    print(find_max_consecutive_ones(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const nums = l.split(/\s+/).map(Number);
  console.log(findMaxConsecutiveOnes(nums));
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
    cout << findMaxConsecutiveOnes(nums) << "\\n";
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
      System.out.println(findMaxConsecutiveOnes(nums));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let nums: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    println!("{}", find_max_consecutive_ones(nums));
  }
}`,
    },
  },

  // ─── 4. Power of Two ─────────────────────────────────────────────────────────
  {
    slug: "power-of-two",
    title: "Power of Two",
    category: "math",
    difficulty: "easy",
    description:
      "Given an integer `n`, return `true` if it is a power of two, otherwise return `false`.\n\nAn integer `n` is a power of two if there exists an integer `x` such that `n == 2^x`.\n\n**Constraints:**\n- `-2³¹ <= n <= 2³¹ - 1`\n\n**Follow-up:** Can you solve it without loops/recursion using a bitwise trick?",
    examples: [
      { input: "n = 1", output: "true", explanation: "2⁰ = 1" },
      { input: "n = 16", output: "true", explanation: "2⁴ = 16" },
      { input: "n = 3", output: "false" },
    ],
    starter: {
      go: `package main

import "fmt"

func isPowerOfTwo(n int) bool {
\t// TODO: return true if n is a power of two
\t// Hint: n > 0 && (n & (n-1)) == 0
\treturn false
}

func main() {
\tfmt.Println(isPowerOfTwo(1))  // true
\tfmt.Println(isPowerOfTwo(16)) // true
\tfmt.Println(isPowerOfTwo(3))  // false
}`,
      python: `def is_power_of_two(n: int) -> bool:
    # TODO: return True if n is a power of two
    # Hint: n > 0 and (n & (n - 1)) == 0
    return False

if __name__ == "__main__":
    print(is_power_of_two(1))   # True
    print(is_power_of_two(16))  # True
    print(is_power_of_two(3))   # False
`,
      javascript: `/**
 * @param {number} n
 * @return {boolean}
 */
function isPowerOfTwo(n) {
    // TODO: return true if n is a power of two
    return false;
}

console.log(isPowerOfTwo(1));  // true
console.log(isPowerOfTwo(16)); // true
console.log(isPowerOfTwo(3));  // false`,
      cpp: `#include <iostream>
using namespace std;

bool isPowerOfTwo(int n) {
    // TODO: return true if n is a power of two
    return false;
}

int main() {
    cout << (isPowerOfTwo(1)  ? "true" : "false") << endl;
    cout << (isPowerOfTwo(16) ? "true" : "false") << endl;
    cout << (isPowerOfTwo(3)  ? "true" : "false") << endl;
    return 0;
}`,
      java: `public class Main {
    public static boolean isPowerOfTwo(int n) {
        // TODO: return true if n is a power of two
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPowerOfTwo(1));  // true
        System.out.println(isPowerOfTwo(16)); // true
        System.out.println(isPowerOfTwo(3));  // false
    }
}`,
      rust: `fn is_power_of_two(n: i32) -> bool {
    // TODO: return true if n is a power of two
    false
}

fn main() {
    println!("{}", is_power_of_two(1));  // true
    println!("{}", is_power_of_two(16)); // true
    println!("{}", is_power_of_two(3));  // false
}`,
    },
    testCases: [
      { stdin: "1", expectedOutput: "true" },
      { stdin: "16", expectedOutput: "true" },
      { stdin: "3", expectedOutput: "false" },
      { stdin: "0", expectedOutput: "false" },
      { stdin: "1024", expectedOutput: "true" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"strconv";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tn, _ := strconv.Atoi(strings.TrimSpace(l))
\t\tfmt.Println(isPowerOfTwo(n))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    print(str(is_power_of_two(int(line))).lower())
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  console.log(isPowerOfTwo(Number(l)) ? "true" : "false");
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    int n = stoi(line);
    cout << (isPowerOfTwo(n) ? "true" : "false") << "\\n";
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
      System.out.println(isPowerOfTwo(Integer.parseInt(line.trim())) ? "true" : "false");
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let n: i32 = line.parse().unwrap_or(0);
    println!("{}", is_power_of_two(n));
  }
}`,
    },
  },

  // ─── 5. Reverse Words in a String ────────────────────────────────────────────
  {
    slug: "reverse-words",
    title: "Reverse Words in a String",
    category: "string",
    difficulty: "easy",
    description:
      "Given an input string `s`, reverse the order of the **words**.\n\nA **word** is defined as a sequence of non-space characters. Return the words joined by a single space with no leading or trailing spaces.\n\n**Constraints:**\n- `1 <= s.length <= 10⁴`\n- `s` contains English letters, digits, and spaces\n- There is at least one word in `s`",
    examples: [
      { input: 's = "the sky is blue"', output: '"blue is sky the"' },
      { input: 's = "  hello world  "', output: '"world hello"', explanation: "Extra spaces are removed." },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"strings"
)

func reverseWords(s string) string {
\t// TODO: reverse the words in the string
\treturn ""
}

func main() {
\tfmt.Println(reverseWords("the sky is blue"))   // "blue is sky the"
\tfmt.Println(reverseWords("  hello world  "))   // "world hello"
}`,
      python: `def reverse_words(s: str) -> str:
    # TODO: reverse the words in the string
    return ""

if __name__ == "__main__":
    print(reverse_words("the sky is blue"))  # "blue is sky the"
    print(reverse_words("  hello world  "))  # "world hello"
`,
      javascript: `/**
 * @param {string} s
 * @return {string}
 */
function reverseWords(s) {
    // TODO: reverse the words in the string
    return "";
}

console.log(reverseWords("the sky is blue"));  // "blue is sky the"
console.log(reverseWords("  hello world  "));  // "world hello"`,
      cpp: `#include <iostream>
#include <string>
#include <sstream>
#include <vector>
using namespace std;

string reverseWords(string s) {
    // TODO: reverse the words in the string
    return "";
}

int main() {
    cout << reverseWords("the sky is blue") << endl;
    cout << reverseWords("  hello world  ") << endl;
    return 0;
}`,
      java: `public class Main {
    public static String reverseWords(String s) {
        // TODO: reverse the words in the string
        return "";
    }

    public static void main(String[] args) {
        System.out.println(reverseWords("the sky is blue"));
        System.out.println(reverseWords("  hello world  "));
    }
}`,
      rust: `fn reverse_words(s: String) -> String {
    // TODO: reverse the words in the string
    String::new()
}

fn main() {
    println!("{}", reverse_words("the sky is blue".to_string()));
    println!("{}", reverse_words("  hello world  ".to_string()));
}`,
    },
    testCases: [
      { stdin: "the sky is blue", expectedOutput: "blue is sky the" },
      { stdin: "a good example", expectedOutput: "example good a" },
      { stdin: "hello", expectedOutput: "hello" },
      { stdin: "coding is fun", expectedOutput: "fun is coding" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tfmt.Println(reverseWords(l))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.rstrip("\\n")
    if not line.strip(): continue
    print(reverse_words(line))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").split(/\r?\n/);
for (const raw of lines) {
  if (!raw.trim()) continue;
  console.log(reverseWords(raw));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    cout << reverseWords(line) << "\\n";
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
      System.out.println(reverseWords(line));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap();
    if line.trim().is_empty() { continue; }
    println!("{}", reverse_words(line));
  }
}`,
    },
  },

  // ─── 6. Remove Duplicates from Sorted Array ───────────────────────────────────
  {
    slug: "remove-duplicates-sorted",
    title: "Remove Duplicates from Sorted Array",
    category: "array",
    difficulty: "easy",
    description:
      "Given an integer array `nums` sorted in **non-decreasing order**, remove the duplicates **in-place** such that each unique element appears only once.\n\nReturn the number `k` — the count of unique elements. The first `k` elements of `nums` should hold the unique values in order.\n\n**Constraints:**\n- `1 <= nums.length <= 3 × 10⁴`\n- `-100 <= nums[i] <= 100`\n- `nums` is sorted in non-decreasing order.",
    examples: [
      { input: "nums = [1,1,2]", output: "2", explanation: "The first 2 elements are [1,2]. Return k=2." },
      { input: "nums = [0,0,1,1,1,2,2,3,3,4]", output: "5", explanation: "Return k=5." },
    ],
    starter: {
      go: `package main

import "fmt"

func removeDuplicates(nums []int) int {
\t// TODO: remove duplicates in-place, return count of unique elements
\treturn 0
}

func main() {
\tfmt.Println(removeDuplicates([]int{1, 1, 2}))                   // 2
\tfmt.Println(removeDuplicates([]int{0, 0, 1, 1, 1, 2, 2, 3, 3, 4})) // 5
}`,
      python: `def remove_duplicates(nums: list[int]) -> int:
    # TODO: remove duplicates in-place, return count of unique elements
    return 0

if __name__ == "__main__":
    print(remove_duplicates([1, 1, 2]))                     # 2
    print(remove_duplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4])) # 5
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function removeDuplicates(nums) {
    // TODO: remove duplicates in-place, return count of unique elements
    return 0;
}

console.log(removeDuplicates([1, 1, 2]));                    // 2
console.log(removeDuplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4])); // 5`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int removeDuplicates(vector<int>& nums) {
    // TODO: remove duplicates in-place, return count of unique elements
    return 0;
}

int main() {
    vector<int> a = {1,1,2}, b = {0,0,1,1,1,2,2,3,3,4};
    cout << removeDuplicates(a) << endl; // 2
    cout << removeDuplicates(b) << endl; // 5
    return 0;
}`,
      java: `public class Main {
    public static int removeDuplicates(int[] nums) {
        // TODO: remove duplicates in-place, return count of unique elements
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(removeDuplicates(new int[]{1, 1, 2}));                    // 2
        System.out.println(removeDuplicates(new int[]{0, 0, 1, 1, 1, 2, 2, 3, 3, 4})); // 5
    }
}`,
      rust: `fn remove_duplicates(nums: &mut Vec<i32>) -> i32 {
    // TODO: remove duplicates in-place, return count of unique elements
    0
}

fn main() {
    let mut a = vec![1, 1, 2];
    let mut b = vec![0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
    println!("{}", remove_duplicates(&mut a)); // 2
    println!("{}", remove_duplicates(&mut b)); // 5
}`,
    },
    testCases: [
      { stdin: "1 1 2", expectedOutput: "2" },
      { stdin: "0 0 1 1 1 2 2 3 3 4", expectedOutput: "5" },
      { stdin: "1", expectedOutput: "1" },
      { stdin: "1 2 3 4 5", expectedOutput: "5" },
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
\t\tfmt.Println(removeDuplicates(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    print(remove_duplicates(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const nums = l.split(/\s+/).map(Number);
  console.log(removeDuplicates(nums));
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
    cout << removeDuplicates(nums) << "\\n";
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
      System.out.println(removeDuplicates(nums));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let mut nums: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    println!("{}", remove_duplicates(&mut nums));
  }
}`,
    },
  },

  // ─── 7. Longest Common Prefix ────────────────────────────────────────────────
  {
    slug: "longest-common-prefix",
    title: "Longest Common Prefix",
    category: "string",
    difficulty: "easy",
    description:
      "Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string `\"\"`.\n\nWords are provided as a `|`-separated list.\n\n**Constraints:**\n- `1 <= strs.length <= 200`\n- `0 <= strs[i].length <= 200`\n- `strs[i]` consists of only lowercase English letters.",
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
      { input: 'strs = ["dog","racecar","car"]', output: '""', explanation: "No common prefix." },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"strings"
)

func longestCommonPrefix(strs []string) string {
\t// TODO: find the longest common prefix
\treturn ""
}

func main() {
\tfmt.Println(longestCommonPrefix([]string{"flower", "flow", "flight"})) // "fl"
\tfmt.Println(longestCommonPrefix([]string{"dog", "racecar", "car"}))    // ""
}`,
      python: `def longest_common_prefix(strs: list[str]) -> str:
    # TODO: find the longest common prefix
    return ""

if __name__ == "__main__":
    print(longest_common_prefix(["flower", "flow", "flight"]))  # "fl"
    print(longest_common_prefix(["dog", "racecar", "car"]))     # ""
`,
      javascript: `/**
 * @param {string[]} strs
 * @return {string}
 */
function longestCommonPrefix(strs) {
    // TODO: find the longest common prefix
    return "";
}

console.log(longestCommonPrefix(["flower", "flow", "flight"])); // "fl"
console.log(longestCommonPrefix(["dog", "racecar", "car"]));    // ""`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

string longestCommonPrefix(vector<string>& strs) {
    // TODO: find the longest common prefix
    return "";
}

int main() {
    vector<string> a = {"flower","flow","flight"};
    vector<string> b = {"dog","racecar","car"};
    cout << longestCommonPrefix(a) << endl; // fl
    cout << longestCommonPrefix(b) << endl; // (empty)
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static String longestCommonPrefix(String[] strs) {
        // TODO: find the longest common prefix
        return "";
    }

    public static void main(String[] args) {
        System.out.println(longestCommonPrefix(new String[]{"flower","flow","flight"})); // fl
        System.out.println(longestCommonPrefix(new String[]{"dog","racecar","car"}));    // (empty)
    }
}`,
      rust: `fn longest_common_prefix(strs: Vec<String>) -> String {
    // TODO: find the longest common prefix
    String::new()
}

fn main() {
    let a = vec!["flower","flow","flight"].iter().map(|s| s.to_string()).collect();
    let b = vec!["dog","racecar","car"].iter().map(|s| s.to_string()).collect();
    println!("{}", longest_common_prefix(a));
    println!("{}", longest_common_prefix(b));
}`,
    },
    testCases: [
      { stdin: "flower|flow|flight", expectedOutput: "fl" },
      { stdin: "dog|racecar|car", expectedOutput: "" },
      { stdin: "abc|abc|abc", expectedOutput: "abc" },
      { stdin: "interview|internet|internal", expectedOutput: "inter" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tstrs := strings.Split(l, "|")
\t\tfmt.Println(longestCommonPrefix(strs))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    strs = line.split("|")
    print(longest_common_prefix(strs))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const strs = l.split("|");
  console.log(longestCommonPrefix(strs));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    vector<string> strs;
    stringstream ss(line); string tok;
    while (getline(ss, tok, '|')) strs.push_back(tok);
    cout << longestCommonPrefix(strs) << "\\n";
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
      String[] strs = line.split("\\|");
      System.out.println(longestCommonPrefix(strs));
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let strs: Vec<String> = line.split('|').map(|s| s.to_string()).collect();
    println!("{}", longest_common_prefix(strs));
  }
}`,
    },
  },

  // ─── 8. Find All Duplicates in an Array ──────────────────────────────────────
  {
    slug: "find-all-duplicates",
    title: "Find All Duplicates in an Array",
    category: "array",
    difficulty: "easy",
    description:
      "Given an integer array `nums` of length `n` where all integers are in the range `[1, n]`, some elements appear **twice** and others appear **once**.\n\nReturn an array of all elements that appear **twice**, sorted in ascending order.\n\n**Constraints:**\n- `n == nums.length`\n- `1 <= n <= 10⁵`\n- `1 <= nums[i] <= n`\n- Each element appears once or twice.",
    examples: [
      { input: "nums = [4,3,2,7,8,2,3,1]", output: "[2,3]" },
      { input: "nums = [1,1,2]", output: "[1]" },
      { input: "nums = [1,2]", output: "[]" },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"sort"
)

func findDuplicates(nums []int) []int {
\t// TODO: find all elements that appear twice
\t// Hint: mark visited indices by negating nums[abs(nums[i])-1]
\treturn nil
}

func main() {
\tfmt.Println(findDuplicates([]int{4, 3, 2, 7, 8, 2, 3, 1})) // [2 3]
\tfmt.Println(findDuplicates([]int{1, 1, 2}))                 // [1]
}`,
      python: `def find_duplicates(nums: list[int]) -> list[int]:
    # TODO: find all elements that appear twice
    # Hint: mark visited indices by negating nums[abs(nums[i])-1]
    return []

if __name__ == "__main__":
    print(sorted(find_duplicates([4, 3, 2, 7, 8, 2, 3, 1])))  # [2, 3]
    print(sorted(find_duplicates([1, 1, 2])))                  # [1]
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function findDuplicates(nums) {
    // TODO: find all elements that appear twice
    return [];
}

console.log(findDuplicates([4, 3, 2, 7, 8, 2, 3, 1]).sort((a,b)=>a-b)); // [2,3]
console.log(findDuplicates([1, 1, 2]).sort((a,b)=>a-b));                  // [1]`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<int> findDuplicates(vector<int>& nums) {
    // TODO: find all elements that appear twice
    return {};
}

int main() {
    vector<int> a = {4,3,2,7,8,2,3,1};
    auto res = findDuplicates(a);
    sort(res.begin(), res.end());
    for (int x : res) cout << x << " ";
    cout << endl;
    return 0;
}`,
      java: `import java.util.*;

public class Main {
    public static List<Integer> findDuplicates(int[] nums) {
        // TODO: find all elements that appear twice
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        int[] nums = {4,3,2,7,8,2,3,1};
        List<Integer> res = findDuplicates(nums);
        Collections.sort(res);
        System.out.println(res);
    }
}`,
      rust: `fn find_duplicates(nums: Vec<i32>) -> Vec<i32> {
    // TODO: find all elements that appear twice
    vec![]
}

fn main() {
    let mut res = find_duplicates(vec![4, 3, 2, 7, 8, 2, 3, 1]);
    res.sort();
    println!("{:?}", res); // [2, 3]
}`,
    },
    testCases: [
      { stdin: "4 3 2 7 8 2 3 1", expectedOutput: "[2 3]" },
      { stdin: "1 1 2", expectedOutput: "[1]" },
      { stdin: "1 2", expectedOutput: "[]" },
    ],
    judgeHarness: {
      go: `package main
import ("bufio";"fmt";"os";"sort";"strconv";"strings")
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tparts := strings.Fields(l)
\t\tnums := make([]int, len(parts))
\t\tfor i, s := range parts { nums[i], _ = strconv.Atoi(s) }
\t\tres := findDuplicates(nums)
\t\tsort.Ints(res)
\t\tfmt.Println(res)
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    res = sorted(find_duplicates(nums))
    print(res)
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
function fmt(v) { return "[" + v.join(" ") + "]"; }
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const nums = l.split(/\s+/).map(Number);
  const res = findDuplicates(nums).sort((a,b)=>a-b);
  console.log(fmt(res));
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
    auto res = findDuplicates(nums);
    sort(res.begin(), res.end());
    cout << "[";
    for (size_t i=0;i<res.size();i++){if(i)cout<<" ";cout<<res[i];}
    cout << "]\\n";
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
      List<Integer> res = findDuplicates(nums);
      Collections.sort(res);
      StringBuilder sb = new StringBuilder("[");
      for (int i=0;i<res.size();i++){if(i>0)sb.append(" ");sb.append(res.get(i));}
      sb.append("]");
      System.out.println(sb);
    }
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  for line in std::io::stdin().lock().lines() {
    let line = line.unwrap(); let line = line.trim().to_string();
    if line.is_empty() { continue; }
    let nums: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    let mut res = find_duplicates(nums);
    res.sort();
    let inner: Vec<String> = res.iter().map(|x| x.to_string()).collect();
    println!("[{}]", inner.join(" "));
  }
}`,
    },
  },
];
