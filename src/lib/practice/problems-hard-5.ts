import type { PracticeProblem } from "./types";

export const HARD_PROBLEMS_5: PracticeProblem[] = [
  {
    slug: "serialize-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    category: "tree",
    difficulty: "hard",
    description:
      "Design an algorithm to serialize and deserialize a binary tree.\n\nSerialization is the process of converting a tree to a string; deserialization is the reverse.\n\nImplement two functions:\n- `serialize(root)` — returns a string representation of the tree\n- `deserialize(data)` — reconstructs the tree from that string\n\nThere is no restriction on how your serialization/deserialization algorithm should work. Just ensure that a binary tree can be serialized to a string and this string can be deserialized back to the original tree structure.",
    examples: [
      {
        input: "root = [1,2,3,null,null,4,5]",
        output: "[1,2,3,null,null,4,5]",
        explanation: "serialize then deserialize should return the original tree.",
      },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"strconv"
\t"strings"
)

type TreeNode struct {
\tVal   int
\tLeft  *TreeNode
\tRight *TreeNode
}

func serialize(root *TreeNode) string {
\t// TODO: convert tree to a string
\t_ = strconv.Itoa
\t_ = strings.Builder{}
\treturn ""
}

func deserialize(data string) *TreeNode {
\t// TODO: reconstruct the tree from the string
\t_ = strings.Split
\treturn nil
}

func main() {
\troot := &TreeNode{1,
\t\t&TreeNode{Val: 2},
\t\t&TreeNode{3, &TreeNode{Val: 4}, &TreeNode{Val: 5}},
\t}
\tdata := serialize(root)
\tfmt.Println("serialized:", data)
\trestored := deserialize(data)
\tfmt.Println("root val:", restored.Val) // 1
}`,
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def serialize(root: TreeNode) -> str:
    # TODO: convert tree to a string
    return ""

def deserialize(data: str) -> TreeNode:
    # TODO: reconstruct the tree from the string
    return None

root = TreeNode(1, TreeNode(2), TreeNode(3, TreeNode(4), TreeNode(5)))
data = serialize(root)
print("serialized:", data)
restored = deserialize(data)
print("root val:", restored.val) # 1
`,
      javascript: `class TreeNode {
    constructor(val, left = null, right = null) {
        this.val = val; this.left = left; this.right = right;
    }
}
function serialize(root) {
    // TODO: convert tree to a string
    return "";
}
function deserialize(data) {
    // TODO: reconstruct the tree from the string
    return null;
}
const root = new TreeNode(1, new TreeNode(2), new TreeNode(3, new TreeNode(4), new TreeNode(5)));
const data = serialize(root);
console.log("serialized:", data);
const restored = deserialize(data);
console.log("root val:", restored.val); // 1`,
      java: `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
        TreeNode(int v, TreeNode l, TreeNode r) { val=v; left=l; right=r; }
    }
    public static String serialize(TreeNode root) {
        // TODO: convert tree to a string
        return "";
    }
    public static TreeNode deserialize(String data) {
        // TODO: reconstruct the tree from the string
        return null;
    }
    public static void main(String[] args) {
        TreeNode root = new TreeNode(1, new TreeNode(2),
            new TreeNode(3, new TreeNode(4), new TreeNode(5)));
        String data = serialize(root);
        System.out.println("serialized: " + data);
        TreeNode restored = deserialize(data);
        System.out.println("root val: " + restored.val); // 1
    }
}`,
      rust: `struct TreeNode { val: i32, left: Option<Box<TreeNode>>, right: Option<Box<TreeNode>> }
fn serialize(root: Option<Box<TreeNode>>) -> String {
    // TODO: convert tree to a string
    String::new()
}
fn deserialize(data: &str) -> Option<Box<TreeNode>> {
    // TODO: reconstruct the tree from the string
    None
}
fn main() {
    println!("implement serialize/deserialize");
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;
struct TreeNode {
    int val; TreeNode *left, *right;
    TreeNode(int v, TreeNode* l=nullptr, TreeNode* r=nullptr):val(v),left(l),right(r){}
};
string serialize(TreeNode* root) {
    // TODO: convert tree to a string
    return "";
}
TreeNode* deserialize(string data) {
    // TODO: reconstruct the tree from the string
    return nullptr;
}
int main() {
    auto root = new TreeNode(1, new TreeNode(2),
        new TreeNode(3, new TreeNode(4), new TreeNode(5)));
    string data = serialize(root);
    cout << "serialized: " << data << endl;
    auto restored = deserialize(data);
    if (restored) cout << "root val: " << restored->val << endl;
}`,
      csharp: `using System;
class TreeNode {
    public int Val; public TreeNode Left, Right;
    public TreeNode(int v,TreeNode l=null,TreeNode r=null){Val=v;Left=l;Right=r;}
}
class Program {
    static string Serialize(TreeNode root) {
        // TODO: convert tree to a string
        return "";
    }
    static TreeNode Deserialize(string data) {
        // TODO: reconstruct the tree from the string
        return null;
    }
    static void Main() {
        var root = new TreeNode(1, new TreeNode(2),
            new TreeNode(3, new TreeNode(4), new TreeNode(5)));
        string data = Serialize(root);
        Console.WriteLine("serialized: " + data);
        var restored = Deserialize(data);
        if (restored != null) Console.WriteLine("root val: " + restored.Val); // 1
    }
}`,
    },
  },
  {
    slug: "alien-dictionary",
    title: "Alien Dictionary",
    category: "graph",
    difficulty: "hard",
    description:
      "You are given a list of words from an alien language dictionary, where the words are sorted lexicographically by the rules of that language.\n\nDerive the order of characters in the alien alphabet. Return a string of the unique characters in the correct order. If the order is invalid (circular dependency), return an empty string `\"\"`.\n\nIf multiple valid orderings exist, return any of them.\n\n**Hint:** Build a directed graph from adjacent word pairs and topological sort.",
    examples: [
      {
        input: 'words = ["wrt","wrf","er","ett","rftt"]',
        output: '"wertf"',
      },
      {
        input: 'words = ["z","x"]',
        output: '"zx"',
      },
      {
        input: 'words = ["z","x","z"]',
        output: '""',
        explanation: "Circular dependency — invalid order.",
      },
    ],
    starter: {
      go: `package main

import "fmt"

func alienOrder(words []string) string {
\t// TODO: topological sort of alien character ordering
\treturn ""
}

func main() {
\tfmt.Println(alienOrder([]string{"wrt", "wrf", "er", "ett", "rftt"})) // "wertf"
\tfmt.Println(alienOrder([]string{"z", "x", "z"}))                      // ""
}`,
      python: `from collections import defaultdict, deque

def alien_order(words: list[str]) -> str:
    # TODO: topological sort of alien character ordering
    return ""

print(alien_order(["wrt","wrf","er","ett","rftt"])) # "wertf"
print(alien_order(["z","x","z"]))                    # ""
`,
      javascript: `function alienOrder(words) {
    // TODO: topological sort of alien character ordering
    return "";
}
console.log(alienOrder(["wrt","wrf","er","ett","rftt"])); // "wertf"
console.log(alienOrder(["z","x","z"]));                    // ""`,
      java: `import java.util.*;
public class Main {
    public static String alienOrder(String[] words) {
        // TODO: topological sort of alien character ordering
        return "";
    }
    public static void main(String[] args) {
        System.out.println(alienOrder(new String[]{"wrt","wrf","er","ett","rftt"})); // wertf
        System.out.println(alienOrder(new String[]{"z","x","z"}));                   // (empty)
    }
}`,
      rust: `use std::collections::{HashMap, HashSet, VecDeque};
fn alien_order(words: Vec<&str>) -> String {
    // TODO: topological sort of alien character ordering
    String::new()
}
fn main() {
    println!("{}", alien_order(vec!["wrt","wrf","er","ett","rftt"]));
    println!("{}", alien_order(vec!["z","x","z"]));
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <queue>
using namespace std;
string alienOrder(vector<string>& words) {
    // TODO: topological sort of alien character ordering
    return "";
}
int main() {
    vector<string> w = {"wrt","wrf","er","ett","rftt"};
    cout << alienOrder(w) << endl;
}`,
      csharp: `using System;
using System.Collections.Generic;
class Program {
    static string AlienOrder(string[] words) {
        // TODO: topological sort of alien character ordering
        return "";
    }
    static void Main() {
        Console.WriteLine(AlienOrder(new[]{"wrt","wrf","er","ett","rftt"}));
        Console.WriteLine(AlienOrder(new[]{"z","x","z"}));
    }
}`,
    },
  },
  {
    slug: "burst-balloons",
    title: "Burst Balloons",
    category: "dynamic-programming",
    difficulty: "hard",
    description:
      "You are given `n` balloons, indexed from `0` to `n-1`. Each balloon is painted with a number on it represented by `nums[i]`.\n\nYou are asked to burst all the balloons. If you burst balloon `i`, you will get `nums[i-1] * nums[i] * nums[i+1]` coins. If `i-1` or `i+1` goes out of bounds, treat it as if there is a balloon with a `1` painted on it.\n\nReturn the **maximum coins** you can collect by bursting the balloons wisely.",
    examples: [
      {
        input: "nums = [3,1,5,8]",
        output: "167",
        explanation: "Burst 1→3×1×5=15, then 5→3×5×8=120, then 3→1×3×8=24, then 8→1×8×1=8. Total = 167.",
      },
      { input: "nums = [1,5]", output: "10" },
    ],
    starter: {
      go: `package main

import "fmt"

func maxCoins(nums []int) int {
\t// TODO: interval DP — find max coins from bursting all balloons
\treturn 0
}

func main() {
\tfmt.Println(maxCoins([]int{3, 1, 5, 8})) // 167
\tfmt.Println(maxCoins([]int{1, 5}))        // 10
}`,
      python: `def max_coins(nums: list[int]) -> int:
    # TODO: interval DP — find max coins from bursting all balloons
    return 0

print(max_coins([3, 1, 5, 8])) # 167
print(max_coins([1, 5]))        # 10
`,
      javascript: `function maxCoins(nums) {
    // TODO: interval DP — find max coins from bursting all balloons
    return 0;
}
console.log(maxCoins([3, 1, 5, 8])); // 167
console.log(maxCoins([1, 5]));        // 10`,
      java: `public class Main {
    public static int maxCoins(int[] nums) {
        // TODO: interval DP — find max coins from bursting all balloons
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(maxCoins(new int[]{3, 1, 5, 8})); // 167
        System.out.println(maxCoins(new int[]{1, 5}));        // 10
    }
}`,
      rust: `fn max_coins(nums: Vec<i32>) -> i32 {
    // TODO: interval DP — find max coins from bursting all balloons
    0
}
fn main() {
    println!("{}", max_coins(vec![3, 1, 5, 8])); // 167
    println!("{}", max_coins(vec![1, 5]));        // 10
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int maxCoins(vector<int>& nums) {
    // TODO: interval DP — find max coins from bursting all balloons
    return 0;
}
int main() {
    vector<int> a = {3,1,5,8};
    cout << maxCoins(a) << endl; // 167
}`,
      csharp: `using System;
class Program {
    static int MaxCoins(int[] nums) {
        // TODO: interval DP — find max coins from bursting all balloons
        return 0;
    }
    static void Main() {
        Console.WriteLine(MaxCoins(new int[]{3,1,5,8})); // 167
        Console.WriteLine(MaxCoins(new int[]{1,5}));      // 10
    }
}`,
    },
  },
  {
    slug: "word-search-ii",
    title: "Word Search II",
    category: "backtracking",
    difficulty: "hard",
    description:
      "Given an `m x n` board of characters and a list of strings `words`, return all words on the board.\n\nEach word must be constructed from letters of sequentially adjacent cells (horizontally or vertically adjacent). The same letter cell may not be used more than once in a word.\n\n**Hint:** Build a Trie from the words, then DFS with backtracking.",
    examples: [
      {
        input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]',
        output: '["eat","oath"]',
      },
      {
        input: 'board = [["a","b"],["c","d"]], words = ["abcb"]',
        output: "[]",
      },
    ],
    starter: {
      go: `package main

import "fmt"

func findWords(board [][]byte, words []string) []string {
\t// TODO: Trie + DFS backtracking to find all words on the board
\treturn nil
}

func main() {
\tboard := [][]byte{
\t\t{'o','a','a','n'},
\t\t{'e','t','a','e'},
\t\t{'i','h','k','r'},
\t\t{'i','f','l','v'},
\t}
\tfmt.Println(findWords(board, []string{"oath","pea","eat","rain"})) // [eat oath]
}`,
      python: `def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    # TODO: Trie + DFS backtracking to find all words on the board
    return []

board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]
print(find_words(board, ["oath","pea","eat","rain"])) # ['eat', 'oath']
`,
      javascript: `function findWords(board, words) {
    // TODO: Trie + DFS backtracking to find all words on the board
    return [];
}
const board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]];
console.log(findWords(board, ["oath","pea","eat","rain"])); // ["eat","oath"]`,
      java: `import java.util.*;
public class Main {
    public static List<String> findWords(char[][] board, String[] words) {
        // TODO: Trie + DFS backtracking to find all words on the board
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        char[][] board = {{'o','a','a','n'},{'e','t','a','e'},{'i','h','k','r'},{'i','f','l','v'}};
        System.out.println(findWords(board, new String[]{"oath","pea","eat","rain"}));
    }
}`,
      rust: `fn find_words(board: Vec<Vec<char>>, words: Vec<String>) -> Vec<String> {
    // TODO: Trie + DFS backtracking to find all words on the board
    vec![]
}
fn main() {
    println!("implement find_words");
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
    // TODO: Trie + DFS backtracking to find all words on the board
    return {};
}
int main() {
    vector<vector<char>> board = {{'o','a','a','n'},{'e','t','a','e'},{'i','h','k','r'},{'i','f','l','v'}};
    vector<string> words = {"oath","pea","eat","rain"};
    auto res = findWords(board, words);
    for (auto& s : res) cout << s << " ";
    cout << endl;
}`,
      csharp: `using System;
using System.Collections.Generic;
class Program {
    static IList<string> FindWords(char[][] board, string[] words) {
        // TODO: Trie + DFS backtracking to find all words on the board
        return new List<string>();
    }
    static void Main() {
        char[][] board = { new[]{'o','a','a','n'}, new[]{'e','t','a','e'}, new[]{'i','h','k','r'}, new[]{'i','f','l','v'} };
        Console.WriteLine(string.Join(", ", FindWords(board, new[]{"oath","pea","eat","rain"})));
    }
}`,
    },
  },
  {
    slug: "lru-cache",
    title: "LRU Cache",
    category: "design",
    difficulty: "hard",
    description:
      "Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.\n\nImplement the `LRUCache` class:\n- `LRUCache(capacity)` — initialize the LRU cache with a positive size `capacity`.\n- `get(key)` — return the value of the `key` if it exists, otherwise return `-1`.\n- `put(key, value)` — update the value of the `key` if it exists, or insert the key-value pair. If the number of keys exceeds `capacity`, evict the least recently used key.\n\n`get` and `put` must each run in `O(1)` average time complexity.",
    examples: [
      {
        input: 'LRUCache(2): put(1,1), put(2,2), get(1)→1, put(3,3), get(2)→-1, put(4,4), get(1)→-1, get(3)→3, get(4)→4',
        output: "All operations as described",
      },
    ],
    starter: {
      go: `package main

import "fmt"

type LRUCache struct {
\t// TODO: use a map + doubly linked list for O(1) get and put
}

func Constructor(capacity int) LRUCache {
\treturn LRUCache{}
}

func (c *LRUCache) Get(key int) int {
\treturn -1
}

func (c *LRUCache) Put(key int, value int) {
}

func main() {
\tcache := Constructor(2)
\tcache.Put(1, 1)
\tcache.Put(2, 2)
\tfmt.Println(cache.Get(1)) // 1
\tcache.Put(3, 3)
\tfmt.Println(cache.Get(2)) // -1 (evicted)
\tcache.Put(4, 4)
\tfmt.Println(cache.Get(1)) // -1 (evicted)
\tfmt.Println(cache.Get(3)) // 3
\tfmt.Println(cache.Get(4)) // 4
}`,
      python: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        # TODO: initialize the LRU cache
        pass

    def get(self, key: int) -> int:
        # TODO: return value or -1
        return -1

    def put(self, key: int, value: int) -> None:
        # TODO: insert/update, evict LRU if over capacity
        pass

cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))  # 1
cache.put(3, 3)
print(cache.get(2))  # -1
`,
      javascript: `class LRUCache {
    constructor(capacity) {
        // TODO: initialize the LRU cache
        this.capacity = capacity;
    }
    get(key) {
        // TODO: return value or -1
        return -1;
    }
    put(key, value) {
        // TODO: insert/update, evict LRU if over capacity
    }
}
const cache = new LRUCache(2);
cache.put(1, 1); cache.put(2, 2);
console.log(cache.get(1)); // 1
cache.put(3, 3);
console.log(cache.get(2)); // -1`,
      java: `import java.util.*;
public class Main {
    static class LRUCache {
        private int capacity;
        private LinkedHashMap<Integer,Integer> map;
        public LRUCache(int capacity) {
            this.capacity = capacity;
            // TODO: initialize data structures
        }
        public int get(int key) {
            // TODO: return value or -1
            return -1;
        }
        public void put(int key, int value) {
            // TODO: insert/update, evict LRU if over capacity
        }
    }
    public static void main(String[] args) {
        LRUCache cache = new LRUCache(2);
        cache.put(1,1); cache.put(2,2);
        System.out.println(cache.get(1)); // 1
        cache.put(3,3);
        System.out.println(cache.get(2)); // -1
    }
}`,
      rust: `use std::collections::HashMap;
struct LRUCache { capacity: usize }
impl LRUCache {
    fn new(capacity: usize) -> Self { Self { capacity } }
    fn get(&mut self, _key: i32) -> i32 { -1 }
    fn put(&mut self, _key: i32, _value: i32) {}
}
fn main() {
    let mut cache = LRUCache::new(2);
    cache.put(1, 1); cache.put(2, 2);
    println!("{}", cache.get(1)); // 1
    cache.put(3, 3);
    println!("{}", cache.get(2)); // -1
}`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <list>
using namespace std;
class LRUCache {
    int cap;
    list<pair<int,int>> cache;
    unordered_map<int, list<pair<int,int>>::iterator> mp;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        // TODO: return value or -1
        return -1;
    }
    void put(int key, int value) {
        // TODO: insert/update, evict LRU if over capacity
    }
};
int main() {
    LRUCache cache(2);
    cache.put(1,1); cache.put(2,2);
    cout << cache.get(1) << endl; // 1
    cache.put(3,3);
    cout << cache.get(2) << endl; // -1
}`,
      csharp: `using System;
using System.Collections.Generic;
class LRUCache {
    private int capacity;
    private LinkedList<(int key, int val)> list = new();
    private Dictionary<int, LinkedListNode<(int,int)>> map = new();
    public LRUCache(int capacity) { this.capacity = capacity; }
    public int Get(int key) {
        // TODO: return value or -1
        return -1;
    }
    public void Put(int key, int value) {
        // TODO: insert/update, evict LRU if over capacity
    }
}
class Program {
    static void Main() {
        var cache = new LRUCache(2);
        cache.Put(1,1); cache.Put(2,2);
        Console.WriteLine(cache.Get(1)); // 1
        cache.Put(3,3);
        Console.WriteLine(cache.Get(2)); // -1
    }
}`,
    },
  },
];
