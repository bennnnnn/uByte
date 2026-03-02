import type { PracticeProblem } from "./types";
import type { SupportedLanguage } from "@/lib/languages/types";

// ─── Default starters ───────────────────────────────────────────────────────

const DEFAULT_GO = `package main

import "fmt"

func main() {
\t// Your code here
\tfmt.Println()
}`;

const DEFAULT_PYTHON = `# Your code here
def main():
    pass

if __name__ == "__main__":
    main()`;

const DEFAULT_CPP = `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`;

const DEFAULT_JS = `// Your code here\nconsole.log("Hello, World!");`;
const DEFAULT_JAVA = `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`;
const DEFAULT_RUST = `fn main() {\n    // Your code here\n    println!("Hello, World!");\n}`;

// ─── Problems ───────────────────────────────────────────────────────────────

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  // ── Easy ─────────────────────────────────────────────────────────────────
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
  },
  // ── Medium ───────────────────────────────────────────────────────────────
  {
    slug: "three-sum",
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
    },
  },
  {
    slug: "maximum-subarray",
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
    },
  },
  {
    slug: "longest-substring-without-repeating",
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
    },
  },
  {
    slug: "merge-intervals",
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
    },
  },
  // ── Hard ─────────────────────────────────────────────────────────────────
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    description:
      "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.\n\nHint: For each position, the water trapped equals `min(maxLeft, maxRight) - height[i]`. Use two pointers for an O(n) solution.",
    difficulty: "hard",
    examples: [
      {
        input: "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
        output: "6",
      },
      { input: "height = [4, 2, 0, 3, 2, 5]", output: "9" },
    ],
    starter: {
      go: `package main

import "fmt"

func trap(height []int) int {
\t// TODO: two-pointer approach — track maxLeft, maxRight
\treturn 0
}

func main() {
\tfmt.Println(trap([]int{0,1,0,2,1,0,1,3,2,1,2,1})) // 6
\tfmt.Println(trap([]int{4,2,0,3,2,5}))               // 9
}`,
      python: `def trap(height: list[int]) -> int:
    # TODO: two-pointer approach
    return 0

print(trap([0,1,0,2,1,0,1,3,2,1,2,1]))  # 6
print(trap([4,2,0,3,2,5]))               # 9`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int trap(vector<int>& height) {
    // TODO: two-pointer approach
    return 0;
}

int main() {
    vector<int> a = {0,1,0,2,1,0,1,3,2,1,2,1};
    vector<int> b = {4,2,0,3,2,5};
    cout << trap(a) << endl; // 6
    cout << trap(b) << endl; // 9
    return 0;
}`,
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
    // TODO: two-pointer approach
    return 0;
}

console.log(trap([0,1,0,2,1,0,1,3,2,1,2,1])); // 6
console.log(trap([4,2,0,3,2,5]));               // 9`,
      java: `public class Main {
    public static int trap(int[] height) {
        // TODO: two-pointer approach
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(trap(new int[]{0,1,0,2,1,0,1,3,2,1,2,1})); // 6
        System.out.println(trap(new int[]{4,2,0,3,2,5}));               // 9
    }
}`,
      rust: `fn trap(height: Vec<i32>) -> i32 {
    // TODO: two-pointer approach
    0
}

fn main() {
    println!("{}", trap(vec![0,1,0,2,1,0,1,3,2,1,2,1])); // 6
    println!("{}", trap(vec![4,2,0,3,2,5]));               // 9
}`,
    },
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getPracticeProblemBySlug(slug: string): PracticeProblem | null {
  return PRACTICE_PROBLEMS.find((p) => p.slug === slug) ?? null;
}

export function getAllPracticeProblems(): PracticeProblem[] {
  return [...PRACTICE_PROBLEMS];
}

export function getStarterForLanguage(
  problem: PracticeProblem,
  lang: SupportedLanguage
): string {
  const code = problem.starter[lang];
  if (code) return code;
  switch (lang) {
    case "go":         return DEFAULT_GO;
    case "python":     return DEFAULT_PYTHON;
    case "cpp":        return DEFAULT_CPP;
    case "javascript": return DEFAULT_JS;
    case "java":       return DEFAULT_JAVA;
    case "rust":       return DEFAULT_RUST;
    default:           return DEFAULT_GO;
  }
}
