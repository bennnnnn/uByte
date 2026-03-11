import type { PracticeProblem } from "./types";

export const EASY_PROBLEMS_4: PracticeProblem[] = [
  {
    slug: "count-vowels",
    title: "Count Vowels",
    category: "string",
    difficulty: "easy",
    description:
      "Given a string `s`, return the number of vowels (`a`, `e`, `i`, `o`, `u`) in the string. The check should be case-insensitive.",
    examples: [
      { input: 's = "hello"', output: "2", explanation: "'e' and 'o' are vowels." },
      { input: 's = "programming"', output: "3" },
      { input: 's = "rhythm"', output: "0" },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"strings"
)

func countVowels(s string) int {
\t// TODO: count vowels in s (case-insensitive)
\t_ = strings.ToLower
\treturn 0
}

func main() {
\tfmt.Println(countVowels("hello"))       // 2
\tfmt.Println(countVowels("programming")) // 3
}`,
      python: `def count_vowels(s: str) -> int:
    # TODO: count vowels in s (case-insensitive)
    return 0

print(count_vowels("hello"))       # 2
print(count_vowels("programming")) # 3
`,
      javascript: `function countVowels(s) {
    // TODO: count vowels in s (case-insensitive)
    return 0;
}
console.log(countVowels("hello"));       // 2
console.log(countVowels("programming")); // 3`,
      java: `public class Main {
    public static int countVowels(String s) {
        // TODO: count vowels in s (case-insensitive)
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(countVowels("hello"));       // 2
        System.out.println(countVowels("programming")); // 3
    }
}`,
      rust: `fn count_vowels(s: &str) -> usize {
    // TODO: count vowels in s (case-insensitive)
    0
}
fn main() {
    println!("{}", count_vowels("hello"));       // 2
    println!("{}", count_vowels("programming")); // 3
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int countVowels(string s) {
    // TODO: count vowels in s (case-insensitive)
    return 0;
}
int main() {
    cout << countVowels("hello") << endl;       // 2
    cout << countVowels("programming") << endl; // 3
}`,
      csharp: `using System;
class Program {
    static int CountVowels(string s) {
        // TODO: count vowels in s (case-insensitive)
        return 0;
    }
    static void Main() {
        Console.WriteLine(CountVowels("hello"));       // 2
        Console.WriteLine(CountVowels("programming")); // 3
    }
}`,
    },
    testCases: [
      { stdin: "hello", expectedOutput: "2" },
      { stdin: "programming", expectedOutput: "3" },
      { stdin: "rhythm", expectedOutput: "0" },
      { stdin: "AEIOU", expectedOutput: "5" },
    ],
  },
  {
    slug: "sum-of-digits",
    title: "Sum of Digits",
    category: "math",
    difficulty: "easy",
    description:
      "Given a non-negative integer `n`, return the sum of its digits.\n\nFor example, `sum_of_digits(123)` returns `6` (1 + 2 + 3).",
    examples: [
      { input: "n = 123", output: "6" },
      { input: "n = 9999", output: "36" },
      { input: "n = 0", output: "0" },
    ],
    starter: {
      go: `package main

import "fmt"

func sumOfDigits(n int) int {
\t// TODO: return sum of all digits in n
\treturn 0
}

func main() {
\tfmt.Println(sumOfDigits(123))  // 6
\tfmt.Println(sumOfDigits(9999)) // 36
}`,
      python: `def sum_of_digits(n: int) -> int:
    # TODO: return sum of all digits in n
    return 0

print(sum_of_digits(123))  # 6
print(sum_of_digits(9999)) # 36
`,
      javascript: `function sumOfDigits(n) {
    // TODO: return sum of all digits in n
    return 0;
}
console.log(sumOfDigits(123));  // 6
console.log(sumOfDigits(9999)); // 36`,
      java: `public class Main {
    public static int sumOfDigits(int n) {
        // TODO: return sum of all digits in n
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(sumOfDigits(123));  // 6
        System.out.println(sumOfDigits(9999)); // 36
    }
}`,
      rust: `fn sum_of_digits(mut n: u64) -> u64 {
    // TODO: return sum of all digits in n
    0
}
fn main() {
    println!("{}", sum_of_digits(123));  // 6
    println!("{}", sum_of_digits(9999)); // 36
}`,
      cpp: `#include <iostream>
using namespace std;
int sumOfDigits(int n) {
    // TODO: return sum of all digits in n
    return 0;
}
int main() {
    cout << sumOfDigits(123)  << endl; // 6
    cout << sumOfDigits(9999) << endl; // 36
}`,
      csharp: `using System;
class Program {
    static int SumOfDigits(int n) {
        // TODO: return sum of all digits in n
        return 0;
    }
    static void Main() {
        Console.WriteLine(SumOfDigits(123));  // 6
        Console.WriteLine(SumOfDigits(9999)); // 36
    }
}`,
    },
    testCases: [
      { stdin: "123", expectedOutput: "6" },
      { stdin: "9999", expectedOutput: "36" },
      { stdin: "0", expectedOutput: "0" },
      { stdin: "1000", expectedOutput: "1" },
    ],
  },
  {
    slug: "check-armstrong-number",
    title: "Armstrong Number",
    category: "math",
    difficulty: "easy",
    description:
      "A number is an Armstrong number if the sum of its digits each raised to the power of the number of digits equals the number itself.\n\nFor example, `153` is Armstrong because `1³ + 5³ + 3³ = 153`.\n\nGiven an integer `n`, return `true` if it is an Armstrong number, `false` otherwise.",
    examples: [
      { input: "n = 153", output: "true", explanation: "1³ + 5³ + 3³ = 153." },
      { input: "n = 370", output: "true" },
      { input: "n = 123", output: "false" },
    ],
    starter: {
      go: `package main

import "fmt"

func isArmstrong(n int) bool {
\t// TODO: return true if n is an Armstrong number
\treturn false
}

func main() {
\tfmt.Println(isArmstrong(153)) // true
\tfmt.Println(isArmstrong(123)) // false
}`,
      python: `def is_armstrong(n: int) -> bool:
    # TODO: return True if n is an Armstrong number
    return False

print(is_armstrong(153)) # True
print(is_armstrong(123)) # False
`,
      javascript: `function isArmstrong(n) {
    // TODO: return true if n is an Armstrong number
    return false;
}
console.log(isArmstrong(153)); // true
console.log(isArmstrong(123)); // false`,
      java: `public class Main {
    public static boolean isArmstrong(int n) {
        // TODO: return true if n is an Armstrong number
        return false;
    }
    public static void main(String[] args) {
        System.out.println(isArmstrong(153)); // true
        System.out.println(isArmstrong(123)); // false
    }
}`,
      rust: `fn is_armstrong(n: u64) -> bool {
    // TODO: return true if n is an Armstrong number
    false
}
fn main() {
    println!("{}", is_armstrong(153)); // true
    println!("{}", is_armstrong(123)); // false
}`,
      cpp: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;
bool isArmstrong(int n) {
    // TODO: return true if n is an Armstrong number
    return false;
}
int main() {
    cout << boolalpha << isArmstrong(153) << endl; // true
    cout << boolalpha << isArmstrong(123) << endl; // false
}`,
      csharp: `using System;
class Program {
    static bool IsArmstrong(int n) {
        // TODO: return true if n is an Armstrong number
        return false;
    }
    static void Main() {
        Console.WriteLine(IsArmstrong(153)); // True
        Console.WriteLine(IsArmstrong(123)); // False
    }
}`,
    },
    testCases: [
      { stdin: "153", expectedOutput: "true" },
      { stdin: "370", expectedOutput: "true" },
      { stdin: "9474", expectedOutput: "true" },
      { stdin: "123", expectedOutput: "false" },
    ],
  },
  {
    slug: "find-second-largest",
    title: "Second Largest in Array",
    category: "array",
    difficulty: "easy",
    description:
      "Given an array of integers `nums`, return the second largest distinct value in the array.\n\nIf no second largest exists (e.g. all elements are the same, or the array has fewer than 2 elements), return `-1`.",
    examples: [
      { input: "nums = [3, 1, 4, 1, 5, 9, 2, 6]", output: "6" },
      { input: "nums = [1, 1, 1]", output: "-1" },
      { input: "nums = [10, 5]", output: "5" },
    ],
    starter: {
      go: `package main

import "fmt"

func secondLargest(nums []int) int {
\t// TODO: return the second largest distinct value, or -1
\treturn -1
}

func main() {
\tfmt.Println(secondLargest([]int{3, 1, 4, 1, 5, 9, 2, 6})) // 6
\tfmt.Println(secondLargest([]int{1, 1, 1}))                 // -1
}`,
      python: `def second_largest(nums: list[int]) -> int:
    # TODO: return the second largest distinct value, or -1
    return -1

print(second_largest([3, 1, 4, 1, 5, 9, 2, 6])) # 6
print(second_largest([1, 1, 1]))                 # -1
`,
      javascript: `function secondLargest(nums) {
    // TODO: return the second largest distinct value, or -1
    return -1;
}
console.log(secondLargest([3, 1, 4, 1, 5, 9, 2, 6])); // 6
console.log(secondLargest([1, 1, 1]));                 // -1`,
      java: `import java.util.*;
public class Main {
    public static int secondLargest(int[] nums) {
        // TODO: return the second largest distinct value, or -1
        return -1;
    }
    public static void main(String[] args) {
        System.out.println(secondLargest(new int[]{3,1,4,1,5,9,2,6})); // 6
        System.out.println(secondLargest(new int[]{1,1,1}));            // -1
    }
}`,
      rust: `fn second_largest(nums: &[i64]) -> i64 {
    // TODO: return the second largest distinct value, or -1
    -1
}
fn main() {
    println!("{}", second_largest(&[3,1,4,1,5,9,2,6])); // 6
    println!("{}", second_largest(&[1,1,1]));            // -1
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int secondLargest(vector<int>& nums) {
    // TODO: return the second largest distinct value, or -1
    return -1;
}
int main() {
    vector<int> a = {3,1,4,1,5,9,2,6};
    cout << secondLargest(a) << endl; // 6
}`,
      csharp: `using System;
using System.Collections.Generic;
class Program {
    static int SecondLargest(int[] nums) {
        // TODO: return the second largest distinct value, or -1
        return -1;
    }
    static void Main() {
        Console.WriteLine(SecondLargest(new int[]{3,1,4,1,5,9,2,6})); // 6
        Console.WriteLine(SecondLargest(new int[]{1,1,1}));            // -1
    }
}`,
    },
    testCases: [
      { stdin: "[3, 1, 4, 1, 5, 9, 2, 6]", expectedOutput: "6" },
      { stdin: "[1, 1, 1]", expectedOutput: "-1" },
      { stdin: "[10, 5]", expectedOutput: "5" },
      { stdin: "[42]", expectedOutput: "-1" },
    ],
  },
  {
    slug: "count-words",
    title: "Count Words in a String",
    category: "string",
    difficulty: "easy",
    description:
      "Given a string `s`, return the number of words in it. Words are separated by one or more spaces. Leading and trailing spaces should be ignored.\n\nReturn `0` for an empty string or a string containing only spaces.",
    examples: [
      { input: 's = "hello world"', output: "2" },
      { input: 's = "  the quick   brown fox  "', output: "4" },
      { input: 's = ""', output: "0" },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"strings"
)

func countWords(s string) int {
\t// TODO: count words separated by whitespace
\t_ = strings.Fields
\treturn 0
}

func main() {
\tfmt.Println(countWords("hello world"))             // 2
\tfmt.Println(countWords("  the quick   brown fox")) // 4
}`,
      python: `def count_words(s: str) -> int:
    # TODO: count words separated by whitespace
    return 0

print(count_words("hello world"))             # 2
print(count_words("  the quick   brown fox")) # 4
`,
      javascript: `function countWords(s) {
    // TODO: count words separated by whitespace
    return 0;
}
console.log(countWords("hello world"));             // 2
console.log(countWords("  the quick   brown fox")); // 4`,
      java: `public class Main {
    public static int countWords(String s) {
        // TODO: count words separated by whitespace
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(countWords("hello world"));             // 2
        System.out.println(countWords("  the quick   brown fox")); // 4
    }
}`,
      rust: `fn count_words(s: &str) -> usize {
    // TODO: count words separated by whitespace
    0
}
fn main() {
    println!("{}", count_words("hello world"));             // 2
    println!("{}", count_words("  the quick   brown fox")); // 4
}`,
      cpp: `#include <iostream>
#include <sstream>
#include <string>
using namespace std;
int countWords(string s) {
    // TODO: count words separated by whitespace
    return 0;
}
int main() {
    cout << countWords("hello world")             << endl; // 2
    cout << countWords("  the quick   brown fox") << endl; // 4
}`,
      csharp: `using System;
class Program {
    static int CountWords(string s) {
        // TODO: count words separated by whitespace
        return 0;
    }
    static void Main() {
        Console.WriteLine(CountWords("hello world"));             // 2
        Console.WriteLine(CountWords("  the quick   brown fox")); // 4
    }
}`,
    },
    testCases: [
      { stdin: "hello world", expectedOutput: "2" },
      { stdin: "  the quick   brown fox  ", expectedOutput: "4" },
      { stdin: "", expectedOutput: "0" },
      { stdin: "   ", expectedOutput: "0" },
    ],
  },
];
