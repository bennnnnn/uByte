import type { PracticeProblem } from "./types";

export const MEDIUM_PROBLEMS_6: PracticeProblem[] = [
  // ── Tree ──────────────────────────────────────────────────────────────────

  {
    slug: "binary-tree-right-side-view",
    title: "Binary Tree Right Side View",
    category: "tree",
    difficulty: "medium",
    description:
      "Given the `root` of a binary tree, imagine yourself standing on the **right side** of it. Return the values of the nodes you can see ordered from top to bottom.\n\nUse level-order traversal (BFS) and take the **last** element of each level.",
    examples: [
      { input: "root = [1,2,3,null,5,null,4]", output: "[1,3,4]" },
      { input: "root = [1,null,3]", output: "[1,3]" },
      { input: "root = []", output: "[]" },
    ],
    starter: {
      python: `from collections import deque
from typing import Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def right_side_view(root: Optional[TreeNode]) -> list[int]:
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i == level_size - 1:
                result.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
    return result

if __name__ == "__main__":
    root = TreeNode(1, TreeNode(2, None, TreeNode(5)), TreeNode(3, None, TreeNode(4)))
    print(right_side_view(root))  # [1, 3, 4]
`,
      javascript: `/**
 * @param {TreeNode} root
 * @return {number[]}
 */
function rightSideView(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length) {
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            if (i === size - 1) result.push(node.val);
            if (node.left)  queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    return result;
}`,
      go: `package main

import "fmt"

type TreeNode struct {
\tVal   int
\tLeft  *TreeNode
\tRight *TreeNode
}

func rightSideView(root *TreeNode) []int {
\tif root == nil {
\t\treturn nil
\t}
\tresult := []int{}
\tqueue := []*TreeNode{root}
\tfor len(queue) > 0 {
\t\tlevelSize := len(queue)
\t\tfor i := 0; i < levelSize; i++ {
\t\t\tnode := queue[0]
\t\t\tqueue = queue[1:]
\t\t\tif i == levelSize-1 {
\t\t\t\tresult = append(result, node.Val)
\t\t\t}
\t\t\tif node.Left != nil  { queue = append(queue, node.Left) }
\t\t\tif node.Right != nil { queue = append(queue, node.Right) }
\t\t}
\t}
\treturn result
}

func main() {
\troot := &TreeNode{1, &TreeNode{2, nil, &TreeNode{5, nil, nil}}, &TreeNode{3, nil, &TreeNode{4, nil, nil}}}
\tfmt.Println(rightSideView(root))  // [1 3 4]
}`,
      java: `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
        TreeNode(int v, TreeNode l, TreeNode r) { val = v; left = l; right = r; }
    }

    public static List<Integer> rightSideView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (i == size - 1) result.add(node.val);
                if (node.left  != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1, new TreeNode(2, null, new TreeNode(5)), new TreeNode(3, null, new TreeNode(4)));
        System.out.println(rightSideView(root));  // [1, 3, 4]
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

struct TreeNode {
    int val; TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

vector<int> rightSideView(TreeNode* root) {
    vector<int> result;
    if (!root) return result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int size = q.size();
        for (int i = 0; i < size; i++) {
            auto node = q.front(); q.pop();
            if (i == size - 1) result.push_back(node->val);
            if (node->left)  q.push(node->left);
            if (node->right) q.push(node->right);
        }
    }
    return result;
}

int main() {
    TreeNode* r = new TreeNode(1);
    r->left = new TreeNode(2); r->right = new TreeNode(3);
    r->left->right = new TreeNode(5); r->right->right = new TreeNode(4);
    for (int v : rightSideView(r)) cout << v << " ";
    cout << endl;
}`,
      rust: `use std::collections::VecDeque;
use std::rc::Rc;
use std::cell::RefCell;

type Node = Option<Rc<RefCell<TreeNode>>>;
struct TreeNode { val: i32, left: Node, right: Node }

fn right_side_view(root: Node) -> Vec<i32> {
    let mut result = vec![];
    if root.is_none() { return result; }
    let mut queue = VecDeque::new();
    queue.push_back(root.unwrap());
    while !queue.is_empty() {
        let size = queue.len();
        for i in 0..size {
            let node = queue.pop_front().unwrap();
            let node = node.borrow();
            if i == size - 1 { result.push(node.val); }
            if let Some(l) = node.left.clone() { queue.push_back(l); }
            if let Some(r) = node.right.clone() { queue.push_back(r); }
        }
    }
    result
}

fn main() { println!("Implement binary tree right side view"); }`,
      csharp: `using System;
using System.Collections.Generic;

class TreeNode {
    public int val; public TreeNode left, right;
    public TreeNode(int v, TreeNode l = null, TreeNode r = null) { val = v; left = l; right = r; }
}

class Program {
    static IList<int> RightSideView(TreeNode root) {
        var result = new List<int>();
        if (root == null) return result;
        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        while (queue.Count > 0) {
            int size = queue.Count;
            for (int i = 0; i < size; i++) {
                var node = queue.Dequeue();
                if (i == size - 1) result.Add(node.val);
                if (node.left  != null) queue.Enqueue(node.left);
                if (node.right != null) queue.Enqueue(node.right);
            }
        }
        return result;
    }

    static void Main() {
        var root = new TreeNode(1, new TreeNode(2, null, new TreeNode(5)), new TreeNode(3, null, new TreeNode(4)));
        Console.WriteLine(string.Join(", ", RightSideView(root)));  // 1, 3, 4
    }
}`,
    },
  },

  {
    slug: "lowest-common-ancestor-bst",
    title: "Lowest Common Ancestor of a BST",
    category: "tree",
    difficulty: "medium",
    description:
      "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.\n\nAccording to the definition of LCA: 'The lowest common ancestor is defined between two nodes `p` and `q` as the lowest node in `T` that has both `p` and `q` as descendants (where we allow a node to be a descendant of itself).'\n\n**Insight:** In a BST, if both `p` and `q` are smaller than `root`, the LCA is in the left subtree. If both are larger, it's in the right subtree. Otherwise, `root` is the LCA.",
    examples: [
      { input: "root = [6,2,8,0,4,7,9], p = 2, q = 8", output: "6" },
      { input: "root = [6,2,8,0,4,7,9], p = 2, q = 4", output: "2" },
    ],
    starter: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right

def lowest_common_ancestor(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
    return root

if __name__ == "__main__":
    # Build BST [6,2,8,0,4,7,9]
    root = TreeNode(6, TreeNode(2, TreeNode(0), TreeNode(4)), TreeNode(8, TreeNode(7), TreeNode(9)))
    p, q = root.left, root.right  # 2 and 8
    print(lowest_common_ancestor(root, p, q).val)  # 6
`,
      javascript: `function lowestCommonAncestor(root, p, q) {
    while (root) {
        if (p.val < root.val && q.val < root.val) {
            root = root.left;
        } else if (p.val > root.val && q.val > root.val) {
            root = root.right;
        } else {
            return root;
        }
    }
    return null;
}`,
      go: `package main

import "fmt"

type TreeNode struct { Val int; Left, Right *TreeNode }

func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
\tfor root != nil {
\t\tif p.Val < root.Val && q.Val < root.Val {
\t\t\troot = root.Left
\t\t} else if p.Val > root.Val && q.Val > root.Val {
\t\t\troot = root.Right
\t\t} else {
\t\t\treturn root
\t\t}
\t}
\treturn nil
}

func main() { fmt.Println("Implement BST LCA") }`,
      java: `public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v){ val=v; } }

    public static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        while (root != null) {
            if (p.val < root.val && q.val < root.val) {
                root = root.left;
            } else if (p.val > root.val && q.val > root.val) {
                root = root.right;
            } else {
                return root;
            }
        }
        return null;
    }

    public static void main(String[] args) { System.out.println("Implement BST LCA"); }
}`,
      cpp: `#include <iostream>
using namespace std;

struct TreeNode { int val; TreeNode *left, *right; TreeNode(int v): val(v),left(nullptr),right(nullptr){} };

TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    while (root) {
        if (p->val < root->val && q->val < root->val) root = root->left;
        else if (p->val > root->val && q->val > root->val) root = root->right;
        else return root;
    }
    return nullptr;
}

int main() { cout << "Implement BST LCA" << endl; }`,
      rust: `struct TreeNode { val: i32, left: Option<Box<TreeNode>>, right: Option<Box<TreeNode>> }

fn lowest_common_ancestor(mut root: &TreeNode, p_val: i32, q_val: i32) -> i32 {
    loop {
        if p_val < root.val && q_val < root.val {
            root = root.left.as_ref().unwrap();
        } else if p_val > root.val && q_val > root.val {
            root = root.right.as_ref().unwrap();
        } else {
            return root.val;
        }
    }
}

fn main() { println!("Implement BST LCA"); }`,
      csharp: `using System;

class TreeNode { public int val; public TreeNode left, right; public TreeNode(int v){ val=v; } }

class Program {
    static TreeNode LowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        while (root != null) {
            if (p.val < root.val && q.val < root.val) root = root.left;
            else if (p.val > root.val && q.val > root.val) root = root.right;
            else return root;
        }
        return null;
    }
    static void Main() { Console.WriteLine("Implement BST LCA"); }
}`,
    },
  },

  // ── Graph ─────────────────────────────────────────────────────────────────

  {
    slug: "course-schedule",
    title: "Course Schedule",
    category: "graph",
    difficulty: "medium",
    description:
      "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`.\n\nReturn `true` if you can finish all courses, otherwise `false`.\n\n**Hint:** This is a cycle detection problem in a directed graph. Use DFS or BFS (Kahn's algorithm).",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "Take course 0, then course 1." },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", explanation: "Cycle: 0→1→0." },
    ],
    starter: {
      python: `from collections import deque

def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    # Build adjacency list and in-degree array for Kahn's algorithm
    graph = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses
    for a, b in prerequisites:
        graph[b].append(a)
        in_degree[a] += 1
    queue = deque(i for i in range(num_courses) if in_degree[i] == 0)
    count = 0
    while queue:
        node = queue.popleft()
        count += 1
        for nei in graph[node]:
            in_degree[nei] -= 1
            if in_degree[nei] == 0:
                queue.append(nei)
    return count == num_courses

if __name__ == "__main__":
    print(can_finish(2, [[1,0]]))         # True
    print(can_finish(2, [[1,0],[0,1]]))   # False
`,
      javascript: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
    const graph = Array.from({ length: numCourses }, () => []);
    const inDegree = new Array(numCourses).fill(0);
    for (const [a, b] of prerequisites) {
        graph[b].push(a);
        inDegree[a]++;
    }
    const queue = [];
    for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) queue.push(i);
    let count = 0;
    while (queue.length) {
        const node = queue.shift();
        count++;
        for (const nei of graph[node]) {
            if (--inDegree[nei] === 0) queue.push(nei);
        }
    }
    return count === numCourses;
}

console.log(canFinish(2, [[1,0]]));        // true
console.log(canFinish(2, [[1,0],[0,1]]));  // false
`,
      go: `package main

import "fmt"

func canFinish(numCourses int, prerequisites [][]int) bool {
\tgraph := make([][]int, numCourses)
\tinDegree := make([]int, numCourses)
\tfor _, p := range prerequisites {
\t\tgraph[p[1]] = append(graph[p[1]], p[0])
\t\tinDegree[p[0]]++
\t}
\tqueue := []int{}
\tfor i := 0; i < numCourses; i++ {
\t\tif inDegree[i] == 0 {
\t\t\tqueue = append(queue, i)
\t\t}
\t}
\tcount := 0
\tfor len(queue) > 0 {
\t\tnode := queue[0]; queue = queue[1:]
\t\tcount++
\t\tfor _, nei := range graph[node] {
\t\t\tinDegree[nei]--
\t\t\tif inDegree[nei] == 0 {
\t\t\t\tqueue = append(queue, nei)
\t\t\t}
\t\t}
\t}
\treturn count == numCourses
}

func main() {
\tfmt.Println(canFinish(2, [][]int{{1,0}}))        // true
\tfmt.Println(canFinish(2, [][]int{{1,0},{0,1}}))  // false
}`,
      java: `import java.util.*;

public class Main {
    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        int[] inDegree = new int[numCourses];
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        for (int[] p : prerequisites) { graph.get(p[1]).add(p[0]); inDegree[p[0]]++; }
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) queue.offer(i);
        int count = 0;
        while (!queue.isEmpty()) {
            int node = queue.poll(); count++;
            for (int nei : graph.get(node)) if (--inDegree[nei] == 0) queue.offer(nei);
        }
        return count == numCourses;
    }

    public static void main(String[] args) {
        System.out.println(canFinish(2, new int[][]{{1,0}}));       // true
        System.out.println(canFinish(2, new int[][]{{1,0},{0,1}})); // false
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> graph(numCourses);
    vector<int> inDegree(numCourses, 0);
    for (auto& p : prerequisites) { graph[p[1]].push_back(p[0]); inDegree[p[0]]++; }
    queue<int> q;
    for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) q.push(i);
    int count = 0;
    while (!q.empty()) {
        int node = q.front(); q.pop(); count++;
        for (int nei : graph[node]) if (--inDegree[nei] == 0) q.push(nei);
    }
    return count == numCourses;
}

int main() {
    vector<vector<int>> prereqs = {{1,0}};
    cout << canFinish(2, prereqs) << endl;  // 1
}`,
      rust: `use std::collections::VecDeque;

fn can_finish(num_courses: usize, prerequisites: Vec<[usize; 2]>) -> bool {
    let mut graph = vec![vec![]; num_courses];
    let mut in_degree = vec![0usize; num_courses];
    for p in &prerequisites {
        graph[p[1]].push(p[0]);
        in_degree[p[0]] += 1;
    }
    let mut queue: VecDeque<usize> = (0..num_courses).filter(|&i| in_degree[i] == 0).collect();
    let mut count = 0;
    while let Some(node) = queue.pop_front() {
        count += 1;
        for &nei in &graph[node] {
            in_degree[nei] -= 1;
            if in_degree[nei] == 0 { queue.push_back(nei); }
        }
    }
    count == num_courses
}

fn main() {
    println!("{}", can_finish(2, vec![[1,0]]));        // true
    println!("{}", can_finish(2, vec![[1,0],[0,1]]));  // false
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static bool CanFinish(int numCourses, int[][] prerequisites) {
        var graph = new List<int>[numCourses];
        var inDegree = new int[numCourses];
        for (int i = 0; i < numCourses; i++) graph[i] = new List<int>();
        foreach (var p in prerequisites) { graph[p[1]].Add(p[0]); inDegree[p[0]]++; }
        var queue = new Queue<int>();
        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) queue.Enqueue(i);
        int count = 0;
        while (queue.Count > 0) {
            int node = queue.Dequeue(); count++;
            foreach (int nei in graph[node]) if (--inDegree[nei] == 0) queue.Enqueue(nei);
        }
        return count == numCourses;
    }

    static void Main() {
        Console.WriteLine(CanFinish(2, new[]{new[]{1,0}}));             // True
        Console.WriteLine(CanFinish(2, new[]{new[]{1,0},new[]{0,1}})); // False
    }
}`,
    },
  },

  // ── Stack ─────────────────────────────────────────────────────────────────

  {
    slug: "evaluate-reverse-polish",
    title: "Evaluate Reverse Polish Notation",
    category: "stack",
    difficulty: "medium",
    description:
      "You are given an array of strings `tokens` that represents an arithmetic expression in **Reverse Polish Notation** (RPN).\n\nEvaluate the expression. Return an integer that represents the value.\n\n**Valid operators:** `+`, `-`, `*`, `/`. Each operand may be an integer or another expression. Division truncates toward zero.",
    examples: [
      { input: 'tokens = ["2","1","+","3","*"]', output: "9", explanation: "((2 + 1) * 3) = 9" },
      { input: 'tokens = ["4","13","5","/","+"]', output: "6", explanation: "(4 + (13 / 5)) = 6" },
    ],
    starter: {
      python: `def eval_rpn(tokens: list[str]) -> int:
    stack = []
    for token in tokens:
        if token in ('+', '-', '*', '/'):
            b, a = stack.pop(), stack.pop()
            if token == '+': stack.append(a + b)
            elif token == '-': stack.append(a - b)
            elif token == '*': stack.append(a * b)
            else: stack.append(int(a / b))  # truncate toward zero
        else:
            stack.append(int(token))
    return stack[0]

if __name__ == "__main__":
    print(eval_rpn(["2","1","+","3","*"]))       # 9
    print(eval_rpn(["4","13","5","/","+"]))       # 6
`,
      javascript: `/**
 * @param {string[]} tokens
 * @return {number}
 */
function evalRPN(tokens) {
    const stack = [];
    const ops = { '+': (a,b) => a+b, '-': (a,b) => a-b, '*': (a,b) => a*b, '/': (a,b) => Math.trunc(a/b) };
    for (const t of tokens) {
        if (ops[t]) {
            const b = stack.pop(), a = stack.pop();
            stack.push(ops[t](a, b));
        } else {
            stack.push(parseInt(t));
        }
    }
    return stack[0];
}

console.log(evalRPN(["2","1","+","3","*"]));  // 9
console.log(evalRPN(["4","13","5","/","+"])); // 6
`,
      go: `package main

import (
\t"fmt"
\t"strconv"
)

func evalRPN(tokens []string) int {
\tstack := []int{}
\tfor _, t := range tokens {
\t\tswitch t {
\t\tcase "+", "-", "*", "/":
\t\t\tb, a := stack[len(stack)-1], stack[len(stack)-2]
\t\t\tstack = stack[:len(stack)-2]
\t\t\tswitch t {
\t\t\tcase "+": stack = append(stack, a+b)
\t\t\tcase "-": stack = append(stack, a-b)
\t\t\tcase "*": stack = append(stack, a*b)
\t\t\tcase "/": stack = append(stack, a/b)
\t\t\t}
\t\tdefault:
\t\t\tn, _ := strconv.Atoi(t)
\t\t\tstack = append(stack, n)
\t\t}
\t}
\treturn stack[0]
}

func main() {
\tfmt.Println(evalRPN([]string{"2","1","+","3","*"}))  // 9
}`,
      java: `import java.util.*;

public class Main {
    public static int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String t : tokens) {
            if ("+".equals(t)||"-".equals(t)||"*".equals(t)||"/".equals(t)) {
                int b = stack.pop(), a = stack.pop();
                switch (t) {
                    case "+": stack.push(a+b); break;
                    case "-": stack.push(a-b); break;
                    case "*": stack.push(a*b); break;
                    case "/": stack.push(a/b); break;
                }
            } else {
                stack.push(Integer.parseInt(t));
            }
        }
        return stack.pop();
    }

    public static void main(String[] args) {
        System.out.println(evalRPN(new String[]{"2","1","+","3","*"}));  // 9
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <stack>
#include <string>
using namespace std;

int evalRPN(vector<string>& tokens) {
    stack<int> st;
    for (auto& t : tokens) {
        if (t=="+"||t=="-"||t=="*"||t=="/") {
            int b=st.top();st.pop(); int a=st.top();st.pop();
            if (t=="+") st.push(a+b);
            else if (t=="-") st.push(a-b);
            else if (t=="*") st.push(a*b);
            else st.push(a/b);
        } else {
            st.push(stoi(t));
        }
    }
    return st.top();
}

int main() {
    vector<string> t = {"2","1","+","3","*"};
    cout << evalRPN(t) << endl;  // 9
}`,
      rust: `fn eval_rpn(tokens: Vec<&str>) -> i64 {
    let mut stack: Vec<i64> = vec![];
    for t in tokens {
        match t {
            "+" | "-" | "*" | "/" => {
                let (b, a) = (stack.pop().unwrap(), stack.pop().unwrap());
                stack.push(match t {
                    "+" => a + b, "-" => a - b, "*" => a * b,
                    _   => a / b,
                });
            }
            _ => stack.push(t.parse().unwrap()),
        }
    }
    stack[0]
}

fn main() {
    println!("{}", eval_rpn(vec!["2","1","+","3","*"]));  // 9
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static int EvalRPN(string[] tokens) {
        var stack = new Stack<int>();
        foreach (var t in tokens) {
            if (t is "+" or "-" or "*" or "/") {
                int b = stack.Pop(), a = stack.Pop();
                stack.Push(t switch { "+"=>a+b, "-"=>a-b, "*"=>a*b, _=>a/b });
            } else {
                stack.Push(int.Parse(t));
            }
        }
        return stack.Pop();
    }

    static void Main() {
        Console.WriteLine(EvalRPN(new[]{"2","1","+","3","*"}));  // 9
    }
}`,
    },
  },

  {
    slug: "daily-temperatures",
    title: "Daily Temperatures",
    category: "stack",
    difficulty: "medium",
    description:
      "Given an array of integers `temperatures` representing the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`-th day to get a warmer temperature. If there is no future day with a warmer temperature, keep `answer[i] == 0`.\n\nUse a **monotonic decreasing stack** storing indices.",
    examples: [
      { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" },
      { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]" },
      { input: "temperatures = [30,60,90]", output: "[1,1,0]" },
    ],
    starter: {
      python: `def daily_temperatures(temperatures: list[int]) -> list[int]:
    n = len(temperatures)
    answer = [0] * n
    stack = []  # monotonic decreasing stack of indices
    for i, temp in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temp:
            idx = stack.pop()
            answer[idx] = i - idx
        stack.append(i)
    return answer

if __name__ == "__main__":
    print(daily_temperatures([73,74,75,71,69,72,76,73]))  # [1,1,4,2,1,1,0,0]
    print(daily_temperatures([30,40,50,60]))               # [1,1,1,0]
`,
      javascript: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
    const answer = new Array(temperatures.length).fill(0);
    const stack = [];  // monotonic stack of indices
    for (let i = 0; i < temperatures.length; i++) {
        while (stack.length && temperatures[stack[stack.length-1]] < temperatures[i]) {
            const idx = stack.pop();
            answer[idx] = i - idx;
        }
        stack.push(i);
    }
    return answer;
}

console.log(dailyTemperatures([73,74,75,71,69,72,76,73]));  // [1,1,4,2,1,1,0,0]
`,
      go: `package main

import "fmt"

func dailyTemperatures(temperatures []int) []int {
\tn := len(temperatures)
\tanswer := make([]int, n)
\tstack := []int{}
\tfor i, temp := range temperatures {
\t\tfor len(stack) > 0 && temperatures[stack[len(stack)-1]] < temp {
\t\t\tidx := stack[len(stack)-1]
\t\t\tstack = stack[:len(stack)-1]
\t\t\tanswer[idx] = i - idx
\t\t}
\t\tstack = append(stack, i)
\t}
\treturn answer
}

func main() {
\tfmt.Println(dailyTemperatures([]int{73,74,75,71,69,72,76,73}))
}`,
      java: `import java.util.*;

public class Main {
    public static int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] answer = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                int idx = stack.pop();
                answer[idx] = i - idx;
            }
            stack.push(i);
        }
        return answer;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{73,74,75,71,69,72,76,73})));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

vector<int> dailyTemperatures(vector<int>& temperatures) {
    int n = temperatures.size();
    vector<int> answer(n, 0);
    stack<int> st;
    for (int i = 0; i < n; i++) {
        while (!st.empty() && temperatures[st.top()] < temperatures[i]) {
            int idx = st.top(); st.pop();
            answer[idx] = i - idx;
        }
        st.push(i);
    }
    return answer;
}

int main() {
    vector<int> t = {73,74,75,71,69,72,76,73};
    auto ans = dailyTemperatures(t);
    for (int v : ans) cout << v << " ";
    cout << endl;
}`,
      rust: `fn daily_temperatures(temperatures: Vec<i32>) -> Vec<i32> {
    let n = temperatures.len();
    let mut answer = vec![0i32; n];
    let mut stack: Vec<usize> = vec![];
    for (i, &temp) in temperatures.iter().enumerate() {
        while let Some(&top) = stack.last() {
            if temperatures[top] < temp {
                stack.pop();
                answer[top] = (i - top) as i32;
            } else { break; }
        }
        stack.push(i);
    }
    answer
}

fn main() {
    println!("{:?}", daily_temperatures(vec![73,74,75,71,69,72,76,73]));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static int[] DailyTemperatures(int[] temperatures) {
        int n = temperatures.Length;
        int[] answer = new int[n];
        var stack = new Stack<int>();
        for (int i = 0; i < n; i++) {
            while (stack.Count > 0 && temperatures[stack.Peek()] < temperatures[i]) {
                int idx = stack.Pop();
                answer[idx] = i - idx;
            }
            stack.Push(i);
        }
        return answer;
    }

    static void Main() {
        Console.WriteLine(string.Join(", ", DailyTemperatures(new[]{73,74,75,71,69,72,76,73})));
    }
}`,
    },
  },

  {
    slug: "decode-string",
    title: "Decode String",
    category: "stack",
    difficulty: "medium",
    description:
      "Given an encoded string, return its decoded string.\n\nThe encoding rule is: `k[encoded_string]`, where the `encoded_string` inside the square brackets is being repeated exactly `k` times. Note that `k` is guaranteed to be a positive integer.\n\nYou may assume that the input string is always valid; there are no extra white spaces, square brackets are well-formed, etc.",
    examples: [
      { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
      { input: 's = "3[a2[c]]"', output: '"accaccacc"' },
      { input: 's = "2[abc]3[cd]ef"', output: '"abcabccdcdcdef"' },
    ],
    starter: {
      python: `def decode_string(s: str) -> str:
    stack = []
    current_str = ""
    current_num = 0
    for ch in s:
        if ch.isdigit():
            current_num = current_num * 10 + int(ch)
        elif ch == '[':
            stack.append((current_str, current_num))
            current_str, current_num = "", 0
        elif ch == ']':
            prev_str, num = stack.pop()
            current_str = prev_str + num * current_str
        else:
            current_str += ch
    return current_str

if __name__ == "__main__":
    print(decode_string("3[a]2[bc]"))   # aaabcbc
    print(decode_string("3[a2[c]]"))    # accaccacc
`,
      javascript: `/**
 * @param {string} s
 * @return {string}
 */
function decodeString(s) {
    const stack = [];
    let currentStr = '', currentNum = 0;
    for (const ch of s) {
        if (ch >= '0' && ch <= '9') {
            currentNum = currentNum * 10 + parseInt(ch);
        } else if (ch === '[') {
            stack.push([currentStr, currentNum]);
            currentStr = ''; currentNum = 0;
        } else if (ch === ']') {
            const [prevStr, num] = stack.pop();
            currentStr = prevStr + currentStr.repeat(num);
        } else {
            currentStr += ch;
        }
    }
    return currentStr;
}

console.log(decodeString("3[a]2[bc]"));   // aaabcbc
console.log(decodeString("3[a2[c]]"));    // accaccacc
`,
      go: `package main

import (
\t"fmt"
\t"strings"
)

func decodeString(s string) string {
\ttype frame struct{ str string; num int }
\tstack := []frame{}
\tcurrent := ""
\tnum := 0
\tfor _, ch := range s {
\t\tswitch {
\t\tcase ch >= '0' && ch <= '9':
\t\t\tnum = num*10 + int(ch-'0')
\t\tcase ch == '[':
\t\t\tstack = append(stack, frame{current, num})
\t\t\tcurrent, num = "", 0
\t\tcase ch == ']':
\t\t\tf := stack[len(stack)-1]; stack = stack[:len(stack)-1]
\t\t\tcurrent = f.str + strings.Repeat(current, f.num)
\t\tdefault:
\t\t\tcurrent += string(ch)
\t\t}
\t}
\treturn current
}

func main() {
\tfmt.Println(decodeString("3[a]2[bc]"))   // aaabcbc
\tfmt.Println(decodeString("3[a2[c]]"))    // accaccacc
}`,
      java: `import java.util.*;

public class Main {
    public static String decodeString(String s) {
        Deque<String> strStack = new ArrayDeque<>();
        Deque<Integer> numStack = new ArrayDeque<>();
        String current = "";
        int num = 0;
        for (char ch : s.toCharArray()) {
            if (Character.isDigit(ch)) {
                num = num * 10 + (ch - '0');
            } else if (ch == '[') {
                strStack.push(current); numStack.push(num);
                current = ""; num = 0;
            } else if (ch == ']') {
                String prev = strStack.pop(); int k = numStack.pop();
                current = prev + current.repeat(k);
            } else {
                current += ch;
            }
        }
        return current;
    }

    public static void main(String[] args) {
        System.out.println(decodeString("3[a]2[bc]"));   // aaabcbc
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

string decodeString(string s) {
    stack<pair<string,int>> st;
    string current = "";
    int num = 0;
    for (char ch : s) {
        if (isdigit(ch)) {
            num = num * 10 + (ch - '0');
        } else if (ch == '[') {
            st.push({current, num}); current = ""; num = 0;
        } else if (ch == ']') {
            auto [prev, k] = st.top(); st.pop();
            string rep = "";
            for (int i = 0; i < k; i++) rep += current;
            current = prev + rep;
        } else {
            current += ch;
        }
    }
    return current;
}

int main() {
    cout << decodeString("3[a]2[bc]") << endl;   // aaabcbc
}`,
      rust: `fn decode_string(s: &str) -> String {
    let mut stack: Vec<(String, usize)> = vec![];
    let mut current = String::new();
    let mut num = 0usize;
    for ch in s.chars() {
        match ch {
            '0'..='9' => num = num * 10 + ch as usize - '0' as usize,
            '[' => { stack.push((current.clone(), num)); current.clear(); num = 0; }
            ']' => {
                let (prev, k) = stack.pop().unwrap();
                current = prev + &current.repeat(k);
            }
            _ => current.push(ch),
        }
    }
    current
}

fn main() {
    println!("{}", decode_string("3[a]2[bc]"));   // aaabcbc
    println!("{}", decode_string("3[a2[c]]"));    // accaccacc
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Text;

class Program {
    static string DecodeString(string s) {
        var strStack = new Stack<string>();
        var numStack = new Stack<int>();
        string current = "";
        int num = 0;
        foreach (char ch in s) {
            if (char.IsDigit(ch)) {
                num = num * 10 + (ch - '0');
            } else if (ch == '[') {
                strStack.Push(current); numStack.Push(num);
                current = ""; num = 0;
            } else if (ch == ']') {
                string prev = strStack.Pop(); int k = numStack.Pop();
                var sb = new StringBuilder(prev);
                for (int i = 0; i < k; i++) sb.Append(current);
                current = sb.ToString();
            } else {
                current += ch;
            }
        }
        return current;
    }

    static void Main() {
        Console.WriteLine(DecodeString("3[a]2[bc]"));  // aaabcbc
    }
}`,
    },
  },

  // ── Backtracking ──────────────────────────────────────────────────────────

  {
    slug: "generate-parentheses",
    title: "Generate Parentheses",
    category: "backtracking",
    difficulty: "medium",
    description:
      "Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.\n\n**Approach:** Backtrack — add `(` if open count < n, add `)` if close count < open count.",
    examples: [
      { input: "n = 3", output: '["((()))","(()())","(())()","()(())","()()()"]' },
      { input: "n = 1", output: '["()"]' },
    ],
    starter: {
      python: `def generate_parenthesis(n: int) -> list[str]:
    result = []
    def backtrack(current: str, open_count: int, close_count: int):
        if len(current) == 2 * n:
            result.append(current)
            return
        if open_count < n:
            backtrack(current + "(", open_count + 1, close_count)
        if close_count < open_count:
            backtrack(current + ")", open_count, close_count + 1)
    backtrack("", 0, 0)
    return result

if __name__ == "__main__":
    print(generate_parenthesis(3))
    print(generate_parenthesis(1))
`,
      javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function generateParenthesis(n) {
    const result = [];
    function backtrack(current, open, close) {
        if (current.length === 2 * n) { result.push(current); return; }
        if (open < n) backtrack(current + '(', open + 1, close);
        if (close < open) backtrack(current + ')', open, close + 1);
    }
    backtrack('', 0, 0);
    return result;
}

console.log(generateParenthesis(3));
`,
      go: `package main

import "fmt"

func generateParenthesis(n int) []string {
\tresult := []string{}
\tvar backtrack func(current string, open, close int)
\tbacktrack = func(current string, open, close int) {
\t\tif len(current) == 2*n {
\t\t\tresult = append(result, current)
\t\t\treturn
\t\t}
\t\tif open < n  { backtrack(current+"(", open+1, close) }
\t\tif close < open { backtrack(current+")", open, close+1) }
\t}
\tbacktrack("", 0, 0)
\treturn result
}

func main() {
\tfmt.Println(generateParenthesis(3))
}`,
      java: `import java.util.*;

public class Main {
    static List<String> result;

    static void backtrack(String current, int open, int close, int n) {
        if (current.length() == 2 * n) { result.add(current); return; }
        if (open < n) backtrack(current + "(", open + 1, close, n);
        if (close < open) backtrack(current + ")", open, close + 1, n);
    }

    public static List<String> generateParenthesis(int n) {
        result = new ArrayList<>();
        backtrack("", 0, 0, n);
        return result;
    }

    public static void main(String[] args) {
        System.out.println(generateParenthesis(3));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> result;

void backtrack(string current, int open, int close, int n) {
    if ((int)current.size() == 2*n) { result.push_back(current); return; }
    if (open < n) backtrack(current+"(", open+1, close, n);
    if (close < open) backtrack(current+")", open, close+1, n);
}

vector<string> generateParenthesis(int n) {
    result.clear();
    backtrack("", 0, 0, n);
    return result;
}

int main() {
    for (auto& s : generateParenthesis(3)) cout << s << " ";
    cout << endl;
}`,
      rust: `fn generate_parenthesis(n: usize) -> Vec<String> {
    let mut result = vec![];
    fn backtrack(current: &mut String, open: usize, close: usize, n: usize, result: &mut Vec<String>) {
        if current.len() == 2 * n { result.push(current.clone()); return; }
        if open < n { current.push('('); backtrack(current, open+1, close, n, result); current.pop(); }
        if close < open { current.push(')'); backtrack(current, open, close+1, n, result); current.pop(); }
    }
    backtrack(&mut String::new(), 0, 0, n, &mut result);
    result
}

fn main() {
    println!("{:?}", generate_parenthesis(3));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static void Backtrack(List<string> result, string current, int open, int close, int n) {
        if (current.Length == 2 * n) { result.Add(current); return; }
        if (open < n) Backtrack(result, current + "(", open + 1, close, n);
        if (close < open) Backtrack(result, current + ")", open, close + 1, n);
    }

    static IList<string> GenerateParenthesis(int n) {
        var result = new List<string>();
        Backtrack(result, "", 0, 0, n);
        return result;
    }

    static void Main() {
        Console.WriteLine(string.Join(", ", GenerateParenthesis(3)));
    }
}`,
    },
  },

  {
    slug: "subsets",
    title: "Subsets",
    category: "backtracking",
    difficulty: "medium",
    description:
      "Given an integer array `nums` of **unique** elements, return all possible subsets (the power set).\n\nThe solution set **must not** contain duplicate subsets. Return the solution in **any order**.",
    examples: [
      { input: "nums = [1,2,3]", output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" },
      { input: "nums = [0]", output: "[[],[0]]" },
    ],
    starter: {
      python: `def subsets(nums: list[int]) -> list[list[int]]:
    result = []
    def backtrack(start: int, current: list[int]):
        result.append(list(current))
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()
    backtrack(0, [])
    return result

if __name__ == "__main__":
    print(subsets([1,2,3]))
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function subsets(nums) {
    const result = [];
    function backtrack(start, current) {
        result.push([...current]);
        for (let i = start; i < nums.length; i++) {
            current.push(nums[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }
    backtrack(0, []);
    return result;
}

console.log(subsets([1,2,3]));
`,
      go: `package main

import "fmt"

func subsets(nums []int) [][]int {
\tresult := [][]int{}
\tvar backtrack func(start int, current []int)
\tbacktrack = func(start int, current []int) {
\t\ttmp := make([]int, len(current))
\t\tcopy(tmp, current)
\t\tresult = append(result, tmp)
\t\tfor i := start; i < len(nums); i++ {
\t\t\tcurrent = append(current, nums[i])
\t\t\tbacktrack(i+1, current)
\t\t\tcurrent = current[:len(current)-1]
\t\t}
\t}
\tbacktrack(0, []int{})
\treturn result
}

func main() {
\tfmt.Println(subsets([]int{1,2,3}))
}`,
      java: `import java.util.*;

public class Main {
    public static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current));
        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);
            backtrack(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        System.out.println(subsets(new int[]{1,2,3}));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void backtrack(vector<int>& nums, int start, vector<int>& current, vector<vector<int>>& result) {
    result.push_back(current);
    for (int i = start; i < (int)nums.size(); i++) {
        current.push_back(nums[i]);
        backtrack(nums, i+1, current, result);
        current.pop_back();
    }
}

vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;
    backtrack(nums, 0, current, result);
    return result;
}

int main() {
    vector<int> nums = {1,2,3};
    auto res = subsets(nums);
    for (auto& s : res) { for (int v : s) cout << v << " "; cout << endl; }
}`,
      rust: `fn subsets(nums: Vec<i32>) -> Vec<Vec<i32>> {
    let mut result = vec![];
    fn backtrack(nums: &[i32], start: usize, current: &mut Vec<i32>, result: &mut Vec<Vec<i32>>) {
        result.push(current.clone());
        for i in start..nums.len() {
            current.push(nums[i]);
            backtrack(nums, i + 1, current, result);
            current.pop();
        }
    }
    backtrack(&nums, 0, &mut vec![], &mut result);
    result
}

fn main() {
    println!("{:?}", subsets(vec![1,2,3]));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static void Backtrack(int[] nums, int start, List<int> current, List<IList<int>> result) {
        result.Add(new List<int>(current));
        for (int i = start; i < nums.Length; i++) {
            current.Add(nums[i]);
            Backtrack(nums, i + 1, current, result);
            current.RemoveAt(current.Count - 1);
        }
    }

    static IList<IList<int>> Subsets(int[] nums) {
        var result = new List<IList<int>>();
        Backtrack(nums, 0, new List<int>(), result);
        return result;
    }

    static void Main() {
        foreach (var s in Subsets(new[]{1,2,3}))
            Console.WriteLine("[" + string.Join(",", s) + "]");
    }
}`,
    },
  },

  // ── Array ─────────────────────────────────────────────────────────────────

  {
    slug: "next-permutation",
    title: "Next Permutation",
    category: "array",
    difficulty: "medium",
    description:
      "A permutation of an array of integers is an arrangement of its members into a sequence or linear order.\n\nGiven an array of integers `nums`, find the **next permutation** (lexicographically next greater arrangement). If no such arrangement is possible, rearrange it to the lowest possible order (ascending).\n\n**Algorithm:**\n1. Find largest index `i` where `nums[i] < nums[i+1]`.\n2. Find largest index `j > i` where `nums[j] > nums[i]`.\n3. Swap `nums[i]` and `nums[j]`.\n4. Reverse the suffix starting at `nums[i+1]`.\n\nThe replacement must be **in place** with only constant extra memory.",
    examples: [
      { input: "nums = [1,2,3]", output: "[1,3,2]" },
      { input: "nums = [3,2,1]", output: "[1,2,3]" },
      { input: "nums = [1,1,5]", output: "[1,5,1]" },
    ],
    starter: {
      python: `def next_permutation(nums: list[int]) -> None:
    n = len(nums)
    # Step 1: find the largest i where nums[i] < nums[i+1]
    i = n - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    if i >= 0:
        # Step 2: find largest j > i where nums[j] > nums[i]
        j = n - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    # Step 3: reverse suffix starting at i+1
    nums[i+1:] = nums[i+1:][::-1]

if __name__ == "__main__":
    a = [1,2,3]; next_permutation(a); print(a)   # [1,3,2]
    b = [3,2,1]; next_permutation(b); print(b)   # [1,2,3]
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {void}
 */
function nextPermutation(nums) {
    const n = nums.length;
    let i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;
    if (i >= 0) {
        let j = n - 1;
        while (nums[j] <= nums[i]) j--;
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    // Reverse from i+1 to end
    let lo = i + 1, hi = n - 1;
    while (lo < hi) { [nums[lo++], nums[hi--]] = [nums[hi], nums[lo-1]]; }
}

const a = [1,2,3]; nextPermutation(a); console.log(a);  // [1,3,2]
`,
      go: `package main

import "fmt"

func nextPermutation(nums []int) {
\tn := len(nums)
\ti := n - 2
\tfor i >= 0 && nums[i] >= nums[i+1] {
\t\ti--
\t}
\tif i >= 0 {
\t\tj := n - 1
\t\tfor nums[j] <= nums[i] {
\t\t\tj--
\t\t}
\t\tnums[i], nums[j] = nums[j], nums[i]
\t}
\tfor lo, hi := i+1, n-1; lo < hi; lo, hi = lo+1, hi-1 {
\t\tnums[lo], nums[hi] = nums[hi], nums[lo]
\t}
}

func main() {
\ta := []int{1,2,3}; nextPermutation(a); fmt.Println(a)  // [1 3 2]
\tb := []int{3,2,1}; nextPermutation(b); fmt.Println(b)  // [1 2 3]
}`,
      java: `import java.util.Arrays;

public class Main {
    public static void nextPermutation(int[] nums) {
        int n = nums.length, i = n - 2;
        while (i >= 0 && nums[i] >= nums[i+1]) i--;
        if (i >= 0) {
            int j = n - 1;
            while (nums[j] <= nums[i]) j--;
            int tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;
        }
        for (int lo = i+1, hi = n-1; lo < hi; lo++, hi--) {
            int tmp = nums[lo]; nums[lo] = nums[hi]; nums[hi] = tmp;
        }
    }

    public static void main(String[] args) {
        int[] a = {1,2,3}; nextPermutation(a); System.out.println(Arrays.toString(a));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void nextPermutation(vector<int>& nums) {
    int n = nums.size(), i = n - 2;
    while (i >= 0 && nums[i] >= nums[i+1]) i--;
    if (i >= 0) {
        int j = n - 1;
        while (nums[j] <= nums[i]) j--;
        swap(nums[i], nums[j]);
    }
    reverse(nums.begin() + i + 1, nums.end());
}

int main() {
    vector<int> a = {1,2,3}; nextPermutation(a);
    for (int v : a) cout << v << " "; cout << endl;  // 1 3 2
}`,
      rust: `fn next_permutation(nums: &mut Vec<i32>) {
    let n = nums.len();
    let mut i = n.wrapping_sub(2);
    while i < n && nums[i] >= nums[i + 1] { i = i.wrapping_sub(1); }
    if i < n {
        let mut j = n - 1;
        while nums[j] <= nums[i] { j -= 1; }
        nums.swap(i, j);
    }
    let start = if i < n { i + 1 } else { 0 };
    nums[start..].reverse();
}

fn main() {
    let mut a = vec![1,2,3]; next_permutation(&mut a); println!("{:?}", a);  // [1,3,2]
}`,
      csharp: `using System;

class Program {
    static void NextPermutation(int[] nums) {
        int n = nums.Length, i = n - 2;
        while (i >= 0 && nums[i] >= nums[i+1]) i--;
        if (i >= 0) {
            int j = n - 1;
            while (nums[j] <= nums[i]) j--;
            (nums[i], nums[j]) = (nums[j], nums[i]);
        }
        Array.Reverse(nums, i + 1, n - i - 1);
    }

    static void Main() {
        int[] a = {1,2,3}; NextPermutation(a); Console.WriteLine(string.Join(", ", a));
    }
}`,
    },
  },

  // ── Dynamic Programming ───────────────────────────────────────────────────

  {
    slug: "minimum-path-sum",
    title: "Minimum Path Sum",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "Given a `m x n` grid filled with non-negative numbers, find a path from the top-left to the bottom-right, which minimizes the sum of all numbers along its path.\n\n**Note:** You can only move either down or right at any point in time.",
    examples: [
      { input: "grid = [[1,3,1],[1,5,1],[4,2,1]]", output: "7", explanation: "Path: 1 → 3 → 1 → 1 → 1" },
      { input: "grid = [[1,2,3],[4,5,6]]", output: "12" },
    ],
    starter: {
      python: `def min_path_sum(grid: list[list[int]]) -> int:
    m, n = len(grid), len(grid[0])
    dp = grid  # modify in place
    # Initialize first row and first column
    for j in range(1, n): dp[0][j] += dp[0][j-1]
    for i in range(1, m): dp[i][0] += dp[i-1][0]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] += min(dp[i-1][j], dp[i][j-1])
    return dp[m-1][n-1]

if __name__ == "__main__":
    print(min_path_sum([[1,3,1],[1,5,1],[4,2,1]]))  # 7
    print(min_path_sum([[1,2,3],[4,5,6]]))           # 12
`,
      javascript: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function minPathSum(grid) {
    const m = grid.length, n = grid[0].length;
    for (let j = 1; j < n; j++) grid[0][j] += grid[0][j-1];
    for (let i = 1; i < m; i++) grid[i][0] += grid[i-1][0];
    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            grid[i][j] += Math.min(grid[i-1][j], grid[i][j-1]);
    return grid[m-1][n-1];
}

console.log(minPathSum([[1,3,1],[1,5,1],[4,2,1]]));  // 7
`,
      go: `package main

import "fmt"

func minPathSum(grid [][]int) int {
\tm, n := len(grid), len(grid[0])
\tfor j := 1; j < n; j++ { grid[0][j] += grid[0][j-1] }
\tfor i := 1; i < m; i++ { grid[i][0] += grid[i-1][0] }
\tfor i := 1; i < m; i++ {
\t\tfor j := 1; j < n; j++ {
\t\t\tif grid[i-1][j] < grid[i][j-1] { grid[i][j] += grid[i-1][j] } else { grid[i][j] += grid[i][j-1] }
\t\t}
\t}
\treturn grid[m-1][n-1]
}

func main() {
\tfmt.Println(minPathSum([][]int{{1,3,1},{1,5,1},{4,2,1}}))  // 7
}`,
      java: `public class Main {
    public static int minPathSum(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        for (int j = 1; j < n; j++) grid[0][j] += grid[0][j-1];
        for (int i = 1; i < m; i++) grid[i][0] += grid[i-1][0];
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                grid[i][j] += Math.min(grid[i-1][j], grid[i][j-1]);
        return grid[m-1][n-1];
    }

    public static void main(String[] args) {
        System.out.println(minPathSum(new int[][]{{1,3,1},{1,5,1},{4,2,1}}));  // 7
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    for (int j = 1; j < n; j++) grid[0][j] += grid[0][j-1];
    for (int i = 1; i < m; i++) grid[i][0] += grid[i-1][0];
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            grid[i][j] += min(grid[i-1][j], grid[i][j-1]);
    return grid[m-1][n-1];
}

int main() {
    vector<vector<int>> g = {{1,3,1},{1,5,1},{4,2,1}};
    cout << minPathSum(g) << endl;  // 7
}`,
      rust: `fn min_path_sum(mut grid: Vec<Vec<i32>>) -> i32 {
    let (m, n) = (grid.len(), grid[0].len());
    for j in 1..n { grid[0][j] += grid[0][j-1]; }
    for i in 1..m { grid[i][0] += grid[i-1][0]; }
    for i in 1..m {
        for j in 1..n {
            grid[i][j] += grid[i-1][j].min(grid[i][j-1]);
        }
    }
    grid[m-1][n-1]
}

fn main() {
    println!("{}", min_path_sum(vec![vec![1,3,1],vec![1,5,1],vec![4,2,1]]));  // 7
}`,
      csharp: `using System;

class Program {
    static int MinPathSum(int[][] grid) {
        int m = grid.Length, n = grid[0].Length;
        for (int j = 1; j < n; j++) grid[0][j] += grid[0][j-1];
        for (int i = 1; i < m; i++) grid[i][0] += grid[i-1][0];
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                grid[i][j] += Math.Min(grid[i-1][j], grid[i][j-1]);
        return grid[m-1][n-1];
    }

    static void Main() {
        Console.WriteLine(MinPathSum(new[]{new[]{1,3,1},new[]{1,5,1},new[]{4,2,1}}));  // 7
    }
}`,
    },
  },

  {
    slug: "partition-equal-subset",
    title: "Partition Equal Subset Sum",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "Given an integer array `nums`, return `true` if you can partition the array into two subsets such that the sum of the elements in both subsets is equal, or `false` otherwise.\n\n**Key insight:** We need to find a subset with sum equal to `total / 2`. Use 0/1 knapsack DP.",
    examples: [
      { input: "nums = [1,5,11,5]", output: "true", explanation: "Can partition into [1, 5, 5] and [11]." },
      { input: "nums = [1,2,3,5]", output: "false" },
    ],
    starter: {
      python: `def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    dp = {0}
    for num in nums:
        dp = dp | {s + num for s in dp}
    return target in dp

if __name__ == "__main__":
    print(can_partition([1,5,11,5]))   # True
    print(can_partition([1,2,3,5]))    # False
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function canPartition(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % 2 !== 0) return false;
    const target = total / 2;
    const dp = new Array(target + 1).fill(false);
    dp[0] = true;
    for (const num of nums)
        for (let j = target; j >= num; j--)
            dp[j] = dp[j] || dp[j - num];
    return dp[target];
}

console.log(canPartition([1,5,11,5]));  // true
console.log(canPartition([1,2,3,5]));   // false
`,
      go: `package main

import "fmt"

func canPartition(nums []int) bool {
\ttotal := 0
\tfor _, n := range nums { total += n }
\tif total%2 != 0 { return false }
\ttarget := total / 2
\tdp := make([]bool, target+1)
\tdp[0] = true
\tfor _, num := range nums {
\t\tfor j := target; j >= num; j-- {
\t\t\tdp[j] = dp[j] || dp[j-num]
\t\t}
\t}
\treturn dp[target]
}

func main() {
\tfmt.Println(canPartition([]int{1,5,11,5}))  // true
\tfmt.Println(canPartition([]int{1,2,3,5}))   // false
}`,
      java: `public class Main {
    public static boolean canPartition(int[] nums) {
        int total = 0;
        for (int n : nums) total += n;
        if (total % 2 != 0) return false;
        int target = total / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;
        for (int num : nums)
            for (int j = target; j >= num; j--)
                dp[j] = dp[j] || dp[j - num];
        return dp[target];
    }

    public static void main(String[] args) {
        System.out.println(canPartition(new int[]{1,5,11,5}));  // true
        System.out.println(canPartition(new int[]{1,2,3,5}));   // false
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2 != 0) return false;
    int target = total / 2;
    vector<bool> dp(target + 1, false);
    dp[0] = true;
    for (int num : nums)
        for (int j = target; j >= num; j--)
            dp[j] = dp[j] || dp[j - num];
    return dp[target];
}

int main() {
    vector<int> a = {1,5,11,5};
    cout << canPartition(a) << endl;  // 1
}`,
      rust: `fn can_partition(nums: Vec<i32>) -> bool {
    let total: i32 = nums.iter().sum();
    if total % 2 != 0 { return false; }
    let target = (total / 2) as usize;
    let mut dp = vec![false; target + 1];
    dp[0] = true;
    for &num in &nums {
        for j in (num as usize..=target).rev() {
            dp[j] = dp[j] || dp[j - num as usize];
        }
    }
    dp[target]
}

fn main() {
    println!("{}", can_partition(vec![1,5,11,5]));  // true
    println!("{}", can_partition(vec![1,2,3,5]));   // false
}`,
      csharp: `using System;

class Program {
    static bool CanPartition(int[] nums) {
        int total = 0;
        foreach (int n in nums) total += n;
        if (total % 2 != 0) return false;
        int target = total / 2;
        bool[] dp = new bool[target + 1];
        dp[0] = true;
        foreach (int num in nums)
            for (int j = target; j >= num; j--)
                dp[j] = dp[j] || dp[j - num];
        return dp[target];
    }

    static void Main() {
        Console.WriteLine(CanPartition(new[]{1,5,11,5}));  // True
        Console.WriteLine(CanPartition(new[]{1,2,3,5}));   // False
    }
}`,
    },
  },

  {
    slug: "find-first-last-position",
    title: "Find First and Last Position in Sorted Array",
    category: "binary-search",
    difficulty: "medium",
    description:
      "Given an array of integers `nums` sorted in non-decreasing order, find the starting and ending position of a given `target` value.\n\nIf `target` is not found in the array, return `[-1, -1]`.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: "nums = [5,7,7,8,8,10], target = 8", output: "[3,4]" },
      { input: "nums = [5,7,7,8,8,10], target = 6", output: "[-1,-1]" },
      { input: "nums = [], target = 0", output: "[-1,-1]" },
    ],
    starter: {
      python: `def search_range(nums: list[int], target: int) -> list[int]:
    def find_bound(is_left: bool) -> int:
        lo, hi, bound = 0, len(nums) - 1, -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                bound = mid
                if is_left: hi = mid - 1
                else: lo = mid + 1
            elif nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return bound
    return [find_bound(True), find_bound(False)]

if __name__ == "__main__":
    print(search_range([5,7,7,8,8,10], 8))  # [3, 4]
    print(search_range([5,7,7,8,8,10], 6))  # [-1, -1]
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function searchRange(nums, target) {
    function findBound(isLeft) {
        let lo = 0, hi = nums.length - 1, bound = -1;
        while (lo <= hi) {
            const mid = lo + hi >> 1;
            if (nums[mid] === target) {
                bound = mid;
                if (isLeft) hi = mid - 1;
                else lo = mid + 1;
            } else if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return bound;
    }
    return [findBound(true), findBound(false)];
}

console.log(searchRange([5,7,7,8,8,10], 8));  // [3, 4]
console.log(searchRange([5,7,7,8,8,10], 6));  // [-1, -1]
`,
      go: `package main

import "fmt"

func searchRange(nums []int, target int) []int {
\tfindBound := func(isLeft bool) int {
\t\tlo, hi, bound := 0, len(nums)-1, -1
\t\tfor lo <= hi {
\t\t\tmid := (lo + hi) / 2
\t\t\tif nums[mid] == target {
\t\t\t\tbound = mid
\t\t\t\tif isLeft { hi = mid - 1 } else { lo = mid + 1 }
\t\t\t} else if nums[mid] < target { lo = mid + 1 } else { hi = mid - 1 }
\t\t}
\t\treturn bound
\t}
\treturn []int{findBound(true), findBound(false)}
}

func main() {
\tfmt.Println(searchRange([]int{5,7,7,8,8,10}, 8))  // [3 4]
}`,
      java: `public class Main {
    static int findBound(int[] nums, int target, boolean isLeft) {
        int lo = 0, hi = nums.length - 1, bound = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (nums[mid] == target) { bound = mid; if (isLeft) hi = mid-1; else lo = mid+1; }
            else if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return bound;
    }

    public static int[] searchRange(int[] nums, int target) {
        return new int[]{ findBound(nums, target, true), findBound(nums, target, false) };
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.toString(searchRange(new int[]{5,7,7,8,8,10}, 8)));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int findBound(vector<int>& nums, int target, bool isLeft) {
    int lo = 0, hi = (int)nums.size()-1, bound = -1;
    while (lo <= hi) {
        int mid = (lo+hi)/2;
        if (nums[mid] == target) { bound = mid; if (isLeft) hi = mid-1; else lo = mid+1; }
        else if (nums[mid] < target) lo = mid+1;
        else hi = mid-1;
    }
    return bound;
}

vector<int> searchRange(vector<int>& nums, int target) {
    return { findBound(nums,target,true), findBound(nums,target,false) };
}

int main() {
    vector<int> nums = {5,7,7,8,8,10};
    auto res = searchRange(nums, 8);
    cout << "[" << res[0] << "," << res[1] << "]" << endl;  // [3,4]
}`,
      rust: `fn find_bound(nums: &[i32], target: i32, is_left: bool) -> i32 {
    let (mut lo, mut hi, mut bound) = (0i32, nums.len() as i32 - 1, -1i32);
    while lo <= hi {
        let mid = (lo + hi) / 2;
        if nums[mid as usize] == target {
            bound = mid;
            if is_left { hi = mid - 1; } else { lo = mid + 1; }
        } else if nums[mid as usize] < target { lo = mid + 1; }
        else { hi = mid - 1; }
    }
    bound
}

fn search_range(nums: Vec<i32>, target: i32) -> Vec<i32> {
    vec![find_bound(&nums, target, true), find_bound(&nums, target, false)]
}

fn main() {
    println!("{:?}", search_range(vec![5,7,7,8,8,10], 8));  // [3, 4]
}`,
      csharp: `using System;

class Program {
    static int FindBound(int[] nums, int target, bool isLeft) {
        int lo = 0, hi = nums.Length - 1, bound = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (nums[mid] == target) { bound = mid; if (isLeft) hi = mid-1; else lo = mid+1; }
            else if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return bound;
    }

    static int[] SearchRange(int[] nums, int target) =>
        new[] { FindBound(nums, target, true), FindBound(nums, target, false) };

    static void Main() {
        Console.WriteLine(string.Join(", ", SearchRange(new[]{5,7,7,8,8,10}, 8)));  // 3, 4
    }
}`,
    },
  },
];
