import type { PracticeProblem } from "./types";

export const HARD_PROBLEMS_6: PracticeProblem[] = [
  {
    slug: "sliding-window-maximum",
    title: "Sliding Window Maximum",
    category: "sliding-window",
    difficulty: "hard",
    description:
      "You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position, return the max value in each window.\n\n**Approach:** Use a monotonic deque (decreasing from front to back) storing indices. O(n) time.",
    examples: [
      { input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]" },
      { input: "nums = [1], k = 1", output: "[1]" },
    ],
    starter: {
      python: `from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq = deque()  # stores indices, decreasing values
    result = []
    for i, num in enumerate(nums):
        # Remove indices outside the window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        # Maintain decreasing order
        while dq and nums[dq[-1]] < num:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result

if __name__ == "__main__":
    print(max_sliding_window([1,3,-1,-3,5,3,6,7], 3))  # [3,3,5,5,6,7]
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function maxSlidingWindow(nums, k) {
    const deque = [];  // stores indices
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        while (deque.length && deque[0] < i - k + 1) deque.shift();
        while (deque.length && nums[deque[deque.length-1]] < nums[i]) deque.pop();
        deque.push(i);
        if (i >= k - 1) result.push(nums[deque[0]]);
    }
    return result;
}

console.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3));  // [3,3,5,5,6,7]
`,
      go: `package main

import "fmt"

func maxSlidingWindow(nums []int, k int) []int {
\tdq := []int{}  // monotonic deque of indices
\tresult := []int{}
\tfor i, num := range nums {
\t\tfor len(dq) > 0 && dq[0] < i-k+1 { dq = dq[1:] }
\t\tfor len(dq) > 0 && nums[dq[len(dq)-1]] < num { dq = dq[:len(dq)-1] }
\t\tdq = append(dq, i)
\t\tif i >= k-1 { result = append(result, nums[dq[0]]) }
\t}
\treturn result
}

func main() {
\tfmt.Println(maxSlidingWindow([]int{1,3,-1,-3,5,3,6,7}, 3))  // [3 3 5 5 6 7]
}`,
      java: `import java.util.*;

public class Main {
    public static int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();
            dq.offerLast(i);
            if (i >= k - 1) result[i - k + 1] = nums[dq.peekFirst()];
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{1,3,-1,-3,5,3,6,7}, 3)));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <deque>
using namespace std;

vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> result;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!dq.empty() && dq.front() < i-k+1) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k-1) result.push_back(nums[dq.front()]);
    }
    return result;
}

int main() {
    vector<int> nums = {1,3,-1,-3,5,3,6,7};
    auto res = maxSlidingWindow(nums, 3);
    for (int v : res) cout << v << " ";
    cout << endl;
}`,
      rust: `use std::collections::VecDeque;

fn max_sliding_window(nums: Vec<i32>, k: usize) -> Vec<i32> {
    let mut dq: VecDeque<usize> = VecDeque::new();
    let mut result = vec![];
    for (i, &num) in nums.iter().enumerate() {
        while dq.front().map_or(false, |&f| f + k <= i) { dq.pop_front(); }
        while dq.back().map_or(false, |&b| nums[b] < num) { dq.pop_back(); }
        dq.push_back(i);
        if i + 1 >= k { result.push(nums[*dq.front().unwrap()]); }
    }
    result
}

fn main() {
    println!("{:?}", max_sliding_window(vec![1,3,-1,-3,5,3,6,7], 3));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static int[] MaxSlidingWindow(int[] nums, int k) {
        int n = nums.Length;
        int[] result = new int[n - k + 1];
        var dq = new LinkedList<int>();
        for (int i = 0; i < n; i++) {
            while (dq.Count > 0 && dq.First.Value < i - k + 1) dq.RemoveFirst();
            while (dq.Count > 0 && nums[dq.Last.Value] < nums[i]) dq.RemoveLast();
            dq.AddLast(i);
            if (i >= k - 1) result[i - k + 1] = nums[dq.First.Value];
        }
        return result;
    }

    static void Main() {
        Console.WriteLine(string.Join(", ", MaxSlidingWindow(new[]{1,3,-1,-3,5,3,6,7}, 3)));
    }
}`,
    },
  },

  {
    slug: "word-ladder",
    title: "Word Ladder",
    category: "graph",
    difficulty: "hard",
    description:
      "A **transformation sequence** from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence `beginWord → s₁ → s₂ → ... → sₖ → endWord` such that:\n- Every adjacent pair of words differs by exactly one letter.\n- Every word in the sequence is in `wordList`.\n\nGiven `beginWord`, `endWord`, and `wordList`, return the **number of words** in the shortest transformation sequence, or `0` if no such sequence exists.\n\n**Approach:** BFS — at each step, try all single-character mutations.",
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", explanation: '"hit" → "hot" → "dot" → "dog" → "cog" (5 words).' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: "0" },
    ],
    starter: {
      python: `from collections import deque

def ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    word_set = set(word_list)
    if end_word not in word_set:
        return 0
    queue = deque([(begin_word, 1)])
    visited = {begin_word}
    while queue:
        word, length = queue.popleft()
        for i in range(len(word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                next_word = word[:i] + c + word[i+1:]
                if next_word == end_word:
                    return length + 1
                if next_word in word_set and next_word not in visited:
                    visited.add(next_word)
                    queue.append((next_word, length + 1))
    return 0

if __name__ == "__main__":
    print(ladder_length("hit", "cog", ["hot","dot","dog","lot","log","cog"]))  # 5
    print(ladder_length("hit", "cog", ["hot","dot","dog","lot","log"]))         # 0
`,
      javascript: `/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
function ladderLength(beginWord, endWord, wordList) {
    const wordSet = new Set(wordList);
    if (!wordSet.has(endWord)) return 0;
    const queue = [[beginWord, 1]];
    const visited = new Set([beginWord]);
    while (queue.length) {
        const [word, length] = queue.shift();
        for (let i = 0; i < word.length; i++) {
            for (let c = 97; c <= 122; c++) {
                const next = word.slice(0,i) + String.fromCharCode(c) + word.slice(i+1);
                if (next === endWord) return length + 1;
                if (wordSet.has(next) && !visited.has(next)) {
                    visited.add(next); queue.push([next, length+1]);
                }
            }
        }
    }
    return 0;
}

console.log(ladderLength("hit","cog",["hot","dot","dog","lot","log","cog"]));  // 5
`,
      go: `package main

import "fmt"

func ladderLength(beginWord string, endWord string, wordList []string) int {
\twordSet := map[string]bool{}
\tfor _, w := range wordList { wordSet[w] = true }
\tif !wordSet[endWord] { return 0 }
\ttype item struct{ word string; dist int }
\tqueue := []item{{beginWord, 1}}
\tvisited := map[string]bool{beginWord: true}
\tfor len(queue) > 0 {
\t\tcur := queue[0]; queue = queue[1:]
\t\tword, dist := []byte(cur.word), cur.dist
\t\tfor i := range word {
\t\t\torig := word[i]
\t\t\tfor c := byte('a'); c <= 'z'; c++ {
\t\t\t\tword[i] = c
\t\t\t\tnext := string(word)
\t\t\t\tif next == endWord { return dist + 1 }
\t\t\t\tif wordSet[next] && !visited[next] { visited[next] = true; queue = append(queue, item{next, dist+1}) }
\t\t\t}
\t\t\tword[i] = orig
\t\t}
\t}
\treturn 0
}

func main() {
\tfmt.Println(ladderLength("hit","cog",[]string{"hot","dot","dog","lot","log","cog"}))  // 5
}`,
      java: `import java.util.*;

public class Main {
    public static int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> wordSet = new HashSet<>(wordList);
        if (!wordSet.contains(endWord)) return 0;
        Queue<String> queue = new LinkedList<>();
        queue.offer(beginWord); wordSet.remove(beginWord);
        int length = 1;
        while (!queue.isEmpty()) {
            int size = queue.size(); length++;
            for (int i = 0; i < size; i++) {
                char[] word = queue.poll().toCharArray();
                for (int j = 0; j < word.length; j++) {
                    char orig = word[j];
                    for (char c = 'a'; c <= 'z'; c++) {
                        word[j] = c;
                        String next = new String(word);
                        if (next.equals(endWord)) return length;
                        if (wordSet.contains(next)) { wordSet.remove(next); queue.offer(next); }
                    }
                    word[j] = orig;
                }
            }
        }
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(ladderLength("hit","cog", Arrays.asList("hot","dot","dog","lot","log","cog")));
    }
}`,
      cpp: `#include <iostream>
#include <queue>
#include <unordered_set>
#include <vector>
#include <string>
using namespace std;

int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
    unordered_set<string> wordSet(wordList.begin(), wordList.end());
    if (!wordSet.count(endWord)) return 0;
    queue<pair<string,int>> q;
    q.push({beginWord, 1}); wordSet.erase(beginWord);
    while (!q.empty()) {
        auto [word, dist] = q.front(); q.pop();
        for (int i = 0; i < (int)word.size(); i++) {
            char orig = word[i];
            for (char c = 'a'; c <= 'z'; c++) {
                word[i] = c;
                if (word == endWord) return dist + 1;
                if (wordSet.count(word)) { wordSet.erase(word); q.push({word, dist+1}); }
            }
            word[i] = orig;
        }
    }
    return 0;
}

int main() {
    vector<string> wl = {"hot","dot","dog","lot","log","cog"};
    cout << ladderLength("hit","cog",wl) << endl;  // 5
}`,
      rust: `use std::collections::{VecDeque, HashSet};

fn ladder_length(begin_word: &str, end_word: &str, word_list: Vec<&str>) -> usize {
    let mut word_set: HashSet<&str> = word_list.into_iter().collect();
    if !word_set.contains(end_word) { return 0; }
    let mut queue: VecDeque<(String, usize)> = VecDeque::new();
    queue.push_back((begin_word.to_string(), 1));
    word_set.remove(begin_word);
    while let Some((word, dist)) = queue.pop_front() {
        let bytes: Vec<u8> = word.bytes().collect();
        for i in 0..bytes.len() {
            for c in b'a'..=b'z' {
                let mut next = bytes.clone(); next[i] = c;
                let next_str = String::from_utf8(next).unwrap();
                if next_str == end_word { return dist + 1; }
                if word_set.contains(next_str.as_str()) {
                    word_set.remove(next_str.as_str());
                    queue.push_back((next_str, dist + 1));
                }
            }
        }
    }
    0
}

fn main() {
    println!("{}", ladder_length("hit","cog",vec!["hot","dot","dog","lot","log","cog"]));  // 5
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static int LadderLength(string beginWord, string endWord, IList<string> wordList) {
        var wordSet = new HashSet<string>(wordList);
        if (!wordSet.Contains(endWord)) return 0;
        var queue = new Queue<(string word, int dist)>();
        queue.Enqueue((beginWord, 1)); wordSet.Remove(beginWord);
        while (queue.Count > 0) {
            var (word, dist) = queue.Dequeue();
            var arr = word.ToCharArray();
            for (int i = 0; i < arr.Length; i++) {
                char orig = arr[i];
                for (char c = 'a'; c <= 'z'; c++) {
                    arr[i] = c;
                    string next = new string(arr);
                    if (next == endWord) return dist + 1;
                    if (wordSet.Contains(next)) { wordSet.Remove(next); queue.Enqueue((next, dist+1)); }
                }
                arr[i] = orig;
            }
        }
        return 0;
    }

    static void Main() {
        Console.WriteLine(LadderLength("hit","cog", new[]{"hot","dot","dog","lot","log","cog"}));  // 5
    }
}`,
    },
  },

  {
    slug: "wildcard-matching",
    title: "Wildcard Matching",
    category: "dynamic-programming",
    difficulty: "hard",
    description:
      "Given an input string `s` and a pattern `p`, implement wildcard pattern matching with support for `?` and `*`.\n\n- `?` Matches any single character.\n- `*` Matches any sequence of characters (including the empty sequence).\n\nThe matching should cover the entire input string (not partial).\n\n**DP state:** `dp[i][j]` = whether `s[0..i)` matches `p[0..j)`.",
    examples: [
      { input: 's = "aa", p = "a"', output: "false" },
      { input: 's = "aa", p = "*"', output: "true" },
      { input: 's = "cb", p = "?a"', output: "false" },
    ],
    starter: {
      python: `def is_match(s: str, p: str) -> bool:
    m, n = len(s), len(p)
    dp = [[False]*(n+1) for _ in range(m+1)]
    dp[0][0] = True
    for j in range(1, n+1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-1]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if p[j-1] == '*':
                dp[i][j] = dp[i-1][j] or dp[i][j-1]
            elif p[j-1] == '?' or p[j-1] == s[i-1]:
                dp[i][j] = dp[i-1][j-1]
    return dp[m][n]

if __name__ == "__main__":
    print(is_match("aa", "a"))   # False
    print(is_match("aa", "*"))   # True
    print(is_match("adceb", "*a*b"))  # True
`,
      javascript: `/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
function isMatch(s, p) {
    const m = s.length, n = p.length;
    const dp = Array.from({length:m+1},()=>new Array(n+1).fill(false));
    dp[0][0] = true;
    for (let j=1;j<=n;j++) if (p[j-1]==='*') dp[0][j]=dp[0][j-1];
    for (let i=1;i<=m;i++)
        for (let j=1;j<=n;j++) {
            if (p[j-1]==='*') dp[i][j]=dp[i-1][j]||dp[i][j-1];
            else if (p[j-1]==='?'||p[j-1]===s[i-1]) dp[i][j]=dp[i-1][j-1];
        }
    return dp[m][n];
}

console.log(isMatch("aa","a"));      // false
console.log(isMatch("aa","*"));      // true
console.log(isMatch("adceb","*a*b")); // true
`,
      go: `package main

import "fmt"

func isMatch(s string, p string) bool {
\tm, n := len(s), len(p)
\tdp := make([][]bool, m+1)
\tfor i := range dp { dp[i] = make([]bool, n+1) }
\tdp[0][0] = true
\tfor j := 1; j <= n; j++ { if p[j-1]=='*' { dp[0][j]=dp[0][j-1] } }
\tfor i := 1; i <= m; i++ {
\t\tfor j := 1; j <= n; j++ {
\t\t\tif p[j-1]=='*' { dp[i][j]=dp[i-1][j]||dp[i][j-1] } else if p[j-1]=='?'||p[j-1]==s[i-1] { dp[i][j]=dp[i-1][j-1] }
\t\t}
\t}
\treturn dp[m][n]
}

func main() {
\tfmt.Println(isMatch("aa","a"))       // false
\tfmt.Println(isMatch("aa","*"))       // true
\tfmt.Println(isMatch("adceb","*a*b")) // true
}`,
      java: `public class Main {
    public static boolean isMatch(String s, String p) {
        int m=s.length(), n=p.length();
        boolean[][] dp=new boolean[m+1][n+1];
        dp[0][0]=true;
        for(int j=1;j<=n;j++) if(p.charAt(j-1)=='*') dp[0][j]=dp[0][j-1];
        for(int i=1;i<=m;i++) for(int j=1;j<=n;j++) {
            if(p.charAt(j-1)=='*') dp[i][j]=dp[i-1][j]||dp[i][j-1];
            else if(p.charAt(j-1)=='?'||p.charAt(j-1)==s.charAt(i-1)) dp[i][j]=dp[i-1][j-1];
        }
        return dp[m][n];
    }
    public static void main(String[] args) {
        System.out.println(isMatch("aa","a"));      // false
        System.out.println(isMatch("aa","*"));      // true
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
bool isMatch(string s, string p) {
    int m=s.size(), n=p.size();
    vector<vector<bool>> dp(m+1, vector<bool>(n+1, false));
    dp[0][0]=true;
    for(int j=1;j<=n;j++) if(p[j-1]=='*') dp[0][j]=dp[0][j-1];
    for(int i=1;i<=m;i++) for(int j=1;j<=n;j++) {
        if(p[j-1]=='*') dp[i][j]=dp[i-1][j]||dp[i][j-1];
        else if(p[j-1]=='?'||p[j-1]==s[i-1]) dp[i][j]=dp[i-1][j-1];
    }
    return dp[m][n];
}
int main(){ cout<<isMatch("aa","a")<<" "<<isMatch("aa","*")<<endl; }`,
      rust: `fn is_match(s: &str, p: &str) -> bool {
    let (s,p): (Vec<u8>,Vec<u8>)=(s.bytes().collect(),p.bytes().collect());
    let (m,n)=(s.len(),p.len());
    let mut dp=vec![vec![false;n+1];m+1];
    dp[0][0]=true;
    for j in 1..=n { if p[j-1]==b'*' { dp[0][j]=dp[0][j-1]; } }
    for i in 1..=m { for j in 1..=n {
        if p[j-1]==b'*' { dp[i][j]=dp[i-1][j]||dp[i][j-1]; }
        else if p[j-1]==b'?'||p[j-1]==s[i-1] { dp[i][j]=dp[i-1][j-1]; }
    } }
    dp[m][n]
}
fn main(){ println!("{} {}",is_match("aa","a"),is_match("aa","*")); }`,
      csharp: `using System;
class Program {
    static bool IsMatch(string s, string p) {
        int m=s.Length,n=p.Length;
        bool[,] dp=new bool[m+1,n+1]; dp[0,0]=true;
        for(int j=1;j<=n;j++) if(p[j-1]=='*') dp[0,j]=dp[0,j-1];
        for(int i=1;i<=m;i++) for(int j=1;j<=n;j++) {
            if(p[j-1]=='*') dp[i,j]=dp[i-1,j]||dp[i,j-1];
            else if(p[j-1]=='?'||p[j-1]==s[i-1]) dp[i,j]=dp[i-1,j-1];
        }
        return dp[m,n];
    }
    static void Main(){ Console.WriteLine(IsMatch("aa","a")); Console.WriteLine(IsMatch("aa","*")); }
}`,
    },
  },

  {
    slug: "find-median-data-stream",
    title: "Find Median from Data Stream",
    category: "heap",
    difficulty: "hard",
    description:
      "The **median** is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.\n\nImplement the `MedianFinder` class:\n- `MedianFinder()` initializes the object.\n- `void addNum(int num)` adds the integer `num` from the data stream to the data structure.\n- `double findMedian()` returns the median of all elements so far.\n\n**Approach:** Use two heaps — a max-heap for the lower half and a min-heap for the upper half. Balance them so their sizes differ by at most 1.",
    examples: [
      { input: 'MedianFinder mf; mf.addNum(1); mf.addNum(2); mf.findMedian(); mf.addNum(3); mf.findMedian();', output: "1.5, 2.0" },
    ],
    starter: {
      python: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []   # max-heap (negate values)
        self.large = []   # min-heap

    def add_num(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        # Balance: all elements in small <= all in large
        if self.small and self.large and (-self.small[0]) > self.large[0]:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        # Keep sizes balanced (small can have at most 1 extra)
        if len(self.small) > len(self.large) + 1:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        elif len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def find_median(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2.0

if __name__ == "__main__":
    mf = MedianFinder()
    mf.add_num(1); mf.add_num(2)
    print(mf.find_median())  # 1.5
    mf.add_num(3)
    print(mf.find_median())  # 2.0
`,
      javascript: `class MedianFinder {
    constructor() {
        // JavaScript doesn't have a built-in heap — use sorted insertion for simplicity
        this.data = [];
    }

    addNum(num) {
        // Binary search insertion to keep data sorted
        let lo = 0, hi = this.data.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (this.data[mid] < num) lo = mid + 1; else hi = mid;
        }
        this.data.splice(lo, 0, num);
    }

    findMedian() {
        const n = this.data.length;
        return n % 2 === 1 ? this.data[n >> 1] : (this.data[(n-1)>>1] + this.data[n>>1]) / 2;
    }
}

const mf = new MedianFinder();
mf.addNum(1); mf.addNum(2);
console.log(mf.findMedian());  // 1.5
mf.addNum(3);
console.log(mf.findMedian());  // 2.0
`,
      go: `package main

import (
\t"container/heap"
\t"fmt"
)

type MaxHeap []int
func (h MaxHeap) Len() int           { return len(h) }
func (h MaxHeap) Less(i, j int) bool { return h[i] > h[j] }
func (h MaxHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MaxHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *MaxHeap) Pop() any          { old:=*h; x:=old[len(old)-1]; *h=old[:len(old)-1]; return x }

type MinHeap []int
func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() any          { old:=*h; x:=old[len(old)-1]; *h=old[:len(old)-1]; return x }

type MedianFinder struct{ small *MaxHeap; large *MinHeap }

func newMedianFinder() *MedianFinder { s:=&MaxHeap{}; l:=&MinHeap{}; heap.Init(s); heap.Init(l); return &MedianFinder{s,l} }

func (mf *MedianFinder) addNum(num int) {
\theap.Push(mf.small, num)
\tif mf.small.Len()>0 && mf.large.Len()>0 && (*mf.small)[0] > (*mf.large)[0] {
\t\theap.Push(mf.large, heap.Pop(mf.small))
\t}
\tif mf.small.Len() > mf.large.Len()+1 { heap.Push(mf.large, heap.Pop(mf.small)) } else if mf.large.Len() > mf.small.Len() { heap.Push(mf.small, heap.Pop(mf.large)) }
}

func (mf *MedianFinder) findMedian() float64 {
\tif mf.small.Len() > mf.large.Len() { return float64((*mf.small)[0]) }
\treturn float64((*mf.small)[0]+(*mf.large)[0]) / 2.0
}

func main() {
\tmf := newMedianFinder(); mf.addNum(1); mf.addNum(2)
\tfmt.Println(mf.findMedian())  // 1.5
\tmf.addNum(3); fmt.Println(mf.findMedian())  // 2
}`,
      java: `import java.util.*;

public class Main {
    static class MedianFinder {
        PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());
        PriorityQueue<Integer> large = new PriorityQueue<>();

        public void addNum(int num) {
            small.offer(num);
            if (!small.isEmpty() && !large.isEmpty() && small.peek() > large.peek())
                large.offer(small.poll());
            if (small.size() > large.size() + 1) large.offer(small.poll());
            else if (large.size() > small.size()) small.offer(large.poll());
        }

        public double findMedian() {
            if (small.size() > large.size()) return small.peek();
            return (small.peek() + large.peek()) / 2.0;
        }
    }

    public static void main(String[] args) {
        MedianFinder mf = new MedianFinder();
        mf.addNum(1); mf.addNum(2);
        System.out.println(mf.findMedian());  // 1.5
        mf.addNum(3); System.out.println(mf.findMedian());  // 2.0
    }
}`,
      cpp: `#include <iostream>
#include <queue>
using namespace std;

class MedianFinder {
    priority_queue<int> small;                             // max-heap
    priority_queue<int, vector<int>, greater<int>> large;  // min-heap
public:
    void addNum(int num) {
        small.push(num);
        if (!small.empty() && !large.empty() && small.top() > large.top())
            { large.push(small.top()); small.pop(); }
        if ((int)small.size() > (int)large.size()+1) { large.push(small.top()); small.pop(); }
        else if ((int)large.size() > (int)small.size()) { small.push(large.top()); large.pop(); }
    }
    double findMedian() {
        if (small.size() > large.size()) return small.top();
        return (small.top() + large.top()) / 2.0;
    }
};

int main() {
    MedianFinder mf; mf.addNum(1); mf.addNum(2);
    cout << mf.findMedian() << endl;  // 1.5
    mf.addNum(3); cout << mf.findMedian() << endl;  // 2
}`,
      rust: `use std::collections::BinaryHeap;
use std::cmp::Reverse;

struct MedianFinder {
    small: BinaryHeap<i32>,           // max-heap (lower half)
    large: BinaryHeap<Reverse<i32>>,  // min-heap (upper half)
}

impl MedianFinder {
    fn new() -> Self { MedianFinder { small: BinaryHeap::new(), large: BinaryHeap::new() } }

    fn add_num(&mut self, num: i32) {
        self.small.push(num);
        if let (Some(&s), Some(&Reverse(l))) = (self.small.peek(), self.large.peek()) {
            if s > l { self.large.push(Reverse(self.small.pop().unwrap())); }
        }
        if self.small.len() > self.large.len() + 1 {
            self.large.push(Reverse(self.small.pop().unwrap()));
        } else if self.large.len() > self.small.len() {
            self.small.push(self.large.pop().unwrap().0);
        }
    }

    fn find_median(&self) -> f64 {
        if self.small.len() > self.large.len() { return *self.small.peek().unwrap() as f64; }
        (*self.small.peek().unwrap() as f64 + self.large.peek().unwrap().0 as f64) / 2.0
    }
}

fn main() {
    let mut mf = MedianFinder::new();
    mf.add_num(1); mf.add_num(2); println!("{}", mf.find_median());  // 1.5
    mf.add_num(3); println!("{}", mf.find_median());                   // 2
}`,
      csharp: `using System;
using System.Collections.Generic;

class MedianFinder {
    // C# doesn't have a built-in max-heap; use SortedList for simplicity
    List<int> data = new();

    public void AddNum(int num) {
        int lo = 0, hi = data.Count;
        while (lo < hi) { int mid=(lo+hi)/2; if(data[mid]<num)lo=mid+1; else hi=mid; }
        data.Insert(lo, num);
    }

    public double FindMedian() {
        int n = data.Count;
        return n%2==1 ? data[n/2] : (data[(n-1)/2]+data[n/2])/2.0;
    }
}

class Program {
    static void Main() {
        var mf = new MedianFinder();
        mf.AddNum(1); mf.AddNum(2);
        Console.WriteLine(mf.FindMedian());  // 1.5
        mf.AddNum(3); Console.WriteLine(mf.FindMedian());  // 2
    }
}`,
    },
  },

  {
    slug: "minimum-window-substr-hard",
    title: "Minimum Window Substring (Hard Variant)",
    category: "sliding-window",
    difficulty: "hard",
    description:
      "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the **minimum window substring** of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string.\n\nThe test cases will be generated such that the answer is **unique**.\n\n**Approach:** Sliding window with two frequency maps. Expand right pointer; when all chars covered, shrink from left.\n\n**(This is a harder variant — the input strings are longer and require an optimised approach.)**",
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""' },
    ],
    starter: {
      python: `from collections import Counter

def min_window(s: str, t: str) -> str:
    if not t or not s: return ""
    need = Counter(t)
    have, required = 0, len(need)
    left = 0
    min_len = float('inf')
    result = ""
    window = {}
    for right, ch in enumerate(s):
        window[ch] = window.get(ch, 0) + 1
        if ch in need and window[ch] == need[ch]:
            have += 1
        while have == required:
            # Update result
            if right - left + 1 < min_len:
                min_len = right - left + 1
                result = s[left:right+1]
            # Shrink from left
            left_ch = s[left]
            window[left_ch] -= 1
            if left_ch in need and window[left_ch] < need[left_ch]:
                have -= 1
            left += 1
    return result

if __name__ == "__main__":
    print(min_window("ADOBECODEBANC", "ABC"))  # BANC
    print(min_window("a", "a"))                 # a
    print(min_window("a", "aa"))                # ""
`,
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
    const need = {};
    for (const c of t) need[c] = (need[c]||0)+1;
    let have=0, required=Object.keys(need).length;
    let left=0, minLen=Infinity, result='';
    const window = {};
    for (let right=0;right<s.length;right++) {
        const c=s[right]; window[c]=(window[c]||0)+1;
        if (need[c]&&window[c]===need[c]) have++;
        while (have===required) {
            if (right-left+1<minLen) { minLen=right-left+1; result=s.slice(left,right+1); }
            const lc=s[left]; window[lc]--;
            if (need[lc]&&window[lc]<need[lc]) have--;
            left++;
        }
    }
    return result;
}

console.log(minWindow("ADOBECODEBANC","ABC"));  // BANC
`,
      go: `package main

import "fmt"

func minWindow(s string, t string) string {
\tneed := map[byte]int{}
\tfor i := 0; i < len(t); i++ { need[t[i]]++ }
\thave, required := 0, len(need)
\tleft, minLen := 0, len(s)+1
\tresult := ""
\twindow := map[byte]int{}
\tfor right := 0; right < len(s); right++ {
\t\tc := s[right]; window[c]++
\t\tif n, ok := need[c]; ok && window[c] == n { have++ }
\t\tfor have == required {
\t\t\tif right-left+1 < minLen { minLen=right-left+1; result=s[left:right+1] }
\t\t\tlc := s[left]; window[lc]--
\t\t\tif n, ok := need[lc]; ok && window[lc] < n { have-- }
\t\t\tleft++
\t\t}
\t}
\treturn result
}

func main() { fmt.Println(minWindow("ADOBECODEBANC","ABC")) }`,
      java: `import java.util.*;

public class Main {
    public static String minWindow(String s, String t) {
        Map<Character,Integer> need=new HashMap<>(), window=new HashMap<>();
        for(char c:t.toCharArray()) need.merge(c,1,Integer::sum);
        int have=0, required=need.size(), left=0, minLen=Integer.MAX_VALUE;
        String result="";
        for(int right=0;right<s.length();right++){
            char c=s.charAt(right); window.merge(c,1,Integer::sum);
            if(need.containsKey(c)&&window.get(c).equals(need.get(c))) have++;
            while(have==required){
                if(right-left+1<minLen){minLen=right-left+1;result=s.substring(left,right+1);}
                char lc=s.charAt(left); window.merge(lc,-1,Integer::sum);
                if(need.containsKey(lc)&&window.get(lc)<need.get(lc)) have--;
                left++;
            }
        }
        return result;
    }
    public static void main(String[] args){ System.out.println(minWindow("ADOBECODEBANC","ABC")); }
}`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <string>
#include <climits>
using namespace std;
string minWindow(string s, string t) {
    unordered_map<char,int> need, window;
    for(char c:t) need[c]++;
    int have=0,required=need.size(),left=0,minLen=INT_MAX;
    string result="";
    for(int right=0;right<(int)s.size();right++){
        char c=s[right]; window[c]++;
        if(need.count(c)&&window[c]==need[c]) have++;
        while(have==(int)required){
            if(right-left+1<minLen){minLen=right-left+1;result=s.substr(left,minLen);}
            char lc=s[left]; window[lc]--;
            if(need.count(lc)&&window[lc]<need[lc]) have--;
            left++;
        }
    }
    return result;
}
int main(){ cout<<minWindow("ADOBECODEBANC","ABC")<<endl; }`,
      rust: `use std::collections::HashMap;

fn min_window(s: &str, t: &str) -> String {
    let s: Vec<u8> = s.bytes().collect();
    let mut need: HashMap<u8,i32> = HashMap::new();
    for &c in t.as_bytes() { *need.entry(c).or_insert(0) += 1; }
    let (required, mut have) = (need.len(), 0);
    let mut window: HashMap<u8,i32> = HashMap::new();
    let (mut left, mut min_len, mut result) = (0, usize::MAX, (0,0));
    for right in 0..s.len() {
        let c = s[right]; *window.entry(c).or_insert(0) += 1;
        if need.get(&c).map_or(false, |&n| window[&c] == n) { have += 1; }
        while have == required {
            if right - left + 1 < min_len { min_len=right-left+1; result=(left,right+1); }
            let lc = s[left]; *window.entry(lc).or_insert(0) -= 1;
            if need.get(&lc).map_or(false, |&n| window[&lc] < n) { have -= 1; }
            left += 1;
        }
    }
    String::from_utf8(s[result.0..result.1].to_vec()).unwrap_or_default()
}

fn main() { println!("{}", min_window("ADOBECODEBANC","ABC")); }`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static string MinWindow(string s, string t) {
        var need=new Dictionary<char,int>();
        foreach(char c in t) { need[c]=need.GetValueOrDefault(c,0)+1; }
        int have=0,required=need.Count,left=0,minLen=int.MaxValue;
        string result="";
        var window=new Dictionary<char,int>();
        for(int r=0;r<s.Length;r++){
            char c=s[r]; window[c]=window.GetValueOrDefault(c,0)+1;
            if(need.ContainsKey(c)&&window[c]==need[c]) have++;
            while(have==required){
                if(r-left+1<minLen){minLen=r-left+1;result=s.Substring(left,minLen);}
                char lc=s[left]; window[lc]--;
                if(need.ContainsKey(lc)&&window[lc]<need[lc]) have--;
                left++;
            }
        }
        return result;
    }
    static void Main(){ Console.WriteLine(MinWindow("ADOBECODEBANC","ABC")); }
}`,
    },
  },

  {
    slug: "palindrome-partitioning-ii",
    title: "Palindrome Partitioning II",
    category: "dynamic-programming",
    difficulty: "hard",
    description:
      "Given a string `s`, partition `s` such that every substring of the partition is a palindrome.\n\nReturn the **minimum cuts** needed for a palindrome partitioning of `s`.\n\n**Approach:** Two-pass DP:\n1. `isPalin[i][j]` = whether `s[i..j]` is a palindrome.\n2. `dp[i]` = min cuts for `s[0..i]`.",
    examples: [
      { input: 's = "aab"', output: "1", explanation: "The palindrome partitioning [\"aa\",\"b\"] could be produced using 1 cut." },
      { input: 's = "a"', output: "0" },
      { input: 's = "ab"', output: "1" },
    ],
    starter: {
      python: `def min_cut(s: str) -> int:
    n = len(s)
    # Precompute palindrome table
    is_palin = [[False]*n for _ in range(n)]
    for i in range(n-1, -1, -1):
        for j in range(i, n):
            is_palin[i][j] = (s[i]==s[j]) and (j-i<=2 or is_palin[i+1][j-1])
    # dp[i] = min cuts for s[0..i]
    dp = [i for i in range(n)]  # max cuts = i (cut every char)
    for i in range(1, n):
        if is_palin[0][i]:
            dp[i] = 0
            continue
        for j in range(1, i+1):
            if is_palin[j][i]:
                dp[i] = min(dp[i], dp[j-1]+1)
    return dp[n-1]

if __name__ == "__main__":
    print(min_cut("aab"))  # 1
    print(min_cut("a"))    # 0
    print(min_cut("aba"))  # 0
`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function minCut(s) {
    const n = s.length;
    const isPalin = Array.from({length:n},()=>new Array(n).fill(false));
    for (let i=n-1;i>=0;i--)
        for (let j=i;j<n;j++)
            isPalin[i][j] = s[i]===s[j] && (j-i<=2 || isPalin[i+1][j-1]);
    const dp = Array.from({length:n},(_,i)=>i);
    for (let i=1;i<n;i++) {
        if (isPalin[0][i]) { dp[i]=0; continue; }
        for (let j=1;j<=i;j++) if (isPalin[j][i]) dp[i]=Math.min(dp[i],dp[j-1]+1);
    }
    return dp[n-1];
}

console.log(minCut("aab"));  // 1
console.log(minCut("a"));    // 0
`,
      go: `package main

import "fmt"

func minCut(s string) int {
\tn := len(s)
\tisPalin := make([][]bool, n)
\tfor i := range isPalin { isPalin[i] = make([]bool, n) }
\tfor i := n-1; i >= 0; i-- { for j := i; j < n; j++ { isPalin[i][j] = s[i]==s[j] && (j-i<=2 || isPalin[i+1][j-1]) } }
\tdp := make([]int, n)
\tfor i := range dp { dp[i] = i }
\tfor i := 1; i < n; i++ {
\t\tif isPalin[0][i] { dp[i]=0; continue }
\t\tfor j := 1; j <= i; j++ { if isPalin[j][i] && dp[j-1]+1 < dp[i] { dp[i]=dp[j-1]+1 } }
\t}
\treturn dp[n-1]
}

func main() { fmt.Println(minCut("aab")) }`,
      java: `public class Main {
    public static int minCut(String s) {
        int n=s.length();
        boolean[][] isPalin=new boolean[n][n];
        for(int i=n-1;i>=0;i--) for(int j=i;j<n;j++) isPalin[i][j]=s.charAt(i)==s.charAt(j)&&(j-i<=2||isPalin[i+1][j-1]);
        int[] dp=new int[n]; for(int i=0;i<n;i++) dp[i]=i;
        for(int i=1;i<n;i++){if(isPalin[0][i]){dp[i]=0;continue;}for(int j=1;j<=i;j++) if(isPalin[j][i]) dp[i]=Math.min(dp[i],dp[j-1]+1);}
        return dp[n-1];
    }
    public static void main(String[] args){ System.out.println(minCut("aab")); }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;
int minCut(string s){
    int n=s.size();
    vector<vector<bool>> isPalin(n,vector<bool>(n,false));
    for(int i=n-1;i>=0;i--) for(int j=i;j<n;j++) isPalin[i][j]=s[i]==s[j]&&(j-i<=2||isPalin[i+1][j-1]);
    vector<int> dp(n); for(int i=0;i<n;i++) dp[i]=i;
    for(int i=1;i<n;i++){if(isPalin[0][i]){dp[i]=0;continue;}for(int j=1;j<=i;j++) if(isPalin[j][i]) dp[i]=min(dp[i],dp[j-1]+1);}
    return dp[n-1];
}
int main(){ cout<<minCut("aab")<<endl; }`,
      rust: `fn min_cut(s: &str) -> usize {
    let s: Vec<u8> = s.bytes().collect();
    let n = s.len();
    let mut is_palin = vec![vec![false; n]; n];
    for i in (0..n).rev() { for j in i..n { is_palin[i][j] = s[i]==s[j] && (j-i<=2 || (i+1<n && j>0 && is_palin[i+1][j-1])); } }
    let mut dp: Vec<usize> = (0..n).collect();
    for i in 1..n {
        if is_palin[0][i] { dp[i]=0; continue; }
        for j in 1..=i { if is_palin[j][i] && dp[j-1]+1 < dp[i] { dp[i]=dp[j-1]+1; } }
    }
    dp[n-1]
}
fn main(){ println!("{}",min_cut("aab")); }`,
      csharp: `using System;
class Program {
    static int MinCut(string s){
        int n=s.Length;
        bool[,] isPalin=new bool[n,n];
        for(int i=n-1;i>=0;i--) for(int j=i;j<n;j++) isPalin[i,j]=s[i]==s[j]&&(j-i<=2||(i+1<n&&j>0&&isPalin[i+1,j-1]));
        int[] dp=new int[n]; for(int i=0;i<n;i++) dp[i]=i;
        for(int i=1;i<n;i++){if(isPalin[0,i]){dp[i]=0;continue;}for(int j=1;j<=i;j++) if(isPalin[j,i]) dp[i]=Math.Min(dp[i],dp[j-1]+1);}
        return dp[n-1];
    }
    static void Main(){ Console.WriteLine(MinCut("aab")); }
}`,
    },
  },

  {
    slug: "jump-game-iii",
    title: "Jump Game III",
    category: "graph",
    difficulty: "hard",
    description:
      "Given an array of non-negative integers `arr`, you are initially positioned at `start` index of the array. When you are at index `i`, you can jump to `i + arr[i]` or `i - arr[i]`, check if you can reach any index with value 0.\n\nNotice that you can not jump outside of the array at any time.\n\n**Approach:** BFS or DFS from `start`, tracking visited indices.",
    examples: [
      { input: "arr = [4,2,3,0,3,1,2], start = 5", output: "true", explanation: "All paths from start reach an index with value 0." },
      { input: "arr = [4,2,3,0,3,1,2], start = 0", output: "true" },
      { input: "arr = [3,0,2,1,2], start = 2", output: "false" },
    ],
    starter: {
      python: `from collections import deque

def can_reach(arr: list[int], start: int) -> bool:
    n = len(arr)
    visited = set()
    queue = deque([start])
    while queue:
        i = queue.popleft()
        if arr[i] == 0:
            return True
        if i in visited:
            continue
        visited.add(i)
        for ni in [i + arr[i], i - arr[i]]:
            if 0 <= ni < n and ni not in visited:
                queue.append(ni)
    return False

if __name__ == "__main__":
    print(can_reach([4,2,3,0,3,1,2], 5))  # True
    print(can_reach([3,0,2,1,2], 2))        # False
`,
      javascript: `/**
 * @param {number[]} arr
 * @param {number} start
 * @return {boolean}
 */
function canReach(arr, start) {
    const n = arr.length;
    const visited = new Set();
    const queue = [start];
    while (queue.length) {
        const i = queue.shift();
        if (arr[i] === 0) return true;
        if (visited.has(i)) continue;
        visited.add(i);
        for (const ni of [i + arr[i], i - arr[i]])
            if (ni >= 0 && ni < n && !visited.has(ni)) queue.push(ni);
    }
    return false;
}

console.log(canReach([4,2,3,0,3,1,2], 5));  // true
console.log(canReach([3,0,2,1,2], 2));        // false
`,
      go: `package main

import "fmt"

func canReach(arr []int, start int) bool {
\tn := len(arr)
\tvisited := map[int]bool{}
\tqueue := []int{start}
\tfor len(queue) > 0 {
\t\ti := queue[0]; queue = queue[1:]
\t\tif arr[i] == 0 { return true }
\t\tif visited[i] { continue }
\t\tvisited[i] = true
\t\tfor _, ni := range []int{i+arr[i], i-arr[i]} {
\t\t\tif ni >= 0 && ni < n && !visited[ni] { queue = append(queue, ni) }
\t\t}
\t}
\treturn false
}

func main() {
\tfmt.Println(canReach([]int{4,2,3,0,3,1,2}, 5))  // true
\tfmt.Println(canReach([]int{3,0,2,1,2}, 2))        // false
}`,
      java: `import java.util.*;

public class Main {
    public static boolean canReach(int[] arr, int start) {
        int n=arr.length; Set<Integer> visited=new HashSet<>(); Queue<Integer> queue=new LinkedList<>();
        queue.offer(start);
        while(!queue.isEmpty()){
            int i=queue.poll(); if(arr[i]==0) return true; if(visited.contains(i)) continue; visited.add(i);
            int[] nxt={i+arr[i],i-arr[i]};
            for(int ni:nxt) if(ni>=0&&ni<n&&!visited.contains(ni)) queue.offer(ni);
        }
        return false;
    }
    public static void main(String[] args){System.out.println(canReach(new int[]{4,2,3,0,3,1,2},5));}
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <unordered_set>
using namespace std;
bool canReach(vector<int>& arr, int start){
    int n=arr.size(); unordered_set<int> vis; queue<int> q; q.push(start);
    while(!q.empty()){int i=q.front();q.pop();if(arr[i]==0)return true;if(vis.count(i))continue;vis.insert(i);for(int ni:{i+arr[i],i-arr[i]})if(ni>=0&&ni<n&&!vis.count(ni))q.push(ni);}
    return false;
}
int main(){vector<int>arr={4,2,3,0,3,1,2};cout<<canReach(arr,5)<<endl;}`,
      rust: `use std::collections::{HashSet,VecDeque};
fn can_reach(arr: &[usize], start: usize) -> bool {
    let n=arr.len(); let mut vis=HashSet::new(); let mut q=VecDeque::from([start]);
    while let Some(i)=q.pop_front(){
        if arr[i]==0{return true;} if vis.contains(&i){continue;} vis.insert(i);
        let candidates=[i.wrapping_add(arr[i]),i.wrapping_sub(arr[i])];
        for &ni in &candidates{if ni<n&&!vis.contains(&ni){q.push_back(ni);}}
    }
    false
}
fn main(){println!("{}",can_reach(&[4,2,3,0,3,1,2],5));}`,
      csharp: `using System; using System.Collections.Generic;
class Program {
    static bool CanReach(int[] arr, int start){
        int n=arr.Length; var vis=new HashSet<int>(); var q=new Queue<int>(); q.Enqueue(start);
        while(q.Count>0){int i=q.Dequeue();if(arr[i]==0)return true;if(vis.Contains(i))continue;vis.Add(i);foreach(int ni in new[]{i+arr[i],i-arr[i]})if(ni>=0&&ni<n&&!vis.Contains(ni))q.Enqueue(ni);}
        return false;
    }
    static void Main(){Console.WriteLine(CanReach(new[]{4,2,3,0,3,1,2},5));}
}`,
    },
  },
];
