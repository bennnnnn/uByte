import type { PracticeProblem } from "./types";

export const EASY_PROBLEMS_5: PracticeProblem[] = [
  // ── Math ─────────────────────────────────────────────────────────────────

  {
    slug: "fizz-buzz",
    title: "Fizz Buzz",
    category: "math",
    difficulty: "easy",
    description:
      "Given an integer `n`, return a string array `answer` (1-indexed) where:\n\n- `answer[i] == \"FizzBuzz\"` if `i` is divisible by both 3 and 5.\n- `answer[i] == \"Fizz\"` if `i` is divisible by 3.\n- `answer[i] == \"Buzz\"` if `i` is divisible by 5.\n- `answer[i] == i` (as a string) otherwise.",
    examples: [
      { input: "n = 3", output: "[\"1\", \"2\", \"Fizz\"]" },
      { input: "n = 5", output: "[\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]" },
      { input: "n = 15", output: "[\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\", \"Fizz\", \"7\", \"8\", \"Fizz\", \"Buzz\", \"11\", \"Fizz\", \"13\", \"14\", \"FizzBuzz\"]" },
    ],
    starter: {
      python: `def fizz_buzz(n: int) -> list[str]:
    # Build the result list from 1..n
    return []

if __name__ == "__main__":
    print(fizz_buzz(5))   # ["1", "2", "Fizz", "4", "Buzz"]
    print(fizz_buzz(15))  # [..., "FizzBuzz"]
`,
      javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
    // Build the result array from 1..n
    return [];
}

console.log(fizzBuzz(5));  // ["1","2","Fizz","4","Buzz"]
`,
      go: `package main

import "fmt"

func fizzBuzz(n int) []string {
\tresult := make([]string, n)
\t// TODO: fill result[i] for i in 1..n
\treturn result
}

func main() {
\tfmt.Println(fizzBuzz(5))
}`,
      java: `import java.util.*;

public class Main {
    public static List<String> fizzBuzz(int n) {
        // TODO: build and return the list
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(fizzBuzz(5));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> fizzBuzz(int n) {
    vector<string> result;
    // TODO: push "Fizz", "Buzz", "FizzBuzz", or the number as string
    return result;
}

int main() {
    auto res = fizzBuzz(5);
    for (auto& s : res) cout << s << " ";
    cout << endl;
}`,
      rust: `fn fizz_buzz(n: i32) -> Vec<String> {
    // TODO: build and return the vec
    vec![]
}

fn main() {
    println!("{:?}", fizz_buzz(5));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static IList<string> FizzBuzz(int n) {
        // TODO: build and return the list
        return new List<string>();
    }

    static void Main() {
        Console.WriteLine(string.Join(", ", FizzBuzz(5)));
    }
}`,
    },
  },

  {
    slug: "palindrome-number",
    title: "Palindrome Number",
    category: "math",
    difficulty: "easy",
    description:
      "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.\n\n**Follow-up:** Could you solve it without converting the integer to a string?",
    examples: [
      { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and right to left." },
      { input: "x = -121", output: "false", explanation: "From left to right it reads -121. From right to left it reads 121-." },
      { input: "x = 10", output: "false", explanation: "Reads 01 from right to left." },
    ],
    starter: {
      python: `def is_palindrome(x: int) -> bool:
    # Negative numbers and numbers ending in 0 (except 0) are not palindromes
    return False

if __name__ == "__main__":
    print(is_palindrome(121))   # True
    print(is_palindrome(-121))  # False
    print(is_palindrome(10))    # False
`,
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
    return false;
}

console.log(isPalindrome(121));   // true
console.log(isPalindrome(-121));  // false
`,
      go: `package main

import "fmt"

func isPalindrome(x int) bool {
\t// TODO
\treturn false
}

func main() {
\tfmt.Println(isPalindrome(121))   // true
\tfmt.Println(isPalindrome(-121))  // false
}`,
      java: `public class Main {
    public static boolean isPalindrome(int x) {
        // TODO
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome(121));   // true
        System.out.println(isPalindrome(-121));  // false
    }
}`,
      cpp: `#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    // TODO
    return false;
}

int main() {
    cout << isPalindrome(121) << endl;   // 1
    cout << isPalindrome(-121) << endl;  // 0
}`,
      rust: `fn is_palindrome(x: i32) -> bool {
    // TODO
    false
}

fn main() {
    println!("{}", is_palindrome(121));   // true
    println!("{}", is_palindrome(-121));  // false
}`,
      csharp: `using System;

class Program {
    static bool IsPalindrome(int x) {
        // TODO
        return false;
    }

    static void Main() {
        Console.WriteLine(IsPalindrome(121));   // True
        Console.WriteLine(IsPalindrome(-121));  // False
    }
}`,
    },
  },

  {
    slug: "happy-number",
    title: "Happy Number",
    category: "math",
    difficulty: "easy",
    description:
      "Write an algorithm to determine if a number `n` is **happy**.\n\nA **happy number** is defined by the following process:\n- Starting with any positive integer, replace the number by the sum of the squares of its digits.\n- Repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle that does not include 1.\n- Numbers for which this process ends in 1 are happy.\n\nReturn `true` if `n` is a happy number, and `false` if not.",
    examples: [
      { input: "n = 19", output: "true", explanation: "1² + 9² = 82 → 8² + 2² = 68 → 6² + 8² = 100 → 1² = 1." },
      { input: "n = 2", output: "false" },
    ],
    starter: {
      python: `def is_happy(n: int) -> bool:
    # Use a set to detect cycles, or Floyd's cycle detection
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        # TODO: compute sum of squares of digits
        pass
    return n == 1

if __name__ == "__main__":
    print(is_happy(19))  # True
    print(is_happy(2))   # False
`,
      javascript: `/**
 * @param {number} n
 * @return {boolean}
 */
function isHappy(n) {
    const seen = new Set();
    while (n !== 1 && !seen.has(n)) {
        seen.add(n);
        // TODO: compute sum of squares of digits
    }
    return n === 1;
}

console.log(isHappy(19));  // true
console.log(isHappy(2));   // false
`,
      go: `package main

import "fmt"

func isHappy(n int) bool {
\tseen := map[int]bool{}
\tfor n != 1 && !seen[n] {
\t\tseen[n] = true
\t\t// TODO: compute sum of squares of digits
\t}
\treturn n == 1
}

func main() {
\tfmt.Println(isHappy(19)) // true
\tfmt.Println(isHappy(2))  // false
}`,
      java: `import java.util.*;

public class Main {
    public static boolean isHappy(int n) {
        Set<Integer> seen = new HashSet<>();
        while (n != 1 && !seen.contains(n)) {
            seen.add(n);
            // TODO: compute sum of squares of digits
        }
        return n == 1;
    }

    public static void main(String[] args) {
        System.out.println(isHappy(19));  // true
        System.out.println(isHappy(2));   // false
    }
}`,
      cpp: `#include <iostream>
#include <unordered_set>
using namespace std;

bool isHappy(int n) {
    unordered_set<int> seen;
    while (n != 1 && seen.find(n) == seen.end()) {
        seen.insert(n);
        // TODO: compute sum of squares of digits
    }
    return n == 1;
}

int main() {
    cout << isHappy(19) << endl;  // 1
    cout << isHappy(2) << endl;   // 0
}`,
      rust: `use std::collections::HashSet;

fn is_happy(mut n: u32) -> bool {
    let mut seen = HashSet::new();
    while n != 1 && !seen.contains(&n) {
        seen.insert(n);
        // TODO: compute sum of squares of digits
    }
    n == 1
}

fn main() {
    println!("{}", is_happy(19));  // true
    println!("{}", is_happy(2));   // false
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static bool IsHappy(int n) {
        var seen = new HashSet<int>();
        while (n != 1 && !seen.Contains(n)) {
            seen.Add(n);
            // TODO: compute sum of squares of digits
        }
        return n == 1;
    }

    static void Main() {
        Console.WriteLine(IsHappy(19));  // True
        Console.WriteLine(IsHappy(2));   // False
    }
}`,
    },
  },

  {
    slug: "sqrt-integer",
    title: "Integer Square Root",
    category: "binary-search",
    difficulty: "easy",
    description:
      "Given a non-negative integer `x`, return the square root of `x` rounded down to the nearest integer. The returned integer should be non-negative as well.\n\nYou must not use any built-in exponent function or operator.\n\n**Hint:** Use binary search in the range `[0, x]`.",
    examples: [
      { input: "x = 4", output: "2" },
      { input: "x = 8", output: "2", explanation: "The square root of 8 is 2.828..., rounded down to 2." },
      { input: "x = 0", output: "0" },
    ],
    starter: {
      python: `def my_sqrt(x: int) -> int:
    if x < 2:
        return x
    lo, hi = 1, x // 2
    # TODO: binary search
    return -1

if __name__ == "__main__":
    print(my_sqrt(4))   # 2
    print(my_sqrt(8))   # 2
    print(my_sqrt(25))  # 5
`,
      javascript: `/**
 * @param {number} x
 * @return {number}
 */
function mySqrt(x) {
    if (x < 2) return x;
    let lo = 1, hi = Math.floor(x / 2);
    // TODO: binary search
    return -1;
}

console.log(mySqrt(4));  // 2
console.log(mySqrt(8));  // 2
`,
      go: `package main

import "fmt"

func mySqrt(x int) int {
\tif x < 2 {
\t\treturn x
\t}
\tlo, hi := 1, x/2
\t// TODO: binary search
\t_ = lo; _ = hi
\treturn -1
}

func main() {
\tfmt.Println(mySqrt(4))   // 2
\tfmt.Println(mySqrt(8))   // 2
\tfmt.Println(mySqrt(25))  // 5
}`,
      java: `public class Main {
    public static int mySqrt(int x) {
        if (x < 2) return x;
        int lo = 1, hi = x / 2;
        // TODO: binary search
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(mySqrt(4));  // 2
        System.out.println(mySqrt(8));  // 2
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int mySqrt(int x) {
    if (x < 2) return x;
    long lo = 1, hi = x / 2;
    // TODO: binary search
    return -1;
}

int main() {
    cout << mySqrt(4) << endl;   // 2
    cout << mySqrt(8) << endl;   // 2
    cout << mySqrt(25) << endl;  // 5
}`,
      rust: `fn my_sqrt(x: u64) -> u64 {
    if x < 2 { return x; }
    let (mut lo, mut hi) = (1u64, x / 2);
    // TODO: binary search
    let _ = (lo, hi);
    0
}

fn main() {
    println!("{}", my_sqrt(4));   // 2
    println!("{}", my_sqrt(8));   // 2
    println!("{}", my_sqrt(25));  // 5
}`,
      csharp: `using System;

class Program {
    static int MySqrt(int x) {
        if (x < 2) return x;
        int lo = 1, hi = x / 2;
        // TODO: binary search
        return -1;
    }

    static void Main() {
        Console.WriteLine(MySqrt(4));  // 2
        Console.WriteLine(MySqrt(8));  // 2
    }
}`,
    },
  },

  {
    slug: "pascal-triangle",
    title: "Pascal's Triangle",
    category: "array",
    difficulty: "easy",
    description:
      "Given an integer `numRows`, return the first `numRows` of Pascal's triangle.\n\nIn Pascal's triangle, each number is the sum of the two numbers directly above it:\n\n```\n    1\n   1 1\n  1 2 1\n 1 3 3 1\n1 4 6 4 1\n```",
    examples: [
      {
        input: "numRows = 5",
        output: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]",
      },
      { input: "numRows = 1", output: "[[1]]" },
    ],
    starter: {
      python: `def generate(num_rows: int) -> list[list[int]]:
    triangle = []
    for i in range(num_rows):
        # Each row starts and ends with 1
        row = [1] * (i + 1)
        # TODO: fill inner values
        triangle.append(row)
    return triangle

if __name__ == "__main__":
    for row in generate(5):
        print(row)
`,
      javascript: `/**
 * @param {number} numRows
 * @return {number[][]}
 */
function generate(numRows) {
    const triangle = [];
    for (let i = 0; i < numRows; i++) {
        const row = new Array(i + 1).fill(1);
        // TODO: fill inner values from previous row
        triangle.push(row);
    }
    return triangle;
}

console.log(generate(5));
`,
      go: `package main

import "fmt"

func generate(numRows int) [][]int {
\ttriangle := make([][]int, numRows)
\tfor i := 0; i < numRows; i++ {
\t\trow := make([]int, i+1)
\t\trow[0], row[i] = 1, 1
\t\t// TODO: fill inner values
\t\ttriangle[i] = row
\t}
\treturn triangle
}

func main() {
\tfmt.Println(generate(5))
}`,
      java: `import java.util.*;

public class Main {
    public static List<List<Integer>> generate(int numRows) {
        List<List<Integer>> triangle = new ArrayList<>();
        for (int i = 0; i < numRows; i++) {
            Integer[] row = new Integer[i + 1];
            row[0] = row[i] = 1;
            // TODO: fill inner values
            triangle.add(Arrays.asList(row));
        }
        return triangle;
    }

    public static void main(String[] args) {
        System.out.println(generate(5));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> generate(int numRows) {
    vector<vector<int>> triangle;
    for (int i = 0; i < numRows; i++) {
        vector<int> row(i + 1, 1);
        // TODO: fill inner values
        triangle.push_back(row);
    }
    return triangle;
}

int main() {
    auto tri = generate(5);
    for (auto& row : tri) {
        for (int v : row) cout << v << " ";
        cout << endl;
    }
}`,
      rust: `fn generate(num_rows: usize) -> Vec<Vec<i32>> {
    let mut triangle: Vec<Vec<i32>> = vec![];
    for i in 0..num_rows {
        let mut row = vec![1i32; i + 1];
        // TODO: fill inner values from previous row
        triangle.push(row);
    }
    triangle
}

fn main() {
    for row in generate(5) {
        println!("{:?}", row);
    }
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static IList<IList<int>> Generate(int numRows) {
        var triangle = new List<IList<int>>();
        for (int i = 0; i < numRows; i++) {
            var row = new int[i + 1];
            row[0] = row[i] = 1;
            // TODO: fill inner values
            triangle.Add(row);
        }
        return triangle;
    }

    static void Main() {
        foreach (var row in Generate(5))
            Console.WriteLine("[" + string.Join(", ", row) + "]");
    }
}`,
    },
  },

  {
    slug: "isomorphic-strings",
    title: "Isomorphic Strings",
    category: "hash-map",
    difficulty: "easy",
    description:
      "Given two strings `s` and `t`, determine if they are isomorphic.\n\nTwo strings `s` and `t` are isomorphic if the characters in `s` can be replaced to get `t`. All occurrences of a character must be replaced with another character while preserving the order of characters. No two characters may map to the same character, but a character may map to itself.",
    examples: [
      { input: 's = "egg", t = "add"', output: "true" },
      { input: 's = "foo", t = "bar"', output: "false" },
      { input: 's = "paper", t = "title"', output: "true" },
    ],
    starter: {
      python: `def is_isomorphic(s: str, t: str) -> bool:
    # Map each char in s to char in t (and back)
    s_to_t = {}
    t_to_s = {}
    for cs, ct in zip(s, t):
        # TODO: check and build mappings
        pass
    return True

if __name__ == "__main__":
    print(is_isomorphic("egg", "add"))    # True
    print(is_isomorphic("foo", "bar"))    # False
    print(is_isomorphic("paper", "title"))  # True
`,
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isIsomorphic(s, t) {
    const sToT = {}, tToS = {};
    for (let i = 0; i < s.length; i++) {
        const cs = s[i], ct = t[i];
        // TODO: check and build mappings
    }
    return true;
}

console.log(isIsomorphic("egg", "add"));    // true
console.log(isIsomorphic("foo", "bar"));    // false
`,
      go: `package main

import "fmt"

func isIsomorphic(s string, t string) bool {
\tsToT := map[byte]byte{}
\ttToS := map[byte]byte{}
\tfor i := 0; i < len(s); i++ {
\t\t// TODO: check and build mappings
\t\t_ = sToT; _ = tToS
\t}
\treturn true
}

func main() {
\tfmt.Println(isIsomorphic("egg", "add"))    // true
\tfmt.Println(isIsomorphic("foo", "bar"))    // false
}`,
      java: `import java.util.*;

public class Main {
    public static boolean isIsomorphic(String s, String t) {
        Map<Character, Character> sToT = new HashMap<>(), tToS = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char cs = s.charAt(i), ct = t.charAt(i);
            // TODO: check and build mappings
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isIsomorphic("egg", "add"));   // true
        System.out.println(isIsomorphic("foo", "bar"));   // false
    }
}`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

bool isIsomorphic(string s, string t) {
    unordered_map<char,char> sToT, tToS;
    for (int i = 0; i < (int)s.size(); i++) {
        // TODO: check and build mappings
    }
    return true;
}

int main() {
    cout << isIsomorphic("egg", "add") << endl;   // 1
    cout << isIsomorphic("foo", "bar") << endl;   // 0
}`,
      rust: `use std::collections::HashMap;

fn is_isomorphic(s: &str, t: &str) -> bool {
    let (sb, tb): (Vec<u8>, Vec<u8>) = (s.bytes().collect(), t.bytes().collect());
    let mut s_to_t: HashMap<u8, u8> = HashMap::new();
    let mut t_to_s: HashMap<u8, u8> = HashMap::new();
    for (cs, ct) in sb.iter().zip(tb.iter()) {
        // TODO: check and build mappings
        let _ = (&mut s_to_t, &mut t_to_s, cs, ct);
    }
    true
}

fn main() {
    println!("{}", is_isomorphic("egg", "add"));   // true
    println!("{}", is_isomorphic("foo", "bar"));   // false
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static bool IsIsomorphic(string s, string t) {
        var sToT = new Dictionary<char, char>();
        var tToS = new Dictionary<char, char>();
        for (int i = 0; i < s.Length; i++) {
            char cs = s[i], ct = t[i];
            // TODO: check and build mappings
        }
        return true;
    }

    static void Main() {
        Console.WriteLine(IsIsomorphic("egg", "add"));   // True
        Console.WriteLine(IsIsomorphic("foo", "bar"));   // False
    }
}`,
    },
  },

  {
    slug: "ransom-note",
    title: "Ransom Note",
    category: "hash-map",
    difficulty: "easy",
    description:
      "Given two strings `ransomNote` and `magazine`, return `true` if `ransomNote` can be constructed by using the letters from `magazine`, and `false` otherwise.\n\nEach letter in `magazine` can only be used once in `ransomNote`.",
    examples: [
      { input: 'ransomNote = "a", magazine = "b"', output: "false" },
      { input: 'ransomNote = "aa", magazine = "ab"', output: "false" },
      { input: 'ransomNote = "aa", magazine = "aab"', output: "true" },
    ],
    starter: {
      python: `from collections import Counter

def can_construct(ransom_note: str, magazine: str) -> bool:
    mag_count = Counter(magazine)
    for ch in ransom_note:
        # TODO: check availability and reduce count
        pass
    return True

if __name__ == "__main__":
    print(can_construct("a", "b"))     # False
    print(can_construct("aa", "aab"))  # True
`,
      javascript: `/**
 * @param {string} ransomNote
 * @param {string} magazine
 * @return {boolean}
 */
function canConstruct(ransomNote, magazine) {
    const count = {};
    for (const ch of magazine) count[ch] = (count[ch] || 0) + 1;
    for (const ch of ransomNote) {
        // TODO: check and decrement
    }
    return true;
}

console.log(canConstruct("a", "b"));    // false
console.log(canConstruct("aa", "aab")); // true
`,
      go: `package main

import "fmt"

func canConstruct(ransomNote string, magazine string) bool {
\tcount := [26]int{}
\tfor _, ch := range magazine {
\t\tcount[ch-'a']++
\t}
\tfor _, ch := range ransomNote {
\t\t// TODO: check and decrement
\t\t_ = ch
\t}
\treturn true
}

func main() {
\tfmt.Println(canConstruct("a", "b"))     // false
\tfmt.Println(canConstruct("aa", "aab"))  // true
}`,
      java: `public class Main {
    public static boolean canConstruct(String ransomNote, String magazine) {
        int[] count = new int[26];
        for (char c : magazine.toCharArray()) count[c - 'a']++;
        for (char c : ransomNote.toCharArray()) {
            // TODO: check and decrement
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(canConstruct("a", "b"));    // false
        System.out.println(canConstruct("aa", "aab")); // true
    }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

bool canConstruct(string ransomNote, string magazine) {
    int count[26] = {};
    for (char c : magazine) count[c - 'a']++;
    for (char c : ransomNote) {
        // TODO: check and decrement
    }
    return true;
}

int main() {
    cout << canConstruct("a", "b") << endl;     // 0
    cout << canConstruct("aa", "aab") << endl;  // 1
}`,
      rust: `fn can_construct(ransom_note: &str, magazine: &str) -> bool {
    let mut count = [0i32; 26];
    for c in magazine.bytes() { count[(c - b'a') as usize] += 1; }
    for c in ransom_note.bytes() {
        // TODO: check and decrement
        let _ = c;
    }
    true
}

fn main() {
    println!("{}", can_construct("a", "b"));     // false
    println!("{}", can_construct("aa", "aab"));  // true
}`,
      csharp: `using System;

class Program {
    static bool CanConstruct(string ransomNote, string magazine) {
        int[] count = new int[26];
        foreach (char c in magazine) count[c - 'a']++;
        foreach (char c in ransomNote) {
            // TODO: check and decrement
        }
        return true;
    }

    static void Main() {
        Console.WriteLine(CanConstruct("a", "b"));    // False
        Console.WriteLine(CanConstruct("aa", "aab")); // True
    }
}`,
    },
  },

  {
    slug: "word-pattern",
    title: "Word Pattern",
    category: "hash-map",
    difficulty: "easy",
    description:
      "Given a `pattern` and a string `s`, find if `s` follows the same pattern.\n\nHere, 'follow' means a full match, such that there is a bijection between a letter in `pattern` and a non-empty word in `s`.",
    examples: [
      { input: 'pattern = "abba", s = "dog cat cat dog"', output: "true" },
      { input: 'pattern = "abba", s = "dog cat cat fish"', output: "false" },
      { input: 'pattern = "aaaa", s = "dog cat cat dog"', output: "false" },
    ],
    starter: {
      python: `def word_pattern(pattern: str, s: str) -> bool:
    words = s.split()
    if len(pattern) != len(words):
        return False
    char_to_word = {}
    word_to_char = {}
    for ch, word in zip(pattern, words):
        # TODO: check and build bijection
        pass
    return True

if __name__ == "__main__":
    print(word_pattern("abba", "dog cat cat dog"))   # True
    print(word_pattern("abba", "dog cat cat fish"))  # False
`,
      javascript: `/**
 * @param {string} pattern
 * @param {string} s
 * @return {boolean}
 */
function wordPattern(pattern, s) {
    const words = s.split(' ');
    if (pattern.length !== words.length) return false;
    const cToW = {}, wToC = {};
    for (let i = 0; i < pattern.length; i++) {
        const ch = pattern[i], word = words[i];
        // TODO: check and build bijection
    }
    return true;
}

console.log(wordPattern("abba", "dog cat cat dog"));   // true
console.log(wordPattern("abba", "dog cat cat fish"));  // false
`,
      go: `package main

import (
\t"fmt"
\t"strings"
)

func wordPattern(pattern string, s string) bool {
\twords := strings.Fields(s)
\tif len(pattern) != len(words) {
\t\treturn false
\t}
\tcToW := map[byte]string{}
\twToC := map[string]byte{}
\tfor i := 0; i < len(pattern); i++ {
\t\t// TODO: check and build bijection
\t\t_ = cToW; _ = wToC
\t}
\treturn true
}

func main() {
\tfmt.Println(wordPattern("abba", "dog cat cat dog"))   // true
\tfmt.Println(wordPattern("abba", "dog cat cat fish"))  // false
}`,
      java: `import java.util.*;

public class Main {
    public static boolean wordPattern(String pattern, String s) {
        String[] words = s.split(" ");
        if (pattern.length() != words.length) return false;
        Map<Character, String> cToW = new HashMap<>();
        Map<String, Character> wToC = new HashMap<>();
        for (int i = 0; i < pattern.length(); i++) {
            char c = pattern.charAt(i);
            String word = words[i];
            // TODO: check and build bijection
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(wordPattern("abba", "dog cat cat dog"));   // true
        System.out.println(wordPattern("abba", "dog cat cat fish"));  // false
    }
}`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <sstream>
#include <vector>
#include <string>
using namespace std;

bool wordPattern(string pattern, string s) {
    vector<string> words;
    istringstream iss(s);
    string w;
    while (iss >> w) words.push_back(w);
    if (pattern.size() != words.size()) return false;
    unordered_map<char, string> cToW;
    unordered_map<string, char> wToC;
    for (int i = 0; i < (int)pattern.size(); i++) {
        // TODO: check and build bijection
    }
    return true;
}

int main() {
    cout << wordPattern("abba", "dog cat cat dog") << endl;   // 1
    cout << wordPattern("abba", "dog cat cat fish") << endl;  // 0
}`,
      rust: `use std::collections::HashMap;

fn word_pattern(pattern: &str, s: &str) -> bool {
    let words: Vec<&str> = s.split_whitespace().collect();
    if pattern.len() != words.len() { return false; }
    let mut c_to_w: HashMap<u8, &str> = HashMap::new();
    let mut w_to_c: HashMap<&str, u8> = HashMap::new();
    for (c, word) in pattern.bytes().zip(words.iter()) {
        // TODO: check and build bijection
        let _ = (&mut c_to_w, &mut w_to_c, c, word);
    }
    true
}

fn main() {
    println!("{}", word_pattern("abba", "dog cat cat dog"));   // true
    println!("{}", word_pattern("abba", "dog cat cat fish"));  // false
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static bool WordPattern(string pattern, string s) {
        var words = s.Split(' ');
        if (pattern.Length != words.Length) return false;
        var cToW = new Dictionary<char, string>();
        var wToC = new Dictionary<string, char>();
        for (int i = 0; i < pattern.Length; i++) {
            char c = pattern[i];
            string word = words[i];
            // TODO: check and build bijection
        }
        return true;
    }

    static void Main() {
        Console.WriteLine(WordPattern("abba", "dog cat cat dog"));   // True
        Console.WriteLine(WordPattern("abba", "dog cat cat fish"));  // False
    }
}`,
    },
  },

  {
    slug: "intersection-two-arrays",
    title: "Intersection of Two Arrays",
    category: "hash-map",
    difficulty: "easy",
    description:
      "Given two integer arrays `nums1` and `nums2`, return an array of their intersection. Each element in the result must be **unique**, and you may return the result in **any order**.",
    examples: [
      { input: "nums1 = [1,2,2,1], nums2 = [2,2]", output: "[2]" },
      { input: "nums1 = [4,9,5], nums2 = [9,4,9,8,4]", output: "[9,4]", explanation: "[4,9] is also accepted." },
    ],
    starter: {
      python: `def intersection(nums1: list[int], nums2: list[int]) -> list[int]:
    set1 = set(nums1)
    # TODO: return elements present in both sets
    return []

if __name__ == "__main__":
    print(intersection([1,2,2,1], [2,2]))       # [2]
    print(intersection([4,9,5], [9,4,9,8,4]))   # [9, 4]
`,
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
function intersection(nums1, nums2) {
    const set1 = new Set(nums1);
    // TODO: filter nums2 for elements in set1 (unique result)
    return [];
}

console.log(intersection([1,2,2,1], [2,2]));      // [2]
console.log(intersection([4,9,5], [9,4,9,8,4]));  // [9,4]
`,
      go: `package main

import "fmt"

func intersection(nums1 []int, nums2 []int) []int {
\tset1 := map[int]bool{}
\tfor _, n := range nums1 {
\t\tset1[n] = true
\t}
\tresSet := map[int]bool{}
\tfor _, n := range nums2 {
\t\t// TODO: add to resSet if in set1
\t\t_ = n
\t}
\tresult := []int{}
\tfor n := range resSet {
\t\tresult = append(result, n)
\t}
\treturn result
}

func main() {
\tfmt.Println(intersection([]int{1,2,2,1}, []int{2,2}))
}`,
      java: `import java.util.*;

public class Main {
    public static int[] intersection(int[] nums1, int[] nums2) {
        Set<Integer> set1 = new HashSet<>();
        for (int n : nums1) set1.add(n);
        Set<Integer> result = new HashSet<>();
        for (int n : nums2) {
            // TODO: add to result if present in set1
        }
        return result.stream().mapToInt(Integer::intValue).toArray();
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(intersection(new int[]{1,2,2,1}, new int[]{2,2})));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {
    unordered_set<int> set1(nums1.begin(), nums1.end());
    unordered_set<int> result;
    for (int n : nums2) {
        // TODO: add to result if in set1
    }
    return vector<int>(result.begin(), result.end());
}

int main() {
    vector<int> a = {1,2,2,1}, b = {2,2};
    auto res = intersection(a, b);
    for (int v : res) cout << v << " ";
    cout << endl;
}`,
      rust: `use std::collections::HashSet;

fn intersection(nums1: Vec<i32>, nums2: Vec<i32>) -> Vec<i32> {
    let set1: HashSet<i32> = nums1.into_iter().collect();
    let result: HashSet<i32> = nums2.into_iter().filter(|n| set1.contains(n)).collect();
    result.into_iter().collect()
}

fn main() {
    println!("{:?}", intersection(vec![1,2,2,1], vec![2,2]));
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static int[] Intersection(int[] nums1, int[] nums2) {
        var set1 = new HashSet<int>(nums1);
        // TODO: return unique elements in both
        return Array.Empty<int>();
    }

    static void Main() {
        Console.WriteLine(string.Join(", ", Intersection(new[]{1,2,2,1}, new[]{2,2})));
    }
}`,
    },
  },

  {
    slug: "valid-perfect-square",
    title: "Valid Perfect Square",
    category: "binary-search",
    difficulty: "easy",
    description:
      "Given a positive integer `num`, return `true` if `num` is a perfect square, or `false` otherwise.\n\nA **perfect square** is an integer that is the square of an integer. In other words, it is the product of some integer with itself.\n\nYou must not use any built-in library function, such as `sqrt`.",
    examples: [
      { input: "num = 16", output: "true", explanation: "4 * 4 = 16." },
      { input: "num = 14", output: "false" },
    ],
    starter: {
      python: `def is_perfect_square(num: int) -> bool:
    lo, hi = 1, num
    # TODO: binary search for an integer whose square == num
    return False

if __name__ == "__main__":
    print(is_perfect_square(16))   # True
    print(is_perfect_square(14))   # False
    print(is_perfect_square(1))    # True
`,
      javascript: `/**
 * @param {number} num
 * @return {boolean}
 */
function isPerfectSquare(num) {
    let lo = 1, hi = num;
    // TODO: binary search
    return false;
}

console.log(isPerfectSquare(16));  // true
console.log(isPerfectSquare(14));  // false
`,
      go: `package main

import "fmt"

func isPerfectSquare(num int) bool {
\tlo, hi := 1, num
\tfor lo <= hi {
\t\t// TODO: binary search
\t\t_ = lo; _ = hi
\t\tbreak
\t}
\treturn false
}

func main() {
\tfmt.Println(isPerfectSquare(16))  // true
\tfmt.Println(isPerfectSquare(14))  // false
}`,
      java: `public class Main {
    public static boolean isPerfectSquare(int num) {
        long lo = 1, hi = num;
        // TODO: binary search
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPerfectSquare(16));  // true
        System.out.println(isPerfectSquare(14));  // false
    }
}`,
      cpp: `#include <iostream>
using namespace std;

bool isPerfectSquare(int num) {
    long lo = 1, hi = num;
    // TODO: binary search
    return false;
}

int main() {
    cout << isPerfectSquare(16) << endl;  // 1
    cout << isPerfectSquare(14) << endl;  // 0
}`,
      rust: `fn is_perfect_square(num: u64) -> bool {
    let (mut lo, mut hi) = (1u64, num);
    // TODO: binary search
    let _ = (lo, hi);
    false
}

fn main() {
    println!("{}", is_perfect_square(16));  // true
    println!("{}", is_perfect_square(14));  // false
}`,
      csharp: `using System;

class Program {
    static bool IsPerfectSquare(int num) {
        long lo = 1, hi = num;
        // TODO: binary search
        return false;
    }

    static void Main() {
        Console.WriteLine(IsPerfectSquare(16));  // True
        Console.WriteLine(IsPerfectSquare(14));  // False
    }
}`,
    },
  },
];
