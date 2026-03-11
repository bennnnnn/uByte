import type { PracticeProblem } from "./types";

export const MEDIUM_PROBLEMS_5: PracticeProblem[] = [
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    category: "string",
    difficulty: "medium",
    description:
      "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nTwo strings are anagrams if one is a rearrangement of the other's letters.",
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        explanation: "All anagrams are grouped together.",
      },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    starter: {
      go: `package main

import (
\t"fmt"
\t"sort"
\t"strings"
)

func groupAnagrams(strs []string) [][]string {
\t// TODO: group strings that are anagrams of each other
\t_ = sort.Strings
\t_ = strings.Split
\treturn nil
}

func main() {
\tstrs := []string{"eat", "tea", "tan", "ate", "nat", "bat"}
\tfmt.Println(groupAnagrams(strs))
}`,
      python: `from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    # TODO: group strings that are anagrams of each other
    return []

print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))
`,
      javascript: `function groupAnagrams(strs) {
    // TODO: group strings that are anagrams of each other
    return [];
}
console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));`,
      java: `import java.util.*;
public class Main {
    public static List<List<String>> groupAnagrams(String[] strs) {
        // TODO: group strings that are anagrams of each other
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        String[] strs = {"eat","tea","tan","ate","nat","bat"};
        System.out.println(groupAnagrams(strs));
    }
}`,
      rust: `use std::collections::HashMap;
fn group_anagrams(strs: Vec<String>) -> Vec<Vec<String>> {
    // TODO: group strings that are anagrams of each other
    vec![]
}
fn main() {
    let strs = vec!["eat","tea","tan","ate","nat","bat"].into_iter().map(String::from).collect();
    println!("{:?}", group_anagrams(strs));
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;
vector<vector<string>> groupAnagrams(vector<string>& strs) {
    // TODO: group strings that are anagrams of each other
    return {};
}
int main() {
    vector<string> strs = {"eat","tea","tan","ate","nat","bat"};
    auto res = groupAnagrams(strs);
    for (auto& g : res) { for (auto& s : g) cout << s << " "; cout << endl; }
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;
class Program {
    static List<List<string>> GroupAnagrams(string[] strs) {
        // TODO: group strings that are anagrams of each other
        return new List<List<string>>();
    }
    static void Main() {
        var result = GroupAnagrams(new[]{"eat","tea","tan","ate","nat","bat"});
        foreach (var g in result) Console.WriteLine(string.Join(", ", g));
    }
}`,
    },
  },
  {
    slug: "spiral-matrix",
    title: "Spiral Matrix",
    category: "array",
    difficulty: "medium",
    description:
      "Given an `m x n` matrix, return all elements of the matrix in spiral order (clockwise from the top-left).",
    examples: [
      {
        input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        output: "[1,2,3,6,9,8,7,4,5]",
      },
      {
        input: "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
        output: "[1,2,3,4,8,12,11,10,9,5,6,7]",
      },
    ],
    starter: {
      go: `package main

import "fmt"

func spiralOrder(matrix [][]int) []int {
\t// TODO: return elements in clockwise spiral order
\treturn nil
}

func main() {
\tm := [][]int{{1,2,3},{4,5,6},{7,8,9}}
\tfmt.Println(spiralOrder(m)) // [1 2 3 6 9 8 7 4 5]
}`,
      python: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    # TODO: return elements in clockwise spiral order
    return []

print(spiral_order([[1,2,3],[4,5,6],[7,8,9]])) # [1,2,3,6,9,8,7,4,5]
`,
      javascript: `function spiralOrder(matrix) {
    // TODO: return elements in clockwise spiral order
    return [];
}
console.log(spiralOrder([[1,2,3],[4,5,6],[7,8,9]])); // [1,2,3,6,9,8,7,4,5]`,
      java: `import java.util.*;
public class Main {
    public static List<Integer> spiralOrder(int[][] matrix) {
        // TODO: return elements in clockwise spiral order
        return new ArrayList<>();
    }
    public static void main(String[] args) {
        int[][] m = {{1,2,3},{4,5,6},{7,8,9}};
        System.out.println(spiralOrder(m));
    }
}`,
      rust: `fn spiral_order(matrix: Vec<Vec<i32>>) -> Vec<i32> {
    // TODO: return elements in clockwise spiral order
    vec![]
}
fn main() {
    let m = vec![vec![1,2,3],vec![4,5,6],vec![7,8,9]];
    println!("{:?}", spiral_order(m));
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
vector<int> spiralOrder(vector<vector<int>>& matrix) {
    // TODO: return elements in clockwise spiral order
    return {};
}
int main() {
    vector<vector<int>> m = {{1,2,3},{4,5,6},{7,8,9}};
    auto res = spiralOrder(m);
    for (int x : res) cout << x << " ";
    cout << endl;
}`,
      csharp: `using System;
using System.Collections.Generic;
class Program {
    static IList<int> SpiralOrder(int[][] matrix) {
        // TODO: return elements in clockwise spiral order
        return new List<int>();
    }
    static void Main() {
        int[][] m = { new[]{1,2,3}, new[]{4,5,6}, new[]{7,8,9} };
        Console.WriteLine(string.Join(", ", SpiralOrder(m)));
    }
}`,
    },
  },
  {
    slug: "rotate-image",
    title: "Rotate Image",
    category: "array",
    difficulty: "medium",
    description:
      "You are given an `n x n` 2D matrix representing an image. Rotate the matrix **90 degrees clockwise**, **in-place**.\n\nDo not allocate another 2D matrix — modify the input matrix directly.",
    examples: [
      {
        input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        output: "[[7,4,1],[8,5,2],[9,6,3]]",
      },
      {
        input: "matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]",
        output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]",
      },
    ],
    starter: {
      go: `package main

import "fmt"

func rotate(matrix [][]int) {
\t// TODO: rotate matrix 90 degrees clockwise in-place
}

func main() {
\tm := [][]int{{1,2,3},{4,5,6},{7,8,9}}
\trotate(m)
\tfmt.Println(m) // [[7 4 1] [8 5 2] [9 6 3]]
}`,
      python: `def rotate(matrix: list[list[int]]) -> None:
    # TODO: rotate matrix 90 degrees clockwise in-place (modify in place)
    pass

m = [[1,2,3],[4,5,6],[7,8,9]]
rotate(m)
print(m) # [[7,4,1],[8,5,2],[9,6,3]]
`,
      javascript: `function rotate(matrix) {
    // TODO: rotate matrix 90 degrees clockwise in-place
}
const m = [[1,2,3],[4,5,6],[7,8,9]];
rotate(m);
console.log(m); // [[7,4,1],[8,5,2],[9,6,3]]`,
      java: `public class Main {
    public static void rotate(int[][] matrix) {
        // TODO: rotate matrix 90 degrees clockwise in-place
    }
    public static void main(String[] args) {
        int[][] m = {{1,2,3},{4,5,6},{7,8,9}};
        rotate(m);
        for (int[] row : m) { for (int v : row) System.out.print(v + " "); System.out.println(); }
    }
}`,
      rust: `fn rotate(matrix: &mut Vec<Vec<i32>>) {
    // TODO: rotate matrix 90 degrees clockwise in-place
}
fn main() {
    let mut m = vec![vec![1,2,3],vec![4,5,6],vec![7,8,9]];
    rotate(&mut m);
    println!("{:?}", m);
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
void rotate(vector<vector<int>>& matrix) {
    // TODO: rotate matrix 90 degrees clockwise in-place
}
int main() {
    vector<vector<int>> m = {{1,2,3},{4,5,6},{7,8,9}};
    rotate(m);
    for (auto& row : m) { for (int v : row) cout << v << " "; cout << endl; }
}`,
      csharp: `using System;
class Program {
    static void Rotate(int[][] matrix) {
        // TODO: rotate matrix 90 degrees clockwise in-place
    }
    static void Main() {
        int[][] m = { new[]{1,2,3}, new[]{4,5,6}, new[]{7,8,9} };
        Rotate(m);
        foreach (var row in m) Console.WriteLine(string.Join(" ", row));
    }
}`,
    },
  },
  {
    slug: "find-peak-element",
    title: "Find Peak Element",
    category: "binary-search",
    difficulty: "medium",
    description:
      "A peak element is an element that is strictly greater than its neighbors.\n\nGiven an integer array `nums`, find a peak element and return its index. If the array contains multiple peaks, return the index of any of them.\n\nYou may imagine that `nums[-1] = nums[n] = -∞`.\n\nYou must write an algorithm that runs in `O(log n)` time.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "2", explanation: "nums[2] = 3 is a peak." },
      { input: "nums = [1,2,1,3,5,6,4]", output: "5", explanation: "nums[5] = 6 is a peak." },
    ],
    starter: {
      go: `package main

import "fmt"

func findPeakElement(nums []int) int {
\t// TODO: find index of a peak element using O(log n) binary search
\treturn 0
}

func main() {
\tfmt.Println(findPeakElement([]int{1, 2, 3, 1}))       // 2
\tfmt.Println(findPeakElement([]int{1, 2, 1, 3, 5, 6, 4})) // 5
}`,
      python: `def find_peak_element(nums: list[int]) -> int:
    # TODO: find index of a peak element using O(log n) binary search
    return 0

print(find_peak_element([1, 2, 3, 1]))          # 2
print(find_peak_element([1, 2, 1, 3, 5, 6, 4])) # 5
`,
      javascript: `function findPeakElement(nums) {
    // TODO: find index of a peak element using O(log n) binary search
    return 0;
}
console.log(findPeakElement([1, 2, 3, 1]));          // 2
console.log(findPeakElement([1, 2, 1, 3, 5, 6, 4])); // 5`,
      java: `public class Main {
    public static int findPeakElement(int[] nums) {
        // TODO: find index of a peak element using O(log n) binary search
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(findPeakElement(new int[]{1,2,3,1}));         // 2
        System.out.println(findPeakElement(new int[]{1,2,1,3,5,6,4}));   // 5
    }
}`,
      rust: `fn find_peak_element(nums: Vec<i64>) -> usize {
    // TODO: find index of a peak element using O(log n) binary search
    0
}
fn main() {
    println!("{}", find_peak_element(vec![1,2,3,1]));        // 2
    println!("{}", find_peak_element(vec![1,2,1,3,5,6,4]));  // 5
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int findPeakElement(vector<int>& nums) {
    // TODO: find index of a peak element using O(log n) binary search
    return 0;
}
int main() {
    vector<int> a = {1,2,3,1};
    cout << findPeakElement(a) << endl; // 2
}`,
      csharp: `using System;
class Program {
    static int FindPeakElement(int[] nums) {
        // TODO: find index of a peak element using O(log n) binary search
        return 0;
    }
    static void Main() {
        Console.WriteLine(FindPeakElement(new int[]{1,2,3,1}));       // 2
        Console.WriteLine(FindPeakElement(new int[]{1,2,1,3,5,6,4})); // 5
    }
}`,
    },
  },
  {
    slug: "count-good-nodes",
    title: "Count Good Nodes in Binary Tree",
    category: "tree",
    difficulty: "medium",
    description:
      "Given a binary tree root, a node `X` in the tree is named **good** if in the path from root to `X` there are no nodes with a value greater than `X`.\n\nReturn the number of good nodes in the binary tree.\n\nFor this problem, represent the binary tree as a level-order array where `-1` means null.\n\n**Hint:** Use depth-first search, tracking the maximum value seen on the path from root to current node.",
    examples: [
      {
        input: "root = [3,1,4,3,-1,1,5]",
        output: "4",
        explanation: "Nodes 3 (root), 4, 3, and 5 are good.",
      },
      { input: "root = [3,3,-1,4,2]", output: "3" },
    ],
    starter: {
      go: `package main

import "fmt"

type TreeNode struct {
\tVal   int
\tLeft  *TreeNode
\tRight *TreeNode
}

func goodNodes(root *TreeNode) int {
\t// TODO: count nodes where no ancestor has a greater value
\treturn 0
}

func main() {
\t// Tree: 3 -> 1,4 -> 3,-1,1,5
\troot := &TreeNode{Val: 3,
\t\tLeft:  &TreeNode{Val: 1, Left: &TreeNode{Val: 3}},
\t\tRight: &TreeNode{Val: 4, Left: &TreeNode{Val: 1}, Right: &TreeNode{Val: 5}},
\t}
\tfmt.Println(goodNodes(root)) // 4
}`,
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def good_nodes(root: TreeNode) -> int:
    # TODO: count nodes where no ancestor has a greater value
    return 0

root = TreeNode(3, TreeNode(1, TreeNode(3)), TreeNode(4, TreeNode(1), TreeNode(5)))
print(good_nodes(root)) # 4
`,
      javascript: `class TreeNode {
    constructor(val, left = null, right = null) {
        this.val = val; this.left = left; this.right = right;
    }
}
function goodNodes(root) {
    // TODO: count nodes where no ancestor has a greater value
    return 0;
}
const root = new TreeNode(3,
    new TreeNode(1, new TreeNode(3)),
    new TreeNode(4, new TreeNode(1), new TreeNode(5))
);
console.log(goodNodes(root)); // 4`,
      java: `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
        TreeNode(int v, TreeNode l, TreeNode r) { val = v; left = l; right = r; }
    }
    public static int goodNodes(TreeNode root) {
        // TODO: count nodes where no ancestor has a greater value
        return 0;
    }
    public static void main(String[] args) {
        TreeNode root = new TreeNode(3,
            new TreeNode(1, new TreeNode(3), null),
            new TreeNode(4, new TreeNode(1), new TreeNode(5)));
        System.out.println(goodNodes(root)); // 4
    }
}`,
      rust: `#[derive(Debug)]
struct TreeNode { val: i32, left: Option<Box<TreeNode>>, right: Option<Box<TreeNode>> }
impl TreeNode {
    fn new(v: i32) -> Box<Self> { Box::new(Self { val: v, left: None, right: None }) }
}
fn good_nodes(root: Option<Box<TreeNode>>) -> i32 {
    // TODO: count nodes where no ancestor has a greater value
    0
}
fn main() {
    // build tree and test
    println!("implement good_nodes");
}`,
      cpp: `#include <iostream>
using namespace std;
struct TreeNode {
    int val; TreeNode *left, *right;
    TreeNode(int v, TreeNode* l=nullptr, TreeNode* r=nullptr) : val(v),left(l),right(r){}
};
int goodNodes(TreeNode* root) {
    // TODO: count nodes where no ancestor has a greater value
    return 0;
}
int main() {
    auto root = new TreeNode(3,
        new TreeNode(1, new TreeNode(3)),
        new TreeNode(4, new TreeNode(1), new TreeNode(5)));
    cout << goodNodes(root) << endl; // 4
}`,
      csharp: `using System;
class TreeNode {
    public int Val; public TreeNode Left, Right;
    public TreeNode(int v, TreeNode l=null, TreeNode r=null){Val=v;Left=l;Right=r;}
}
class Program {
    static int GoodNodes(TreeNode root) {
        // TODO: count nodes where no ancestor has a greater value
        return 0;
    }
    static void Main() {
        var root = new TreeNode(3,
            new TreeNode(1, new TreeNode(3)),
            new TreeNode(4, new TreeNode(1), new TreeNode(5)));
        Console.WriteLine(GoodNodes(root)); // 4
    }
}`,
    },
  },
];
