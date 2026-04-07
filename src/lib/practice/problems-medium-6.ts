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
    testCases: [
      { stdin: "1 2 3 null 5 null 4", expectedOutput: "1 3 4" },
      { stdin: "1 null 3", expectedOutput: "1 3" },
      { stdin: "1 2 3 4 null null 5", expectedOutput: "1 3 5" },
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
type TreeNode struct { Val int; Left, Right *TreeNode }
func buildTree(vals []string) *TreeNode {
\tif len(vals) == 0 || vals[0] == "null" { return nil }
\troot := &TreeNode{}
\troot.Val, _ = strconv.Atoi(vals[0])
\tqueue := []*TreeNode{root}
\ti := 1
\tfor len(queue) > 0 && i < len(vals) {
\t\tnode := queue[0]; queue = queue[1:]
\t\tif i < len(vals) && vals[i] != "null" { node.Left = &TreeNode{}; node.Left.Val, _ = strconv.Atoi(vals[i]); queue = append(queue, node.Left) }; i++
\t\tif i < len(vals) && vals[i] != "null" { node.Right = &TreeNode{}; node.Right.Val, _ = strconv.Atoi(vals[i]); queue = append(queue, node.Right) }; i++
\t}
\treturn root
}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text()
\t\tif line == "" { continue }
\t\tvals := strings.Fields(line)
\t\troot := buildTree(vals)
\t\tres := rightSideView(root)
\t\tstrs := make([]string, len(res))
\t\tfor i, v := range res { strs[i] = strconv.Itoa(v) }
\t\tfmt.Println(strings.Join(strs, " "))
\t}
}`,
      python: `import sys
from collections import deque
{{SOLUTION}}
def build_tree(vals):
    if not vals or vals[0] == "null": return None
    root = TreeNode(int(vals[0]))
    queue = deque([root]); i = 1
    while queue and i < len(vals):
        node = queue.popleft()
        if i < len(vals) and vals[i] != "null":
            node.left = TreeNode(int(vals[i])); queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] != "null":
            node.right = TreeNode(int(vals[i])); queue.append(node.right)
        i += 1
    return root
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    root = build_tree(line.split())
    print(" ".join(str(v) for v in right_side_view(root)))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
class TreeNode { constructor(val, left=null, right=null){this.val=val;this.left=left;this.right=right;} }
function buildTree(vals) {
  if (!vals.length || vals[0]==="null") return null;
  const root = new TreeNode(parseInt(vals[0]));
  const queue = [root]; let i = 1;
  while (queue.length && i < vals.length) {
    const node = queue.shift();
    if (i < vals.length && vals[i]!=="null") { node.left=new TreeNode(parseInt(vals[i])); queue.push(node.left); } i++;
    if (i < vals.length && vals[i]!=="null") { node.right=new TreeNode(parseInt(vals[i])); queue.push(node.right); } i++;
  }
  return root;
}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const root = buildTree(line.split(/\s+/));
  console.log(rightSideView(root).join(" "));
}
`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  static class TreeNode { int val; TreeNode left, right; TreeNode(int v){val=v;} }
  static TreeNode buildTree(String[] vals) {
    if (vals.length==0||vals[0].equals("null")) return null;
    TreeNode root=new TreeNode(Integer.parseInt(vals[0]));
    Queue<TreeNode> q=new LinkedList<>(); q.offer(root); int i=1;
    while(!q.isEmpty()&&i<vals.length){
      TreeNode nd=q.poll();
      if(i<vals.length&&!vals[i].equals("null")){nd.left=new TreeNode(Integer.parseInt(vals[i]));q.offer(nd.left);}i++;
      if(i<vals.length&&!vals[i].equals("null")){nd.right=new TreeNode(Integer.parseInt(vals[i]));q.offer(nd.right);}i++;
    }
    return root;
  }
  public static void main(String[] args) throws Exception {
    BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
    String line;
    while((line=br.readLine())!=null){
      line=line.trim(); if(line.isEmpty()) continue;
      TreeNode root=buildTree(line.split("\\\\s+"));
      List<Integer> res=rightSideView(root);
      StringBuilder sb=new StringBuilder();
      for(int i=0;i<res.size();i++){if(i>0)sb.append(' ');sb.append(res.get(i));}
      System.out.println(sb);
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
struct TreeNode { int val; TreeNode *left,*right; TreeNode(int v):val(v),left(nullptr),right(nullptr){} };
TreeNode* buildTree(vector<string>& vals) {
  if(vals.empty()||vals[0]=="null") return nullptr;
  TreeNode* root=new TreeNode(stoi(vals[0]));
  queue<TreeNode*> q; q.push(root); int i=1;
  while(!q.empty()&&i<(int)vals.size()){
    TreeNode* nd=q.front();q.pop();
    if(i<(int)vals.size()&&vals[i]!="null"){nd->left=new TreeNode(stoi(vals[i]));q.push(nd->left);}i++;
    if(i<(int)vals.size()&&vals[i]!="null"){nd->right=new TreeNode(stoi(vals[i]));q.push(nd->right);}i++;
  }
  return root;
}
int main(){
  ios::sync_with_stdio(false);cin.tie(nullptr);
  string line;
  while(getline(cin,line)){
    if(line.empty()) continue;
    istringstream iss(line); vector<string> vals; string tok;
    while(iss>>tok) vals.push_back(tok);
    TreeNode* root=buildTree(vals);
    vector<int> res=rightSideView(root);
    for(int i=0;i<(int)res.size();i++){if(i)cout<<' ';cout<<res[i];}cout<<"\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
use std::collections::VecDeque;
use std::rc::Rc;
use std::cell::RefCell;
{{SOLUTION}}
type Node=Option<Rc<RefCell<TreeNode>>>;
struct TreeNode{val:i32,left:Node,right:Node}
fn build(vals:&[&str])->Node{
  if vals.is_empty()||vals[0]=="null"{return None;}
  let root=Rc::new(RefCell::new(TreeNode{val:vals[0].parse().unwrap(),left:None,right:None}));
  let mut q:VecDeque<Rc<RefCell<TreeNode>>>=VecDeque::new();
  q.push_back(root.clone()); let mut i=1;
  while let Some(nd)=q.pop_front(){
    if i<vals.len()&&vals[i]!="null"{let c=Rc::new(RefCell::new(TreeNode{val:vals[i].parse().unwrap(),left:None,right:None}));nd.borrow_mut().left=Some(c.clone());q.push_back(c);}i+=1;
    if i<vals.len()&&vals[i]!="null"{let c=Rc::new(RefCell::new(TreeNode{val:vals[i].parse().unwrap(),left:None,right:None}));nd.borrow_mut().right=Some(c.clone());q.push_back(c);}i+=1;
  }
  Some(root)
}
fn main(){
  let stdin=io::stdin();
  for line in stdin.lock().lines(){
    let line=line.unwrap(); let line=line.trim();
    if line.is_empty(){continue;}
    let vals:Vec<&str>=line.split_whitespace().collect();
    let root=build(&vals);
    let res=right_side_view(root);
    println!("{}",res.iter().map(|v|v.to_string()).collect::<Vec<_>>().join(" "));
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
    // stdin: "tree_bfs|p|q"  e.g. "6 2 8 0 4 7 9|2|8"
    testCases: [
      { stdin: "6 2 8 0 4 7 9|2|8", expectedOutput: "6" },
      { stdin: "6 2 8 0 4 7 9|2|4", expectedOutput: "2" },
      { stdin: "6 2 8 0 4 7 9|8|9", expectedOutput: "8" },
      { stdin: "6 2 8 0 4 7 9|0|5", expectedOutput: "2" },
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
type TreeNode struct { Val int; Left, Right *TreeNode }
func buildBST(vals []string) *TreeNode {
\tif len(vals)==0||vals[0]=="null"{return nil}
\troot:=&TreeNode{}; root.Val,_=strconv.Atoi(vals[0])
\tqueue:=[]*TreeNode{root}; i:=1
\tfor len(queue)>0&&i<len(vals){
\t\tnode:=queue[0];queue=queue[1:]
\t\tif i<len(vals)&&vals[i]!="null"{node.Left=&TreeNode{};node.Left.Val,_=strconv.Atoi(vals[i]);queue=append(queue,node.Left)};i++
\t\tif i<len(vals)&&vals[i]!="null"{node.Right=&TreeNode{};node.Right.Val,_=strconv.Atoi(vals[i]);queue=append(queue,node.Right)};i++
\t}
\treturn root
}
func findNode(root *TreeNode, val int) *TreeNode {
\tfor root!=nil{if val==root.Val{return root}else if val<root.Val{root=root.Left}else{root=root.Right}};return nil
}
func main() {
\tscanner:=bufio.NewScanner(os.Stdin)
\tfor scanner.Scan(){
\t\tline:=scanner.Text(); if line==""{continue}
\t\tparts:=strings.Split(line,"|")
\t\troot:=buildBST(strings.Fields(parts[0]))
\t\tpVal,_:=strconv.Atoi(strings.TrimSpace(parts[1]))
\t\tqVal,_:=strconv.Atoi(strings.TrimSpace(parts[2]))
\t\tp:=findNode(root,pVal); q:=findNode(root,qVal)
\t\tfmt.Println(lowestCommonAncestor(root,p,q).Val)
\t}
}`,
      python: `import sys
from collections import deque
{{SOLUTION}}
def build_bst(vals):
    if not vals or vals[0]=="null": return None
    root=TreeNode(int(vals[0])); queue=deque([root]); i=1
    while queue and i<len(vals):
        node=queue.popleft()
        if i<len(vals) and vals[i]!="null": node.left=TreeNode(int(vals[i])); queue.append(node.left)
        i+=1
        if i<len(vals) and vals[i]!="null": node.right=TreeNode(int(vals[i])); queue.append(node.right)
        i+=1
    return root
def find_node(root, val):
    while root:
        if val==root.val: return root
        elif val<root.val: root=root.left
        else: root=root.right
    return None
for line in sys.stdin:
    line=line.strip()
    if not line: continue
    parts=line.split("|")
    root=build_bst(parts[0].split())
    p=find_node(root,int(parts[1])); q=find_node(root,int(parts[2]))
    print(lowest_common_ancestor(root,p,q).val)
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
class TreeNode{constructor(val,left=null,right=null){this.val=val;this.left=left;this.right=right;}}
function buildBST(vals){
  if(!vals.length||vals[0]==="null")return null;
  const root=new TreeNode(parseInt(vals[0]));const queue=[root];let i=1;
  while(queue.length&&i<vals.length){
    const nd=queue.shift();
    if(i<vals.length&&vals[i]!=="null"){nd.left=new TreeNode(parseInt(vals[i]));queue.push(nd.left);}i++;
    if(i<vals.length&&vals[i]!=="null"){nd.right=new TreeNode(parseInt(vals[i]));queue.push(nd.right);}i++;
  }
  return root;
}
function findNode(root,val){while(root){if(val===root.val)return root;else if(val<root.val)root=root.left;else root=root.right;}return null;}
const lines=fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for(const raw of lines){
  const line=raw.trim();if(!line)continue;
  const parts=line.split("|");
  const root=buildBST(parts[0].trim().split(/\s+/));
  const p=findNode(root,parseInt(parts[1]));const q=findNode(root,parseInt(parts[2]));
  console.log(lowestCommonAncestor(root,p,q).val);
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  static class TreeNode{int val;TreeNode left,right;TreeNode(int v){val=v;}}
  static TreeNode buildBST(String[] vals){
    if(vals.length==0||vals[0].equals("null"))return null;
    TreeNode root=new TreeNode(Integer.parseInt(vals[0]));Queue<TreeNode> q=new LinkedList<>();q.offer(root);int i=1;
    while(!q.isEmpty()&&i<vals.length){TreeNode nd=q.poll();
      if(i<vals.length&&!vals[i].equals("null")){nd.left=new TreeNode(Integer.parseInt(vals[i]));q.offer(nd.left);}i++;
      if(i<vals.length&&!vals[i].equals("null")){nd.right=new TreeNode(Integer.parseInt(vals[i]));q.offer(nd.right);}i++;
    }return root;
  }
  static TreeNode findNode(TreeNode root,int val){while(root!=null){if(val==root.val)return root;else if(val<root.val)root=root.left;else root=root.right;}return null;}
  public static void main(String[] args) throws Exception {
    BufferedReader br=new BufferedReader(new InputStreamReader(System.in));String line;
    while((line=br.readLine())!=null){line=line.trim();if(line.isEmpty())continue;
      String[] parts=line.split("\\\\|");
      TreeNode root=buildBST(parts[0].trim().split("\\\\s+"));
      TreeNode p=findNode(root,Integer.parseInt(parts[1].trim()));
      TreeNode q=findNode(root,Integer.parseInt(parts[2].trim()));
      System.out.println(lowestCommonAncestor(root,p,q).val);
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
struct TreeNode{int val;TreeNode*left,*right;TreeNode(int v):val(v),left(nullptr),right(nullptr){}};
TreeNode* buildBST(vector<string>& vals){
  if(vals.empty()||vals[0]=="null")return nullptr;
  TreeNode* root=new TreeNode(stoi(vals[0]));queue<TreeNode*>q;q.push(root);int i=1;
  while(!q.empty()&&i<(int)vals.size()){TreeNode* nd=q.front();q.pop();
    if(i<(int)vals.size()&&vals[i]!="null"){nd->left=new TreeNode(stoi(vals[i]));q.push(nd->left);}i++;
    if(i<(int)vals.size()&&vals[i]!="null"){nd->right=new TreeNode(stoi(vals[i]));q.push(nd->right);}i++;
  }return root;
}
TreeNode* findNode(TreeNode* root,int val){while(root){if(val==root->val)return root;else if(val<root->val)root=root->left;else root=root->right;}return nullptr;}
int main(){ios::sync_with_stdio(false);cin.tie(nullptr);string line;
  while(getline(cin,line)){if(line.empty())continue;
    auto p1=line.find('|'),p2=line.find('|',p1+1);
    string treeStr=line.substr(0,p1);int pv=stoi(line.substr(p1+1,p2-p1-1)),qv=stoi(line.substr(p2+1));
    istringstream iss(treeStr);vector<string> vals;string tok;while(iss>>tok)vals.push_back(tok);
    TreeNode* root=buildBST(vals);
    TreeNode* p=findNode(root,pv);TreeNode* q=findNode(root,qv);
    cout<<lowestCommonAncestor(root,p,q)->val<<"\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
struct TreeNode{val:i32,left:Option<Box<TreeNode>>,right:Option<Box<TreeNode>>}
fn build_bst(vals:&[&str])->Option<Box<TreeNode>>{
  if vals.is_empty()||vals[0]=="null"{return None;}
  fn insert(root:&mut Option<Box<TreeNode>>,v:i32){
    match root{None=>{*root=Some(Box::new(TreeNode{val:v,left:None,right:None}));}
    Some(nd)=>{if v<nd.val{insert(&mut nd.left,v);}else{insert(&mut nd.right,v);}}}
  }
  let mut root=None;for v in vals{if *v!="null"{insert(&mut root,v.parse().unwrap());}}root
}
fn find_node(root:&Option<Box<TreeNode>>,val:i32)->i32{
  match root{None=>val,Some(nd)=>{if val==nd.val{val}else if val<nd.val{find_node(&nd.left,val)}else{find_node(&nd.right,val)}}}
}
fn main(){
  let stdin=io::stdin();
  for line in stdin.lock().lines(){
    let line=line.unwrap();let line=line.trim();if line.is_empty(){continue;}
    let parts:Vec<&str>=line.splitn(3,'|').collect();
    let vals:Vec<&str>=parts[0].split_whitespace().collect();
    let root=build_bst(&vals);
    let pv:i32=parts[1].trim().parse().unwrap();let qv:i32=parts[2].trim().parse().unwrap();
    println!("{}",lowest_common_ancestor(&root,pv,qv));
  }
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
    // stdin: "numCourses|prereq pairs" where pairs are "a b" separated by comma
    // e.g. "2|1 0" → true,  "2|1 0,0 1" → false,  "3|1 0,2 1" → true
    testCases: [
      { stdin: "2|1 0", expectedOutput: "true" },
      { stdin: "2|1 0,0 1", expectedOutput: "false" },
      { stdin: "3|1 0,2 1", expectedOutput: "true" },
      { stdin: "4|1 0,2 1,3 2,1 3", expectedOutput: "false" },
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
\t\tline := scanner.Text(); if line == "" { continue }
\t\tparts := strings.SplitN(line, "|", 2)
\t\tnumCourses, _ := strconv.Atoi(strings.TrimSpace(parts[0]))
\t\tprereqs := [][]int{}
\t\tif len(parts) > 1 && strings.TrimSpace(parts[1]) != "" {
\t\t\tfor _, pair := range strings.Split(strings.TrimSpace(parts[1]), ",") {
\t\t\t\tfs := strings.Fields(pair)
\t\t\t\ta, _ := strconv.Atoi(fs[0]); b, _ := strconv.Atoi(fs[1])
\t\t\t\tprereqs = append(prereqs, []int{a, b})
\t\t\t}
\t\t}
\t\tif canFinish(numCourses, prereqs) { fmt.Println("true") } else { fmt.Println("false") }
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    parts = line.split("|", 1)
    num_courses = int(parts[0].strip())
    prereqs = []
    if len(parts) > 1 and parts[1].strip():
        for pair in parts[1].strip().split(","):
            a, b = pair.split(); prereqs.append([int(a), int(b)])
    print(str(can_finish(num_courses, prereqs)).lower())
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const [nc, rest] = line.split("|");
  const numCourses = parseInt(nc.trim(), 10);
  const prerequisites = [];
  if (rest && rest.trim()) {
    for (const pair of rest.trim().split(",")) {
      const [a,b] = pair.trim().split(/\s+/).map(Number);
      prerequisites.push([a,b]);
    }
  }
  console.log(String(canFinish(numCourses, prerequisites)));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      String[] parts = line.split("\\\\|", 2);
      int numCourses = Integer.parseInt(parts[0].trim());
      int[][] prereqs = new int[0][];
      if (parts.length > 1 && !parts[1].trim().isEmpty()) {
        String[] pairs = parts[1].trim().split(",");
        prereqs = new int[pairs.length][2];
        for (int i = 0; i < pairs.length; i++) {
          String[] f = pairs[i].trim().split("\\\\s+");
          prereqs[i][0] = Integer.parseInt(f[0]); prereqs[i][1] = Integer.parseInt(f[1]);
        }
      }
      System.out.println(canFinish(numCourses, prereqs));
    }
  }
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
    int numCourses = stoi(line.substr(0, bar));
    vector<vector<int>> prereqs;
    if (bar != string::npos) {
      string rest = line.substr(bar+1);
      if (!rest.empty()) {
        stringstream ss(rest); string pair;
        while (getline(ss, pair, ',')) {
          istringstream ps(pair); int a, b; ps >> a >> b;
          prereqs.push_back({a, b});
        }
      }
    }
    cout << (canFinish(numCourses, prereqs) ? "true" : "false") << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let mut it = line.splitn(2, '|');
    let num_courses: usize = it.next().unwrap_or("0").trim().parse().unwrap();
    let mut prereqs: Vec<[usize;2]> = vec![];
    if let Some(rest) = it.next() {
      let rest = rest.trim();
      if !rest.is_empty() {
        for pair in rest.split(',') {
          let mut ps = pair.split_whitespace();
          let a: usize = ps.next().unwrap().parse().unwrap();
          let b: usize = ps.next().unwrap().parse().unwrap();
          prereqs.push([a, b]);
        }
      }
    }
    println!("{}", can_finish(num_courses, prereqs));
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
            if (t == "+" || t == "-" || t == "*" || t == "/") {
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
    // stdin: space-separated tokens, e.g. "2 1 + 3 *"
    testCases: [
      { stdin: "2 1 + 3 *", expectedOutput: "9" },
      { stdin: "4 13 5 / +", expectedOutput: "6" },
      { stdin: "10 6 9 3 + -11 * / * 17 + 5 +", expectedOutput: "22" },
      { stdin: "3 4 - 2 *", expectedOutput: "-2" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"strings"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text(); if line == "" { continue }
\t\ttokens := strings.Fields(line)
\t\tfmt.Println(evalRPN(tokens))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    tokens = line.split()
    print(eval_rpn(tokens))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const tokens = line.split(/\s+/);
  console.log(String(evalRPN(tokens)));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      String[] tokens = line.split("\\\\s+");
      System.out.println(evalRPN(tokens));
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    istringstream iss(line); vector<string> tokens; string tok;
    while (iss >> tok) tokens.push_back(tok);
    cout << evalRPN(tokens) << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let tokens: Vec<&str> = line.split_whitespace().collect();
    println!("{}", eval_rpn(tokens));
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
    // stdin: space-separated temperatures
    testCases: [
      { stdin: "73 74 75 71 69 72 76 73", expectedOutput: "1 1 4 2 1 1 0 0" },
      { stdin: "30 40 50 60", expectedOutput: "1 1 1 0" },
      { stdin: "30 60 90", expectedOutput: "1 1 0" },
      { stdin: "89 62 70 58 47 47 46 76 100 70", expectedOutput: "8 1 5 4 3 2 1 1 0 0" },
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
\t\tline := scanner.Text(); if line == "" { continue }
\t\tfields := strings.Fields(line)
\t\ttemps := make([]int, len(fields))
\t\tfor i, s := range fields { temps[i], _ = strconv.Atoi(s) }
\t\tres := dailyTemperatures(temps)
\t\tstrs := make([]string, len(res))
\t\tfor i, v := range res { strs[i] = strconv.Itoa(v) }
\t\tfmt.Println(strings.Join(strs, " "))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    temps = list(map(int, line.split()))
    print(" ".join(map(str, daily_temperatures(temps))))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const temps = line.split(/\s+/).map(Number);
  console.log(dailyTemperatures(temps).join(" "));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      String[] tokens = line.split("\\\\s+");
      int[] temps = new int[tokens.length];
      for (int i = 0; i < tokens.length; i++) temps[i] = Integer.parseInt(tokens[i]);
      int[] res = dailyTemperatures(temps);
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < res.length; i++) { if (i > 0) sb.append(' '); sb.append(res[i]); }
      System.out.println(sb);
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    istringstream iss(line); vector<int> temps; int x;
    while (iss >> x) temps.push_back(x);
    auto res = dailyTemperatures(temps);
    for (int i = 0; i < (int)res.size(); i++) { if (i) cout << ' '; cout << res[i]; } cout << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let temps: Vec<i32> = line.split_whitespace().map(|s| s.parse().unwrap()).collect();
    let res = daily_temperatures(temps);
    println!("{}", res.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(" "));
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
    // stdin: encoded string directly, e.g. "3[a]2[bc]"
    testCases: [
      { stdin: "3[a]2[bc]", expectedOutput: "aaabcbc" },
      { stdin: "3[a2[c]]", expectedOutput: "accaccacc" },
      { stdin: "2[abc]3[cd]ef", expectedOutput: "abcabccdcdcdef" },
      { stdin: "10[a]", expectedOutput: "aaaaaaaaaa" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"strings"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text(); if line == "" { continue }
\t\tfmt.Println(decodeString(strings.TrimSpace(line)))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    print(decode_string(line))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  console.log(decodeString(line));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      System.out.println(decodeString(line));
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    cout << decodeString(line) << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    println!("{}", decode_string(line));
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
    // stdin: integer n. Output: sorted combos space-joined on one line.
    // n=3 → "((()))  (()())  (())()  ()(())  ()()()"  sorted
    testCases: [
      { stdin: "1", expectedOutput: "()" },
      { stdin: "2", expectedOutput: "(())  ()()" },
      { stdin: "3", expectedOutput: "((()))  (()())  (())()  ()(())  ()()()" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"sort"
\t"strconv"
\t"strings"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text(); if line == "" { continue }
\t\tn, _ := strconv.Atoi(strings.TrimSpace(line))
\t\tres := generateParenthesis(n)
\t\tsort.Strings(res)
\t\t// Join with double-space so parentheses strings are visually distinct
\t\tfmt.Println(strings.Join(res, "  "))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    n = int(line)
    res = sorted(generate_parenthesis(n))
    print("  ".join(res))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const n = parseInt(line, 10);
  const res = generateParenthesis(n).sort();
  console.log(res.join("  "));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      int n = Integer.parseInt(line);
      List<String> res = generateParenthesis(n);
      Collections.sort(res);
      System.out.println(String.join("  ", res));
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    int n = stoi(line);
    auto res = generateParenthesis(n);
    sort(res.begin(), res.end());
    for (int i = 0; i < (int)res.size(); i++) { if (i) cout << "  "; cout << res[i]; } cout << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let n: usize = line.parse().unwrap();
    let mut res = generate_parenthesis(n);
    res.sort();
    println!("{}", res.join("  "));
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
    // stdin: space-separated nums. Output: subsets sorted lexicographically, joined by "|".
    // empty subset is represented as empty string (leading "|")
    testCases: [
      { stdin: "1 2 3", expectedOutput: "|1|1 2|1 2 3|1 3|2|2 3|3" },
      { stdin: "0", expectedOutput: "|0" },
      { stdin: "1 2", expectedOutput: "|1|1 2|2" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"sort"
\t"strconv"
\t"strings"
)
{{SOLUTION}}
func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tfor scanner.Scan() {
\t\tline := scanner.Text(); if line == "" { continue }
\t\tfields := strings.Fields(line)
\t\tnums := make([]int, len(fields))
\t\tfor i, s := range fields { nums[i], _ = strconv.Atoi(s) }
\t\tall := subsets(nums)
\t\tstrs := make([]string, len(all))
\t\tfor i, sub := range all {
\t\t\tsort.Ints(sub)
\t\t\tss := make([]string, len(sub))
\t\t\tfor j, v := range sub { ss[j] = strconv.Itoa(v) }
\t\t\tstrs[i] = strings.Join(ss, " ")
\t\t}
\t\tsort.Strings(strs)
\t\tfmt.Println(strings.Join(strs, "|"))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    all_subsets = subsets(nums)
    strs = [" ".join(map(str, sorted(s))) for s in all_subsets]
    strs.sort()
    print("|".join(strs))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const nums = line.split(/\s+/).map(Number);
  const all = subsets(nums);
  const strs = all.map(s => [...s].sort((a,b)=>a-b).join(" "));
  strs.sort();
  console.log(strs.join("|"));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      String[] tokens = line.split("\\\\s+");
      int[] nums = new int[tokens.length];
      for (int i = 0; i < tokens.length; i++) nums[i] = Integer.parseInt(tokens[i]);
      List<List<Integer>> all = subsets(nums);
      List<String> strs = new ArrayList<>();
      for (List<Integer> s : all) {
        List<Integer> sorted = new ArrayList<>(s); Collections.sort(sorted);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < sorted.size(); i++) { if (i > 0) sb.append(' '); sb.append(sorted.get(i)); }
        strs.add(sb.toString());
      }
      Collections.sort(strs);
      System.out.println(String.join("|", strs));
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    istringstream iss(line); vector<int> nums; int x;
    while (iss >> x) nums.push_back(x);
    auto all = subsets(nums);
    vector<string> strs;
    for (auto s : all) {
      sort(s.begin(), s.end());
      string t; for (int i = 0; i < (int)s.size(); i++) { if (i) t+=' '; t+=to_string(s[i]); }
      strs.push_back(t);
    }
    sort(strs.begin(), strs.end());
    for (int i = 0; i < (int)strs.size(); i++) { if (i) cout << '|'; cout << strs[i]; } cout << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let nums: Vec<i32> = line.split_whitespace().map(|s| s.parse().unwrap()).collect();
    let all = subsets(nums);
    let mut strs: Vec<String> = all.iter().map(|s| {
      let mut v = s.clone(); v.sort();
      v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(" ")
    }).collect();
    strs.sort();
    println!("{}", strs.join("|"));
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
    // stdin: space-separated nums; output: space-separated result array
    testCases: [
      { stdin: "1 2 3", expectedOutput: "1 3 2" },
      { stdin: "3 2 1", expectedOutput: "1 2 3" },
      { stdin: "1 1 5", expectedOutput: "1 5 1" },
      { stdin: "1 3 2", expectedOutput: "2 1 3" },
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
\t\tline := scanner.Text(); if line == "" { continue }
\t\tfields := strings.Fields(line)
\t\tnums := make([]int, len(fields))
\t\tfor i, s := range fields { nums[i], _ = strconv.Atoi(s) }
\t\tnextPermutation(nums)
\t\tstrs := make([]string, len(nums))
\t\tfor i, v := range nums { strs[i] = strconv.Itoa(v) }
\t\tfmt.Println(strings.Join(strs, " "))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    next_permutation(nums)
    print(" ".join(map(str, nums)))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const nums = line.split(/\s+/).map(Number);
  nextPermutation(nums);
  console.log(nums.join(" "));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      String[] tokens = line.split("\\\\s+");
      int[] nums = new int[tokens.length];
      for (int i = 0; i < tokens.length; i++) nums[i] = Integer.parseInt(tokens[i]);
      nextPermutation(nums);
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < nums.length; i++) { if (i > 0) sb.append(' '); sb.append(nums[i]); }
      System.out.println(sb);
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    istringstream iss(line); vector<int> nums; int x;
    while (iss >> x) nums.push_back(x);
    nextPermutation(nums);
    for (int i = 0; i < (int)nums.size(); i++) { if (i) cout << ' '; cout << nums[i]; } cout << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let mut nums: Vec<i32> = line.split_whitespace().map(|s| s.parse().unwrap()).collect();
    next_permutation(&mut nums);
    println!("{}", nums.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(" "));
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
    // stdin: rows separated by "|", cells space-separated. e.g. "1 3 1|1 5 1|4 2 1"
    testCases: [
      { stdin: "1 3 1|1 5 1|4 2 1", expectedOutput: "7" },
      { stdin: "1 2 3|4 5 6", expectedOutput: "12" },
      { stdin: "1 2|5 6|1 1", expectedOutput: "8" },
      { stdin: "5", expectedOutput: "5" },
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
\t\tline := scanner.Text(); if line == "" { continue }
\t\trows := strings.Split(line, "|")
\t\tgrid := make([][]int, len(rows))
\t\tfor i, r := range rows {
\t\t\tfs := strings.Fields(r)
\t\t\tgrid[i] = make([]int, len(fs))
\t\t\tfor j, s := range fs { grid[i][j], _ = strconv.Atoi(s) }
\t\t}
\t\tfmt.Println(minPathSum(grid))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    grid = [[int(x) for x in r.split()] for r in line.split("|")]
    print(min_path_sum(grid))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const grid = line.split("|").map(r => r.trim().split(/\s+/).map(Number));
  console.log(String(minPathSum(grid)));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      String[] rows = line.split("\\\\|");
      int[][] grid = new int[rows.length][];
      for (int i = 0; i < rows.length; i++) {
        String[] cells = rows[i].trim().split("\\\\s+");
        grid[i] = new int[cells.length];
        for (int j = 0; j < cells.length; j++) grid[i][j] = Integer.parseInt(cells[j]);
      }
      System.out.println(minPathSum(grid));
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    vector<vector<int>> grid;
    stringstream ss(line); string row;
    while (getline(ss, row, '|')) {
      istringstream rs(row); vector<int> r; int x;
      while (rs >> x) r.push_back(x);
      grid.push_back(r);
    }
    cout << minPathSum(grid) << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let grid: Vec<Vec<i32>> = line.split('|').map(|r|
      r.split_whitespace().map(|s| s.parse().unwrap()).collect()
    ).collect();
    println!("{}", min_path_sum(grid));
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
    testCases: [
      { stdin: "1 5 11 5", expectedOutput: "true" },
      { stdin: "1 2 3 5", expectedOutput: "false" },
      { stdin: "1 2 3 4 5 6 7", expectedOutput: "true" },
      { stdin: "3 3 3 4 5", expectedOutput: "false" },
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
\t\tline := scanner.Text(); if line == "" { continue }
\t\tfields := strings.Fields(line)
\t\tnums := make([]int, len(fields))
\t\tfor i, s := range fields { nums[i], _ = strconv.Atoi(s) }
\t\tif canPartition(nums) { fmt.Println("true") } else { fmt.Println("false") }
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    print(str(can_partition(nums)).lower())
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const nums = line.split(/\s+/).map(Number);
  console.log(String(canPartition(nums)));
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      String[] tokens = line.split("\\\\s+");
      int[] nums = new int[tokens.length];
      for (int i = 0; i < tokens.length; i++) nums[i] = Integer.parseInt(tokens[i]);
      System.out.println(canPartition(nums));
    }
  }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    istringstream iss(line); vector<int> nums; int x;
    while (iss >> x) nums.push_back(x);
    cout << (canPartition(nums) ? "true" : "false") << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let nums: Vec<i32> = line.split_whitespace().map(|s| s.parse().unwrap()).collect();
    println!("{}", can_partition(nums));
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
    // stdin: "nums|target" e.g. "5 7 7 8 8 10|8"
    testCases: [
      { stdin: "5 7 7 8 8 10|8", expectedOutput: "3 4" },
      { stdin: "5 7 7 8 8 10|6", expectedOutput: "-1 -1" },
      { stdin: "1|1", expectedOutput: "0 0" },
      { stdin: "1 2 3 3 3 4 5|3", expectedOutput: "2 4" },
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
\t\tline := scanner.Text(); if line == "" { continue }
\t\tparts := strings.SplitN(line, "|", 2)
\t\tfields := strings.Fields(parts[0])
\t\tnums := make([]int, len(fields))
\t\tfor i, s := range fields { nums[i], _ = strconv.Atoi(s) }
\t\ttarget, _ := strconv.Atoi(strings.TrimSpace(parts[1]))
\t\tres := searchRange(nums, target)
\t\tfmt.Println(strconv.Itoa(res[0]) + " " + strconv.Itoa(res[1]))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    a, _, b = line.partition("|")
    nums = list(map(int, a.split()))
    target = int(b.strip())
    res = search_range(nums, target)
    print(str(res[0]) + " " + str(res[1]))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0,"utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim(); if (!line) continue;
  const [a, b] = line.split("|");
  const nums = a.trim().split(/\s+/).map(Number);
  const target = parseInt(b.trim(), 10);
  const res = searchRange(nums, target);
  console.log(res[0] + " " + res[1]);
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim(); if (line.isEmpty()) continue;
      String[] parts = line.split("\\\\|", 2);
      String[] tokens = parts[0].trim().split("\\\\s+");
      int[] nums = new int[tokens.length];
      for (int i = 0; i < tokens.length; i++) nums[i] = Integer.parseInt(tokens[i]);
      int target = Integer.parseInt(parts[1].trim());
      int[] res = searchRange(nums, target);
      System.out.println(res[0] + " " + res[1]);
    }
  }
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
    istringstream iss(line.substr(0, bar)); vector<int> nums; int x;
    while (iss >> x) nums.push_back(x);
    int target = stoi(line.substr(bar+1));
    auto res = searchRange(nums, target);
    cout << res[0] << " " << res[1] << "\\n";
  }
}`,
      rust: `use std::io::{self,BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap(); let line = line.trim();
    if line.is_empty() { continue; }
    let mut it = line.splitn(2, '|');
    let nums: Vec<i32> = it.next().unwrap_or("").split_whitespace().map(|s| s.parse().unwrap()).collect();
    let target: i32 = it.next().unwrap_or("0").trim().parse().unwrap();
    let res = search_range(nums, target);
    println!("{} {}", res[0], res[1]);
  }
}`,
    },
  },
];
