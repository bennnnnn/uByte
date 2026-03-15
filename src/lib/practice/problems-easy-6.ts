import type { PracticeProblem } from "./types";

export const EASY_PROBLEMS_6: PracticeProblem[] = [
  {
    slug: "first-bad-version",
    title: "First Bad Version",
    category: "binary-search",
    difficulty: "easy",
    description:
      "You are a product manager and currently leading a team to develop a new product. Unfortunately, the latest version of your product fails the quality check. Since each version is developed based on the previous version, all the versions after a bad version are also bad.\n\nSuppose you have `n` versions `[1, 2, ..., n]` and you want to find out the first bad one, which causes all the following ones to be bad.\n\nYou are given an API `bool isBadVersion(version)` which returns whether `version` is bad. Implement a function to find the first bad version. You should minimize the number of calls to the API.",
    examples: [
      { input: "n = 5, bad = 4", output: "4", explanation: "Calls: isBadVersion(3) → false, isBadVersion(5) → true, isBadVersion(4) → true → 4 is the first bad." },
      { input: "n = 1, bad = 1", output: "1" },
    ],
    starter: {
      python: `# The isBadVersion API is already defined:
# def isBadVersion(version: int) -> bool: ...

def first_bad_version(n: int) -> int:
    lo, hi = 1, n
    # TODO: binary search
    return -1

# Simulation for testing:
BAD = 4
def isBadVersion(v): return v >= BAD

if __name__ == "__main__":
    print(first_bad_version(5))  # 4
`,
      javascript: `/**
 * @param {function} isBadVersion
 * @return {function}
 */
function solution(isBadVersion) {
    return function(n) {
        let lo = 1, hi = n;
        // TODO: binary search
        return -1;
    };
}

// Simulation:
const bad = 4;
const isBadVersion = v => v >= bad;
console.log(solution(isBadVersion)(5));  // 4
`,
      go: `package main

import "fmt"

var bad = 4

func isBadVersion(v int) bool { return v >= bad }

func firstBadVersion(n int) int {
\tlo, hi := 1, n
\t// TODO: binary search
\t_, _ = lo, hi
\treturn -1
}

func main() {
\tfmt.Println(firstBadVersion(5))  // 4
}`,
      java: `public class Main {
    static int bad = 4;
    static boolean isBadVersion(int v) { return v >= bad; }

    public static int firstBadVersion(int n) {
        int lo = 1, hi = n;
        // TODO: binary search
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(firstBadVersion(5));  // 4
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int bad = 4;
bool isBadVersion(int v) { return v >= bad; }

int firstBadVersion(int n) {
    int lo = 1, hi = n;
    // TODO: binary search
    return -1;
}

int main() {
    cout << firstBadVersion(5) << endl;  // 4
}`,
      rust: `static BAD: i32 = 4;
fn is_bad_version(v: i32) -> bool { v >= BAD }

fn first_bad_version(n: i32) -> i32 {
    let (mut lo, mut hi) = (1i32, n);
    // TODO: binary search
    let _ = (lo, hi);
    -1
}

fn main() {
    println!("{}", first_bad_version(5));  // 4
}`,
      csharp: `using System;

class Program {
    static int bad = 4;
    static bool IsBadVersion(int v) => v >= bad;

    static int FirstBadVersion(int n) {
        int lo = 1, hi = n;
        // TODO: binary search
        return -1;
    }

    static void Main() {
        Console.WriteLine(FirstBadVersion(5));  // 4
    }
}`,
    },
  },

  {
    slug: "reverse-integer",
    title: "Reverse Integer",
    category: "math",
    difficulty: "easy",
    description:
      "Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return `0`.\n\nAssume the environment does not allow you to store 64-bit integers (signed or unsigned).",
    examples: [
      { input: "x = 123", output: "321" },
      { input: "x = -123", output: "-321" },
      { input: "x = 120", output: "21" },
    ],
    starter: {
      python: `def reverse(x: int) -> int:
    sign = -1 if x < 0 else 1
    x = abs(x)
    # TODO: reverse digits, check 32-bit overflow, apply sign
    return 0

if __name__ == "__main__":
    print(reverse(123))   # 321
    print(reverse(-123))  # -321
    print(reverse(120))   # 21
`,
      javascript: `/**
 * @param {number} x
 * @return {number}
 */
function reverse(x) {
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    // TODO: reverse digits, check 32-bit overflow, apply sign
    return 0;
}

console.log(reverse(123));   // 321
console.log(reverse(-123));  // -321
`,
      go: `package main

import (
\t"fmt"
\t"math"
)

func reverse(x int) int {
\tsign := 1
\tif x < 0 {
\t\tsign = -1
\t\tx = -x
\t}
\t// TODO: reverse digits, check 32-bit overflow
\t_ = sign
\t_ = math.MaxInt32
\treturn 0
}

func main() {
\tfmt.Println(reverse(123))   // 321
\tfmt.Println(reverse(-123))  // -321
}`,
      java: `public class Main {
    public static int reverse(int x) {
        long result = 0;
        // TODO: reverse digits using modulo, check overflow
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(reverse(123));   // 321
        System.out.println(reverse(-123));  // -321
    }
}`,
      cpp: `#include <iostream>
#include <climits>
using namespace std;

int reverse(int x) {
    long result = 0;
    // TODO: reverse digits using modulo, check for INT_MIN/INT_MAX
    return 0;
}

int main() {
    cout << reverse(123) << endl;   // 321
    cout << reverse(-123) << endl;  // -321
}`,
      rust: `fn reverse(x: i32) -> i32 {
    let (neg, mut n) = (x < 0, x.abs() as i64);
    let mut result: i64 = 0;
    // TODO: reverse digits, check i32 overflow
    let _ = (neg, n, result);
    0
}

fn main() {
    println!("{}", reverse(123));   // 321
    println!("{}", reverse(-123));  // -321
}`,
      csharp: `using System;

class Program {
    static int Reverse(int x) {
        long result = 0;
        // TODO: reverse digits using modulo, check overflow
        return 0;
    }

    static void Main() {
        Console.WriteLine(Reverse(123));   // 321
        Console.WriteLine(Reverse(-123));  // -321
    }
}`,
    },
  },

  {
    slug: "find-all-numbers-disappeared",
    title: "Find All Numbers Disappeared in an Array",
    category: "array",
    difficulty: "easy",
    description:
      "Given an array `nums` of `n` integers where `nums[i]` is in the range `[1, n]`, return an array of all the integers in the range `[1, n]` that do not appear in `nums`.\n\n**Challenge:** Could you do it without extra space and in O(n) runtime?",
    examples: [
      { input: "nums = [4,3,2,7,8,2,3,1]", output: "[5,6]" },
      { input: "nums = [1,1]", output: "[2]" },
    ],
    starter: {
      python: `def find_disappeared_numbers(nums: list[int]) -> list[int]:
    # Mark visited indices by negating: for each nums[i], negate nums[nums[i]-1]
    for n in nums:
        idx = abs(n) - 1
        # TODO: negate nums[idx] if positive
        pass
    # Indices still positive are missing numbers
    return [i + 1 for i, v in enumerate(nums) if v > 0]

if __name__ == "__main__":
    print(find_disappeared_numbers([4,3,2,7,8,2,3,1]))  # [5, 6]
    print(find_disappeared_numbers([1,1]))               # [2]
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function findDisappearedNumbers(nums) {
    for (let i = 0; i < nums.length; i++) {
        const idx = Math.abs(nums[i]) - 1;
        // TODO: negate nums[idx] if positive
    }
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > 0) result.push(i + 1);
    }
    return result;
}

console.log(findDisappearedNumbers([4,3,2,7,8,2,3,1]));  // [5,6]
`,
      go: `package main

import "fmt"

func findDisappearedNumbers(nums []int) []int {
\tfor _, n := range nums {
\t\tidx := n
\t\tif idx < 0 { idx = -idx }
\t\tidx--
\t\t// TODO: negate nums[idx] if positive
\t}
\tresult := []int{}
\tfor i, v := range nums {
\t\tif v > 0 {
\t\t\tresult = append(result, i+1)
\t\t}
\t}
\treturn result
}

func main() {
\tfmt.Println(findDisappearedNumbers([]int{4,3,2,7,8,2,3,1}))  // [5 6]
}`,
      java: `import java.util.*;

public class Main {
    public static List<Integer> findDisappearedNumbers(int[] nums) {
        for (int n : nums) {
            int idx = Math.abs(n) - 1;
            // TODO: negate nums[idx] if positive
        }
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] > 0) result.add(i + 1);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(findDisappearedNumbers(new int[]{4,3,2,7,8,2,3,1}));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

vector<int> findDisappearedNumbers(vector<int>& nums) {
    for (int n : nums) {
        int idx = abs(n) - 1;
        // TODO: negate nums[idx] if positive
    }
    vector<int> result;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] > 0) result.push_back(i + 1);
    }
    return result;
}

int main() {
    vector<int> nums = {4,3,2,7,8,2,3,1};
    auto res = findDisappearedNumbers(nums);
    for (int v : res) cout << v << " ";
    cout << endl;
}`,
      rust: `fn find_disappeared_numbers(mut nums: Vec<i32>) -> Vec<i32> {
    for i in 0..nums.len() {
        let idx = (nums[i].abs() - 1) as usize;
        // TODO: negate nums[idx] if positive
        let _ = idx;
    }
    nums.iter().enumerate()
        .filter(|(_, &v)| v > 0)
        .map(|(i, _)| i as i32 + 1)
        .collect()
}

fn main() {
    println!("{:?}", find_disappeared_numbers(vec![4,3,2,7,8,2,3,1]));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static IList<int> FindDisappearedNumbers(int[] nums) {
        for (int i = 0; i < nums.Length; i++) {
            int idx = Math.Abs(nums[i]) - 1;
            // TODO: negate nums[idx] if positive
        }
        var result = new List<int>();
        for (int i = 0; i < nums.Length; i++) {
            if (nums[i] > 0) result.Add(i + 1);
        }
        return result;
    }

    static void Main() {
        Console.WriteLine(string.Join(", ", FindDisappearedNumbers(new[]{4,3,2,7,8,2,3,1})));
    }
}`,
    },
  },

  {
    slug: "longest-palindrome-build",
    title: "Longest Palindrome from Characters",
    category: "string",
    difficulty: "easy",
    description:
      "Given a string `s` which consists of lowercase or uppercase letters, return the length of the longest palindrome that can be built with those letters.\n\nLetters are case sensitive, for example, `\"Aa\"` is not considered a palindrome.",
    examples: [
      { input: 's = "abccccdd"', output: "7", explanation: "One of the longest palindromes: \"dccaccd\" (length 7)." },
      { input: 's = "a"', output: "1" },
    ],
    starter: {
      python: `from collections import Counter

def longest_palindrome(s: str) -> int:
    counts = Counter(s)
    length = 0
    has_odd = False
    for count in counts.values():
        length += count // 2 * 2
        if count % 2 == 1:
            has_odd = True
    return length + (1 if has_odd else 0)

if __name__ == "__main__":
    print(longest_palindrome("abccccdd"))  # 7
    print(longest_palindrome("a"))          # 1
`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function longestPalindrome(s) {
    const count = {};
    for (const c of s) count[c] = (count[c] || 0) + 1;
    let length = 0, hasOdd = false;
    for (const cnt of Object.values(count)) {
        length += Math.floor(cnt / 2) * 2;
        if (cnt % 2 === 1) hasOdd = true;
    }
    return length + (hasOdd ? 1 : 0);
}

console.log(longestPalindrome("abccccdd"));  // 7
`,
      go: `package main

import "fmt"

func longestPalindrome(s string) int {
\tcount := map[rune]int{}
\tfor _, c := range s {
\t\tcount[c]++
\t}
\tlength, hasOdd := 0, false
\tfor _, cnt := range count {
\t\tlength += cnt / 2 * 2
\t\tif cnt%2 == 1 {
\t\t\thasOdd = true
\t\t}
\t}
\tif hasOdd {
\t\tlength++
\t}
\treturn length
}

func main() {
\tfmt.Println(longestPalindrome("abccccdd"))  // 7
}`,
      java: `import java.util.*;

public class Main {
    public static int longestPalindrome(String s) {
        int[] count = new int[128];
        for (char c : s.toCharArray()) count[c]++;
        int length = 0;
        boolean hasOdd = false;
        for (int cnt : count) {
            length += cnt / 2 * 2;
            if (cnt % 2 == 1) hasOdd = true;
        }
        return length + (hasOdd ? 1 : 0);
    }

    public static void main(String[] args) {
        System.out.println(longestPalindrome("abccccdd"));  // 7
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

int longestPalindrome(string s) {
    unordered_map<char,int> count;
    for (char c : s) count[c]++;
    int length = 0;
    bool hasOdd = false;
    for (auto& [c, cnt] : count) {
        length += cnt / 2 * 2;
        if (cnt % 2 == 1) hasOdd = true;
    }
    return length + (hasOdd ? 1 : 0);
}

int main() {
    cout << longestPalindrome("abccccdd") << endl;  // 7
}`,
      rust: `use std::collections::HashMap;

fn longest_palindrome(s: &str) -> usize {
    let mut count: HashMap<char, usize> = HashMap::new();
    for c in s.chars() { *count.entry(c).or_insert(0) += 1; }
    let (mut length, mut has_odd) = (0usize, false);
    for &cnt in count.values() {
        length += cnt / 2 * 2;
        if cnt % 2 == 1 { has_odd = true; }
    }
    length + if has_odd { 1 } else { 0 }
}

fn main() {
    println!("{}", longest_palindrome("abccccdd"));  // 7
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static int LongestPalindrome(string s) {
        var count = new Dictionary<char, int>();
        foreach (char c in s) {
            count[c] = count.GetValueOrDefault(c, 0) + 1;
        }
        int length = 0;
        bool hasOdd = false;
        foreach (int cnt in count.Values) {
            length += cnt / 2 * 2;
            if (cnt % 2 == 1) hasOdd = true;
        }
        return length + (hasOdd ? 1 : 0);
    }

    static void Main() {
        Console.WriteLine(LongestPalindrome("abccccdd"));  // 7
    }
}`,
    },
  },

  {
    slug: "check-if-pangram",
    title: "Check if the Sentence Is Pangram",
    category: "string",
    difficulty: "easy",
    description:
      "A **pangram** is a sentence where every letter of the English alphabet appears at least once.\n\nGiven a string `sentence` containing only lowercase English letters, return `true` if `sentence` is a pangram, or `false` otherwise.",
    examples: [
      { input: 'sentence = "thequickbrownfoxjumpsoverthelazydog"', output: "true", explanation: "All 26 letters are present." },
      { input: 'sentence = "leetcode"', output: "false" },
    ],
    starter: {
      python: `def check_if_pangram(sentence: str) -> bool:
    return len(set(sentence)) == 26

if __name__ == "__main__":
    print(check_if_pangram("thequickbrownfoxjumpsoverthelazydog"))  # True
    print(check_if_pangram("leetcode"))                               # False
`,
      javascript: `/**
 * @param {string} sentence
 * @return {boolean}
 */
function checkIfPangram(sentence) {
    return new Set(sentence).size === 26;
}

console.log(checkIfPangram("thequickbrownfoxjumpsoverthelazydog"));  // true
console.log(checkIfPangram("leetcode"));                               // false
`,
      go: `package main

import "fmt"

func checkIfPangram(sentence string) bool {
\tseen := map[rune]bool{}
\tfor _, c := range sentence {
\t\tseen[c] = true
\t}
\treturn len(seen) == 26
}

func main() {
\tfmt.Println(checkIfPangram("thequickbrownfoxjumpsoverthelazydog"))  // true
\tfmt.Println(checkIfPangram("leetcode"))                               // false
}`,
      java: `import java.util.*;

public class Main {
    public static boolean checkIfPangram(String sentence) {
        Set<Character> seen = new HashSet<>();
        for (char c : sentence.toCharArray()) seen.add(c);
        return seen.size() == 26;
    }

    public static void main(String[] args) {
        System.out.println(checkIfPangram("thequickbrownfoxjumpsoverthelazydog"));  // true
        System.out.println(checkIfPangram("leetcode"));                               // false
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_set>
using namespace std;

bool checkIfPangram(string sentence) {
    unordered_set<char> seen(sentence.begin(), sentence.end());
    return seen.size() == 26;
}

int main() {
    cout << checkIfPangram("thequickbrownfoxjumpsoverthelazydog") << endl;  // 1
    cout << checkIfPangram("leetcode") << endl;                               // 0
}`,
      rust: `use std::collections::HashSet;

fn check_if_pangram(sentence: &str) -> bool {
    let seen: HashSet<char> = sentence.chars().collect();
    seen.len() == 26
}

fn main() {
    println!("{}", check_if_pangram("thequickbrownfoxjumpsoverthelazydog"));  // true
    println!("{}", check_if_pangram("leetcode"));                               // false
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static bool CheckIfPangram(string sentence) {
        var seen = new HashSet<char>(sentence);
        return seen.Count == 26;
    }

    static void Main() {
        Console.WriteLine(CheckIfPangram("thequickbrownfoxjumpsoverthelazydog"));  // True
        Console.WriteLine(CheckIfPangram("leetcode"));                               // False
    }
}`,
    },
  },

  {
    slug: "number-complement",
    title: "Number Complement",
    category: "math",
    difficulty: "easy",
    description:
      "The **complement** of an integer is the integer you get when you flip all the `0`s to `1`s and all the `1`s to `0`s in its binary representation.\n\nGiven an integer `num`, return its complement.",
    examples: [
      { input: "num = 5", output: "2", explanation: "5 in binary is 101, its complement is 010 which is 2." },
      { input: "num = 1", output: "0" },
    ],
    starter: {
      python: `def find_complement(num: int) -> int:
    # Find the bitmask with all 1s of the same bit-length as num
    mask = (1 << num.bit_length()) - 1
    return num ^ mask

if __name__ == "__main__":
    print(find_complement(5))  # 2
    print(find_complement(1))  # 0
    print(find_complement(7))  # 0
`,
      javascript: `/**
 * @param {number} num
 * @return {number}
 */
function findComplement(num) {
    const bitLen = Math.floor(Math.log2(num)) + 1;
    const mask = (1 << bitLen) - 1;
    return num ^ mask;
}

console.log(findComplement(5));  // 2
console.log(findComplement(1));  // 0
`,
      go: `package main

import (
\t"fmt"
\t"math/bits"
)

func findComplement(num int) int {
\tbits := bits.Len(uint(num))
\tmask := (1 << bits) - 1
\treturn num ^ mask
}

func main() {
\tfmt.Println(findComplement(5))  // 2
\tfmt.Println(findComplement(1))  // 0
}`,
      java: `public class Main {
    public static int findComplement(int num) {
        int bits = 32 - Integer.numberOfLeadingZeros(num);
        int mask = (1 << bits) - 1;
        return num ^ mask;
    }

    public static void main(String[] args) {
        System.out.println(findComplement(5));  // 2
        System.out.println(findComplement(1));  // 0
    }
}`,
      cpp: `#include <iostream>
#include <cmath>
using namespace std;

int findComplement(int num) {
    int bits = (int)log2(num) + 1;
    int mask = (1 << bits) - 1;
    return num ^ mask;
}

int main() {
    cout << findComplement(5) << endl;  // 2
    cout << findComplement(1) << endl;  // 0
}`,
      rust: `fn find_complement(num: u32) -> u32 {
    let bits = u32::BITS - num.leading_zeros();
    let mask = (1u32 << bits) - 1;
    num ^ mask
}

fn main() {
    println!("{}", find_complement(5));  // 2
    println!("{}", find_complement(1));  // 0
}`,
      csharp: `using System;

class Program {
    static int FindComplement(int num) {
        int bits = (int)Math.Floor(Math.Log2(num)) + 1;
        int mask = (1 << bits) - 1;
        return num ^ mask;
    }

    static void Main() {
        Console.WriteLine(FindComplement(5));  // 2
        Console.WriteLine(FindComplement(1));  // 0
    }
}`,
    },
  },

  {
    slug: "max-consecutive-ones-flip",
    title: "Max Consecutive Ones (with one flip)",
    category: "sliding-window",
    difficulty: "easy",
    description:
      "Given a binary array `nums`, return the maximum number of consecutive `1`s in the array if you can flip at most one `0`.\n\n**Constraints:** `1 <= nums.length <= 10^5`",
    examples: [
      { input: "nums = [1,0,1,1,0]", output: "4", explanation: "Flip the first 0 to get [1,1,1,1,0] or flip the second to get [1,0,1,1,1]." },
      { input: "nums = [1,0,1,1,0,1]", output: "4" },
    ],
    starter: {
      python: `def find_max_consecutive_ones(nums: list[int]) -> int:
    # Sliding window: track the index of the last seen zero
    last_zero = -1
    max_len = 0
    start = 0
    for end, val in enumerate(nums):
        if val == 0:
            # TODO: move start past the previous zero
            last_zero = end
        max_len = max(max_len, end - start + 1)
    return max_len

if __name__ == "__main__":
    print(find_max_consecutive_ones([1,0,1,1,0]))    # 4
    print(find_max_consecutive_ones([1,0,1,1,0,1]))  # 4
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMaxConsecutiveOnes(nums) {
    let start = 0, lastZero = -1, maxLen = 0;
    for (let end = 0; end < nums.length; end++) {
        if (nums[end] === 0) {
            // TODO: move start past the previous zero
            lastZero = end;
        }
        maxLen = Math.max(maxLen, end - start + 1);
    }
    return maxLen;
}

console.log(findMaxConsecutiveOnes([1,0,1,1,0]));    // 4
console.log(findMaxConsecutiveOnes([1,0,1,1,0,1]));  // 4
`,
      go: `package main

import "fmt"

func findMaxConsecutiveOnes(nums []int) int {
\tstart, lastZero, maxLen := 0, -1, 0
\tfor end, val := range nums {
\t\tif val == 0 {
\t\t\t// TODO: move start past the previous zero
\t\t\tlastZero = end
\t\t}
\t\tif end - start + 1 > maxLen {
\t\t\tmaxLen = end - start + 1
\t\t}
\t}
\t_, _ = start, lastZero
\treturn maxLen
}

func main() {
\tfmt.Println(findMaxConsecutiveOnes([]int{1,0,1,1,0}))    // 4
\tfmt.Println(findMaxConsecutiveOnes([]int{1,0,1,1,0,1}))  // 4
}`,
      java: `public class Main {
    public static int findMaxConsecutiveOnes(int[] nums) {
        int start = 0, lastZero = -1, maxLen = 0;
        for (int end = 0; end < nums.length; end++) {
            if (nums[end] == 0) {
                // TODO: move start past the previous zero
                lastZero = end;
            }
            maxLen = Math.max(maxLen, end - start + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(findMaxConsecutiveOnes(new int[]{1,0,1,1,0}));    // 4
        System.out.println(findMaxConsecutiveOnes(new int[]{1,0,1,1,0,1}));  // 4
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int findMaxConsecutiveOnes(vector<int>& nums) {
    int start = 0, lastZero = -1, maxLen = 0;
    for (int end = 0; end < (int)nums.size(); end++) {
        if (nums[end] == 0) {
            // TODO: move start past the previous zero
            lastZero = end;
        }
        maxLen = max(maxLen, end - start + 1);
    }
    return maxLen;
}

int main() {
    vector<int> a = {1,0,1,1,0};
    cout << findMaxConsecutiveOnes(a) << endl;  // 4
}`,
      rust: `fn find_max_consecutive_ones(nums: &[i32]) -> usize {
    let (mut start, mut last_zero, mut max_len) = (0usize, 0usize, 0usize);
    let mut has_zero = false;
    for (end, &val) in nums.iter().enumerate() {
        if val == 0 {
            if has_zero { start = last_zero + 1; }
            last_zero = end;
            has_zero = true;
        }
        max_len = max_len.max(end - start + 1);
    }
    max_len
}

fn main() {
    println!("{}", find_max_consecutive_ones(&[1,0,1,1,0]));    // 4
    println!("{}", find_max_consecutive_ones(&[1,0,1,1,0,1]));  // 4
}`,
      csharp: `using System;

class Program {
    static int FindMaxConsecutiveOnes(int[] nums) {
        int start = 0, lastZero = -1, maxLen = 0;
        for (int end = 0; end < nums.Length; end++) {
            if (nums[end] == 0) {
                // TODO: move start past the previous zero
                lastZero = end;
            }
            maxLen = Math.Max(maxLen, end - start + 1);
        }
        return maxLen;
    }

    static void Main() {
        Console.WriteLine(FindMaxConsecutiveOnes(new[]{1,0,1,1,0}));    // 4
        Console.WriteLine(FindMaxConsecutiveOnes(new[]{1,0,1,1,0,1}));  // 4
    }
}`,
    },
  },

  {
    slug: "best-time-sell-stock-ii",
    title: "Best Time to Buy and Sell Stock II",
    category: "greedy",
    difficulty: "easy",
    description:
      "You are given an integer array `prices` where `prices[i]` is the price of a given stock on the `i`-th day.\n\nOn each day, you may decide to buy and/or sell the stock. You can only hold **at most one share** of the stock at any time. However, you can buy it then immediately sell it on the **same day**.\n\nFind and return the **maximum profit** you can achieve.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "7", explanation: "Buy on day 2 (price=1), sell on day 3 (price=5). Buy on day 4 (price=3), sell on day 5 (price=6). Total profit = 4 + 3 = 7." },
      { input: "prices = [1,2,3,4,5]", output: "4", explanation: "Buy on day 1, sell on day 5. Profit = 5-1 = 4." },
      { input: "prices = [7,6,4,3,1]", output: "0" },
    ],
    starter: {
      python: `def max_profit(prices: list[int]) -> int:
    profit = 0
    for i in range(1, len(prices)):
        # Capture every upward move (greedy)
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit

if __name__ == "__main__":
    print(max_profit([7,1,5,3,6,4]))  # 7
    print(max_profit([1,2,3,4,5]))    # 4
    print(max_profit([7,6,4,3,1]))    # 0
`,
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
    }
    return profit;
}

console.log(maxProfit([7,1,5,3,6,4]));  // 7
console.log(maxProfit([1,2,3,4,5]));    // 4
`,
      go: `package main

import "fmt"

func maxProfit(prices []int) int {
\tprofit := 0
\tfor i := 1; i < len(prices); i++ {
\t\tif prices[i] > prices[i-1] {
\t\t\tprofit += prices[i] - prices[i-1]
\t\t}
\t}
\treturn profit
}

func main() {
\tfmt.Println(maxProfit([]int{7,1,5,3,6,4}))  // 7
\tfmt.Println(maxProfit([]int{1,2,3,4,5}))    // 4
}`,
      java: `public class Main {
    public static int maxProfit(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
        }
        return profit;
    }

    public static void main(String[] args) {
        System.out.println(maxProfit(new int[]{7,1,5,3,6,4}));  // 7
        System.out.println(maxProfit(new int[]{1,2,3,4,5}));    // 4
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int maxProfit(vector<int>& prices) {
    int profit = 0;
    for (int i = 1; i < (int)prices.size(); i++) {
        if (prices[i] > prices[i-1]) profit += prices[i] - prices[i-1];
    }
    return profit;
}

int main() {
    vector<int> a = {7,1,5,3,6,4};
    cout << maxProfit(a) << endl;  // 7
}`,
      rust: `fn max_profit(prices: &[i32]) -> i32 {
    prices.windows(2).map(|w| (w[1] - w[0]).max(0)).sum()
}

fn main() {
    println!("{}", max_profit(&[7,1,5,3,6,4]));  // 7
    println!("{}", max_profit(&[1,2,3,4,5]));    // 4
}`,
      csharp: `using System;

class Program {
    static int MaxProfit(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.Length; i++) {
            if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
        }
        return profit;
    }

    static void Main() {
        Console.WriteLine(MaxProfit(new[]{7,1,5,3,6,4}));  // 7
        Console.WriteLine(MaxProfit(new[]{1,2,3,4,5}));    // 4
    }
}`,
    },
  },

  {
    slug: "summary-ranges",
    title: "Summary Ranges",
    category: "array",
    difficulty: "easy",
    description:
      "You are given a **sorted unique** integer array `nums`.\n\nA **range** `[a, b]` is the set of all integers from `a` to `b` (inclusive). Return the **smallest sorted** list of ranges that cover all the numbers in the array exactly. That is, each element of `nums` is covered by exactly one of the ranges, and there is no integer `x` such that `x` is in one of the ranges but not in `nums`.\n\nEach range `[a, b]` in the list should be output as:\n- `\"a->b\"` if `a != b`\n- `\"a\"` if `a == b`",
    examples: [
      { input: "nums = [0,1,2,4,5,7]", output: '["0->2","4->5","7"]' },
      { input: "nums = [0,2,3,4,6,8,9]", output: '["0","2->4","6","8->9"]' },
    ],
    starter: {
      python: `def summary_ranges(nums: list[int]) -> list[str]:
    result = []
    i = 0
    while i < len(nums):
        start = nums[i]
        while i + 1 < len(nums) and nums[i + 1] == nums[i] + 1:
            i += 1
        result.append(f"{start}->{nums[i]}" if nums[i] != start else str(start))
        i += 1
    return result

if __name__ == "__main__":
    print(summary_ranges([0,1,2,4,5,7]))        # ["0->2","4->5","7"]
    print(summary_ranges([0,2,3,4,6,8,9]))      # ["0","2->4","6","8->9"]
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {string[]}
 */
function summaryRanges(nums) {
    const result = [];
    let i = 0;
    while (i < nums.length) {
        const start = nums[i];
        while (i + 1 < nums.length && nums[i + 1] === nums[i] + 1) i++;
        result.push(nums[i] !== start ? \`\${start}->\${nums[i]}\` : \`\${start}\`);
        i++;
    }
    return result;
}

console.log(summaryRanges([0,1,2,4,5,7]));
`,
      go: `package main

import (
\t"fmt"
\t"strconv"
)

func summaryRanges(nums []int) []string {
\tresult := []string{}
\ti := 0
\tfor i < len(nums) {
\t\tstart := nums[i]
\t\tfor i+1 < len(nums) && nums[i+1] == nums[i]+1 {
\t\t\ti++
\t\t}
\t\tif nums[i] != start {
\t\t\tresult = append(result, strconv.Itoa(start)+"->"+strconv.Itoa(nums[i]))
\t\t} else {
\t\t\tresult = append(result, strconv.Itoa(start))
\t\t}
\t\ti++
\t}
\treturn result
}

func main() {
\tfmt.Println(summaryRanges([]int{0,1,2,4,5,7}))
}`,
      java: `import java.util.*;

public class Main {
    public static List<String> summaryRanges(int[] nums) {
        List<String> result = new ArrayList<>();
        int i = 0;
        while (i < nums.length) {
            int start = nums[i];
            while (i + 1 < nums.length && nums[i + 1] == nums[i] + 1) i++;
            result.add(nums[i] != start ? start + "->" + nums[i] : String.valueOf(start));
            i++;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(summaryRanges(new int[]{0,1,2,4,5,7}));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> summaryRanges(vector<int>& nums) {
    vector<string> result;
    int i = 0;
    while (i < (int)nums.size()) {
        int start = nums[i];
        while (i+1 < (int)nums.size() && nums[i+1] == nums[i]+1) i++;
        if (nums[i] != start)
            result.push_back(to_string(start) + "->" + to_string(nums[i]));
        else
            result.push_back(to_string(start));
        i++;
    }
    return result;
}

int main() {
    vector<int> nums = {0,1,2,4,5,7};
    for (auto& s : summaryRanges(nums)) cout << s << " ";
    cout << endl;
}`,
      rust: `fn summary_ranges(nums: Vec<i32>) -> Vec<String> {
    let mut result = vec![];
    let mut i = 0;
    while i < nums.len() {
        let start = nums[i];
        while i + 1 < nums.len() && nums[i + 1] == nums[i] + 1 {
            i += 1;
        }
        if nums[i] != start {
            result.push(format!("{}->{}", start, nums[i]));
        } else {
            result.push(format!("{}", start));
        }
        i += 1;
    }
    result
}

fn main() {
    println!("{:?}", summary_ranges(vec![0,1,2,4,5,7]));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static IList<string> SummaryRanges(int[] nums) {
        var result = new List<string>();
        int i = 0;
        while (i < nums.Length) {
            int start = nums[i];
            while (i + 1 < nums.Length && nums[i + 1] == nums[i] + 1) i++;
            result.Add(nums[i] != start ? $"{start}->{nums[i]}" : $"{start}");
            i++;
        }
        return result;
    }

    static void Main() {
        Console.WriteLine(string.Join(", ", SummaryRanges(new[]{0,1,2,4,5,7})));
    }
}`,
    },
  },
];
