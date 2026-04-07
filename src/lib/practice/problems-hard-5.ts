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
    testCases: [
      { stdin: "1,2,3,null,null,4,5", expectedOutput: "1 2 3 null null 4 5" },
      { stdin: "1,2", expectedOutput: "1 2" },
      { stdin: "", expectedOutput: "" },
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

type TreeNode struct {
\tVal   int
\tLeft  *TreeNode
\tRight *TreeNode
}

{{SOLUTION}}

func buildFromLevelOrder(parts []string) *TreeNode {
\tif len(parts) == 0 || parts[0] == "null" || parts[0] == "" {
\t\treturn nil
\t}
\tv, _ := strconv.Atoi(parts[0])
\troot := &TreeNode{Val: v}
\tqueue := []*TreeNode{root}
\ti := 1
\tfor len(queue) > 0 && i < len(parts) {
\t\tnode := queue[0]
\t\tqueue = queue[1:]
\t\tif i < len(parts) && parts[i] != "null" {
\t\t\tv, _ := strconv.Atoi(parts[i])
\t\t\tnode.Left = &TreeNode{Val: v}
\t\t\tqueue = append(queue, node.Left)
\t\t}
\t\ti++
\t\tif i < len(parts) && parts[i] != "null" {
\t\t\tv, _ := strconv.Atoi(parts[i])
\t\t\tnode.Right = &TreeNode{Val: v}
\t\t\tqueue = append(queue, node.Right)
\t\t}
\t\ti++
\t}
\treturn root
}

func bfsOutput(root *TreeNode) string {
\tif root == nil {
\t\treturn ""
\t}
\tvar result []string
\tqueue := []*TreeNode{root}
\tfor len(queue) > 0 {
\t\tnode := queue[0]
\t\tqueue = queue[1:]
\t\tif node == nil {
\t\t\tresult = append(result, "null")
\t\t} else {
\t\t\tresult = append(result, strconv.Itoa(node.Val))
\t\t\tqueue = append(queue, node.Left, node.Right)
\t\t}
\t}
\t// trim trailing nulls
\tfor len(result) > 0 && result[len(result)-1] == "null" {
\t\tresult = result[:len(result)-1]
\t}
\treturn strings.Join(result, " ")
}

func main() {
\tscanner := bufio.NewScanner(os.Stdin)
\tscanner.Scan()
\tline := strings.TrimSpace(scanner.Text())
\tif line == "" {
\t\tdata := serialize(nil)
\t\trestored := deserialize(data)
\t\tfmt.Print(bfsOutput(restored))
\t\treturn
\t}
\tparts := strings.Split(line, ",")
\troot := buildFromLevelOrder(parts)
\tdata := serialize(root)
\trestored := deserialize(data)
\tfmt.Print(bfsOutput(restored))
}`,
      python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

{{SOLUTION}}

def build_from_level_order(parts):
    if not parts or parts[0] == 'null' or parts[0] == '':
        return None
    root = TreeNode(int(parts[0]))
    queue = deque([root])
    i = 1
    while queue and i < len(parts):
        node = queue.popleft()
        if i < len(parts) and parts[i] != 'null':
            node.left = TreeNode(int(parts[i]))
            queue.append(node.left)
        i += 1
        if i < len(parts) and parts[i] != 'null':
            node.right = TreeNode(int(parts[i]))
            queue.append(node.right)
        i += 1
    return root

def bfs_output(root):
    if root is None:
        return ''
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            result.append('null')
        else:
            result.append(str(node.val))
            queue.append(node.left)
            queue.append(node.right)
    while result and result[-1] == 'null':
        result.pop()
    return ' '.join(result)

def main():
    line = sys.stdin.readline().strip()
    if not line:
        data = serialize(None)
        restored = deserialize(data)
        print(bfs_output(restored), end='')
        return
    parts = line.split(',')
    root = build_from_level_order(parts)
    data = serialize(root)
    restored = deserialize(data)
    print(bfs_output(restored), end='')

main()
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    class TreeNode {
        constructor(val, left = null, right = null) {
            this.val = val; this.left = left; this.right = right;
        }
    }

    {{SOLUTION}}

    function buildFromLevelOrder(parts) {
        if (!parts.length || parts[0] === 'null' || parts[0] === '') return null;
        const root = new TreeNode(parseInt(parts[0]));
        const queue = [root];
        let i = 1;
        while (queue.length && i < parts.length) {
            const node = queue.shift();
            if (i < parts.length && parts[i] !== 'null') {
                node.left = new TreeNode(parseInt(parts[i]));
                queue.push(node.left);
            }
            i++;
            if (i < parts.length && parts[i] !== 'null') {
                node.right = new TreeNode(parseInt(parts[i]));
                queue.push(node.right);
            }
            i++;
        }
        return root;
    }

    function bfsOutput(root) {
        if (!root) return '';
        const result = [];
        const queue = [root];
        while (queue.length) {
            const node = queue.shift();
            if (!node) { result.push('null'); }
            else {
                result.push(String(node.val));
                queue.push(node.left);
                queue.push(node.right);
            }
        }
        while (result.length && result[result.length - 1] === 'null') result.pop();
        return result.join(' ');
    }

    const line = lines[0] || '';
    if (!line) {
        const data = serialize(null);
        const restored = deserialize(data);
        process.stdout.write(bfsOutput(restored));
        return;
    }
    const parts = line.split(',');
    const root = buildFromLevelOrder(parts);
    const data = serialize(root);
    const restored = deserialize(data);
    process.stdout.write(bfsOutput(restored));
});`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
        TreeNode(int v, TreeNode l, TreeNode r) { val=v; left=l; right=r; }
    }

    {{SOLUTION}}

    static TreeNode buildFromLevelOrder(String[] parts) {
        if (parts.length == 0 || parts[0].equals("null") || parts[0].isEmpty()) return null;
        TreeNode root = new TreeNode(Integer.parseInt(parts[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        int i = 1;
        while (!queue.isEmpty() && i < parts.length) {
            TreeNode node = queue.poll();
            if (i < parts.length && !parts[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(parts[i]));
                queue.add(node.left);
            }
            i++;
            if (i < parts.length && !parts[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(parts[i]));
                queue.add(node.right);
            }
            i++;
        }
        return root;
    }

    static String bfsOutput(TreeNode root) {
        if (root == null) return "";
        List<String> result = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node == null) { result.add("null"); }
            else {
                result.add(String.valueOf(node.val));
                queue.add(node.left);
                queue.add(node.right);
            }
        }
        while (!result.isEmpty() && result.get(result.size()-1).equals("null"))
            result.remove(result.size()-1);
        return String.join(" ", result);
    }

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) line = "";
        line = line.trim();
        if (line.isEmpty()) {
            String data = serialize(null);
            TreeNode restored = deserialize(data);
            System.out.print(bfsOutput(restored));
            return;
        }
        String[] parts = line.split(",");
        TreeNode root = buildFromLevelOrder(parts);
        String data = serialize(root);
        TreeNode restored = deserialize(data);
        System.out.print(bfsOutput(restored));
    }
}`,
      rust: `use std::io::{self, BufRead};
use std::collections::VecDeque;

{{SOLUTION}}

fn build_from_level_order(parts: &[&str]) -> Option<Box<TreeNode>> {
    if parts.is_empty() || parts[0] == "null" || parts[0].is_empty() {
        return None;
    }
    let val: i32 = parts[0].parse().unwrap();
    let root = Box::new(TreeNode { val, left: None, right: None });
    let mut queue: VecDeque<*mut TreeNode> = VecDeque::new();
    let root_ptr = Box::into_raw(root);
    queue.push_back(root_ptr);
    let mut i = 1;
    while let Some(node_ptr) = queue.pop_front() {
        let node = unsafe { &mut *node_ptr };
        if i < parts.len() && parts[i] != "null" {
            let v: i32 = parts[i].parse().unwrap();
            let child = Box::into_raw(Box::new(TreeNode { val: v, left: None, right: None }));
            node.left = unsafe { Some(Box::from_raw(child)) };
            if let Some(ref mut l) = node.left {
                queue.push_back(l.as_mut() as *mut TreeNode);
            }
        }
        i += 1;
        if i < parts.len() && parts[i] != "null" {
            let v: i32 = parts[i].parse().unwrap();
            let child = Box::into_raw(Box::new(TreeNode { val: v, left: None, right: None }));
            node.right = unsafe { Some(Box::from_raw(child)) };
            if let Some(ref mut r) = node.right {
                queue.push_back(r.as_mut() as *mut TreeNode);
            }
        }
        i += 1;
    }
    unsafe { Some(Box::from_raw(root_ptr)) }
}

fn bfs_output(root: &Option<Box<TreeNode>>) -> String {
    if root.is_none() { return String::new(); }
    let mut result: Vec<String> = Vec::new();
    let mut queue: VecDeque<*const TreeNode> = VecDeque::new();
    queue.push_back(root.as_ref().unwrap().as_ref() as *const TreeNode);
    while let Some(ptr) = queue.pop_front() {
        if ptr.is_null() {
            result.push("null".to_string());
        } else {
            let node = unsafe { &*ptr };
            result.push(node.val.to_string());
            match &node.left {
                Some(l) => queue.push_back(l.as_ref() as *const TreeNode),
                None => queue.push_back(std::ptr::null()),
            }
            match &node.right {
                Some(r) => queue.push_back(r.as_ref() as *const TreeNode),
                None => queue.push_back(std::ptr::null()),
            }
        }
    }
    while result.last().map(|s| s == "null").unwrap_or(false) {
        result.pop();
    }
    result.join(" ")
}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    stdin.lock().read_line(&mut line).unwrap();
    let line = line.trim();
    if line.is_empty() {
        let data = serialize(None);
        let restored = deserialize(&data);
        print!("{}", bfs_output(&restored));
        return;
    }
    let parts: Vec<&str> = line.split(',').collect();
    let root = build_from_level_order(&parts);
    let data = serialize(root);
    let restored = deserialize(&data);
    print!("{}", bfs_output(&restored));
}`,
      cpp: `#include <iostream>
#include <sstream>
#include <string>
#include <queue>
#include <vector>
using namespace std;

struct TreeNode {
    int val; TreeNode *left, *right;
    TreeNode(int v, TreeNode* l=nullptr, TreeNode* r=nullptr):val(v),left(l),right(r){}
};

{{SOLUTION}}

TreeNode* buildFromLevelOrder(const vector<string>& parts) {
    if (parts.empty() || parts[0] == "null" || parts[0].empty()) return nullptr;
    TreeNode* root = new TreeNode(stoi(parts[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < parts.size()) {
        TreeNode* node = q.front(); q.pop();
        if (i < parts.size() && parts[i] != "null") {
            node->left = new TreeNode(stoi(parts[i]));
            q.push(node->left);
        }
        i++;
        if (i < parts.size() && parts[i] != "null") {
            node->right = new TreeNode(stoi(parts[i]));
            q.push(node->right);
        }
        i++;
    }
    return root;
}

string bfsOutput(TreeNode* root) {
    if (!root) return "";
    vector<string> result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* node = q.front(); q.pop();
        if (!node) { result.push_back("null"); }
        else {
            result.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        }
    }
    while (!result.empty() && result.back() == "null") result.pop_back();
    string out;
    for (size_t i = 0; i < result.size(); i++) {
        if (i) out += " ";
        out += result[i];
    }
    return out;
}

int main() {
    string line;
    getline(cin, line);
    if (line.empty()) {
        string data = serialize(nullptr);
        TreeNode* restored = deserialize(data);
        cout << bfsOutput(restored);
        return 0;
    }
    vector<string> parts;
    stringstream ss(line);
    string tok;
    while (getline(ss, tok, ',')) parts.push_back(tok);
    TreeNode* root = buildFromLevelOrder(parts);
    string data = serialize(root);
    TreeNode* restored = deserialize(data);
    cout << bfsOutput(restored);
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.IO;

class TreeNode {
    public int Val; public TreeNode Left, Right;
    public TreeNode(int v, TreeNode l=null, TreeNode r=null){Val=v;Left=l;Right=r;}
}

class Program {
    {{SOLUTION}}

    static TreeNode BuildFromLevelOrder(string[] parts) {
        if (parts.Length == 0 || parts[0] == "null" || parts[0] == "") return null;
        var root = new TreeNode(int.Parse(parts[0]));
        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        int i = 1;
        while (queue.Count > 0 && i < parts.Length) {
            var node = queue.Dequeue();
            if (i < parts.Length && parts[i] != "null") {
                node.Left = new TreeNode(int.Parse(parts[i]));
                queue.Enqueue(node.Left);
            }
            i++;
            if (i < parts.Length && parts[i] != "null") {
                node.Right = new TreeNode(int.Parse(parts[i]));
                queue.Enqueue(node.Right);
            }
            i++;
        }
        return root;
    }

    static string BfsOutput(TreeNode root) {
        if (root == null) return "";
        var result = new List<string>();
        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        while (queue.Count > 0) {
            var node = queue.Dequeue();
            if (node == null) { result.Add("null"); }
            else {
                result.Add(node.Val.ToString());
                queue.Enqueue(node.Left);
                queue.Enqueue(node.Right);
            }
        }
        while (result.Count > 0 && result[result.Count-1] == "null")
            result.RemoveAt(result.Count-1);
        return string.Join(" ", result);
    }

    static void Main() {
        string line = Console.ReadLine() ?? "";
        line = line.Trim();
        if (line == "") {
            string data = Serialize(null);
            TreeNode restored = Deserialize(data);
            Console.Write(BfsOutput(restored));
            return;
        }
        string[] parts = line.Split(',');
        TreeNode root = BuildFromLevelOrder(parts);
        string d = Serialize(root);
        TreeNode res = Deserialize(d);
        Console.Write(BfsOutput(res));
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
    testCases: [
      { stdin: "z x", expectedOutput: "zx" },
      { stdin: "z x z", expectedOutput: "" },
      { stdin: "abc ab", expectedOutput: "" },
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
\tscanner.Scan()
\twords := strings.Fields(scanner.Text())
\tfmt.Print(alienOrder(words))
}`,
      python: `import sys
from collections import defaultdict, deque

{{SOLUTION}}

def main():
    line = sys.stdin.readline().strip()
    words = line.split()
    print(alien_order(words), end='')

main()
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    {{SOLUTION}}

    const words = lines[0].split(' ');
    process.stdout.write(alienOrder(words));
});`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    {{SOLUTION}}

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine().trim();
        String[] words = line.split("\\\\s+");
        System.out.print(alienOrder(words));
    }
}`,
      rust: `use std::io::{self, BufRead};
use std::collections::{HashMap, HashSet, VecDeque};

{{SOLUTION}}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    stdin.lock().read_line(&mut line).unwrap();
    let words: Vec<&str> = line.trim().split_whitespace().collect();
    print!("{}", alien_order(words));
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <sstream>
using namespace std;

{{SOLUTION}}

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<string> words;
    string w;
    while (iss >> w) words.push_back(w);
    cout << alienOrder(words);
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.IO;

class Program {
    {{SOLUTION}}

    static void Main() {
        string line = Console.ReadLine() ?? "";
        string[] words = line.Trim().Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries);
        Console.Write(AlienOrder(words));
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
    testCases: [
      { stdin: "3 1 5 8", expectedOutput: "167" },
      { stdin: "1 5", expectedOutput: "10" },
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
\tscanner.Scan()
\tparts := strings.Fields(scanner.Text())
\tnums := make([]int, len(parts))
\tfor i, p := range parts {
\t\tnums[i], _ = strconv.Atoi(p)
\t}
\tfmt.Println(maxCoins(nums))
}`,
      python: `import sys

{{SOLUTION}}

def main():
    line = sys.stdin.readline().strip()
    nums = list(map(int, line.split()))
    print(max_coins(nums))

main()
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    {{SOLUTION}}

    const nums = lines[0].split(' ').map(Number);
    console.log(maxCoins(nums));
});`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    {{SOLUTION}}

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] parts = br.readLine().trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        System.out.println(maxCoins(nums));
    }
}`,
      rust: `use std::io::{self, BufRead};

{{SOLUTION}}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    stdin.lock().read_line(&mut line).unwrap();
    let nums: Vec<i32> = line.trim().split_whitespace()
        .map(|x| x.parse().unwrap()).collect();
    println!("{}", max_coins(nums));
}`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

{{SOLUTION}}

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> nums;
    int x;
    while (iss >> x) nums.push_back(x);
    cout << maxCoins(nums) << endl;
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    {{SOLUTION}}

    static void Main() {
        string line = Console.ReadLine() ?? "";
        int[] nums = line.Trim().Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries)
                         .Select(int.Parse).ToArray();
        Console.WriteLine(MaxCoins(nums));
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
    testCases: [
      {
        stdin: "4 4\noaan\netae\nihkr\niflv\noath pea eat rain",
        expectedOutput: "eat oath",
      },
      {
        stdin: "2 2\nab\ncd\nabcb",
        expectedOutput: "",
      },
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
\tscanner.Scan()
\tdims := strings.Fields(scanner.Text())
\trows, _ := strconv.Atoi(dims[0])
\tcols, _ := strconv.Atoi(dims[1])
\tboard := make([][]byte, rows)
\tfor i := 0; i < rows; i++ {
\t\tscanner.Scan()
\t\tline := scanner.Text()
\t\tboard[i] = make([]byte, cols)
\t\tfor j := 0; j < cols; j++ {
\t\t\tboard[i][j] = line[j]
\t\t}
\t}
\tscanner.Scan()
\twords := strings.Fields(scanner.Text())
\tresult := findWords(board, words)
\tsort.Strings(result)
\tif len(result) == 0 {
\t\tfmt.Print("")
\t} else {
\t\tfmt.Print(strings.Join(result, " "))
\t}
}`,
      python: `import sys

{{SOLUTION}}

def main():
    lines = sys.stdin.read().splitlines()
    dims = lines[0].split()
    rows, cols = int(dims[0]), int(dims[1])
    board = []
    for i in range(1, rows + 1):
        board.append(list(lines[i]))
    words = lines[rows + 1].split()
    result = find_words(board, words)
    result.sort()
    print(' '.join(result), end='')

main()
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    {{SOLUTION}}

    const dims = lines[0].split(' ');
    const rows = parseInt(dims[0]);
    const cols = parseInt(dims[1]);
    const board = [];
    for (let i = 1; i <= rows; i++) {
        board.push(lines[i].split(''));
    }
    const words = lines[rows + 1].split(' ');
    const result = findWords(board, words);
    result.sort();
    process.stdout.write(result.join(' '));
});`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    {{SOLUTION}}

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] dims = br.readLine().trim().split("\\\\s+");
        int rows = Integer.parseInt(dims[0]);
        int cols = Integer.parseInt(dims[1]);
        char[][] board = new char[rows][cols];
        for (int i = 0; i < rows; i++) {
            String line = br.readLine();
            for (int j = 0; j < cols; j++) board[i][j] = line.charAt(j);
        }
        String[] words = br.readLine().trim().split("\\\\s+");
        List<String> result = findWords(board, words);
        Collections.sort(result);
        System.out.print(String.join(" ", result));
    }
}`,
      rust: `use std::io::{self, Read};
use std::collections::HashSet;

{{SOLUTION}}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut lines = input.lines();
    let dims: Vec<usize> = lines.next().unwrap().split_whitespace()
        .map(|x| x.parse().unwrap()).collect();
    let rows = dims[0];
    let board: Vec<Vec<char>> = (0..rows)
        .map(|_| lines.next().unwrap().chars().collect())
        .collect();
    let words: Vec<String> = lines.next().unwrap().split_whitespace()
        .map(|s| s.to_string()).collect();
    let mut result = find_words(board, words);
    result.sort();
    print!("{}", result.join(" "));
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
using namespace std;

{{SOLUTION}}

int main() {
    int rows, cols;
    cin >> rows >> cols;
    cin.ignore();
    vector<vector<char>> board(rows, vector<char>(cols));
    for (int i = 0; i < rows; i++) {
        string line;
        getline(cin, line);
        for (int j = 0; j < cols; j++) board[i][j] = line[j];
    }
    string wline;
    getline(cin, wline);
    istringstream iss(wline);
    vector<string> words;
    string w;
    while (iss >> w) words.push_back(w);
    vector<string> result = findWords(board, words);
    sort(result.begin(), result.end());
    for (size_t i = 0; i < result.size(); i++) {
        if (i) cout << " ";
        cout << result[i];
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    {{SOLUTION}}

    static void Main() {
        string dimLine = Console.ReadLine() ?? "";
        string[] dims = dimLine.Trim().Split(' ');
        int rows = int.Parse(dims[0]);
        int cols = int.Parse(dims[1]);
        char[][] board = new char[rows][];
        for (int i = 0; i < rows; i++) {
            string line = Console.ReadLine() ?? "";
            board[i] = line.ToCharArray();
        }
        string wline = Console.ReadLine() ?? "";
        string[] words = wline.Trim().Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries);
        IList<string> result = FindWords(board, words);
        var sorted = result.OrderBy(s => s).ToList();
        Console.Write(string.Join(" ", sorted));
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
    testCases: [
      {
        stdin: "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4\nend",
        expectedOutput: "1\n-1\n-1\n3\n4",
      },
      {
        stdin: "1\nput 1 1\nget 1\nput 2 2\nget 1\nget 2\nend",
        expectedOutput: "1\n-1\n2",
      },
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
\tscanner.Scan()
\tcap, _ := strconv.Atoi(strings.TrimSpace(scanner.Text()))
\tcache := Constructor(cap)
\tfor scanner.Scan() {
\t\tline := strings.TrimSpace(scanner.Text())
\t\tif line == "end" {
\t\t\tbreak
\t\t}
\t\tparts := strings.Fields(line)
\t\tswitch parts[0] {
\t\tcase "get":
\t\t\tkey, _ := strconv.Atoi(parts[1])
\t\t\tfmt.Println(cache.Get(key))
\t\tcase "put":
\t\t\tkey, _ := strconv.Atoi(parts[1])
\t\t\tval, _ := strconv.Atoi(parts[2])
\t\t\tcache.Put(key, val)
\t\t}
\t}
}`,
      python: `import sys
from collections import OrderedDict

{{SOLUTION}}

def main():
    lines = sys.stdin.read().splitlines()
    capacity = int(lines[0].strip())
    cache = LRUCache(capacity)
    for line in lines[1:]:
        line = line.strip()
        if line == 'end':
            break
        parts = line.split()
        if parts[0] == 'get':
            print(cache.get(int(parts[1])))
        elif parts[0] == 'put':
            cache.put(int(parts[1]), int(parts[2]))

main()
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
    {{SOLUTION}}

    const capacity = parseInt(lines[0]);
    const cache = new LRUCache(capacity);
    const output = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === 'end') break;
        const parts = line.split(' ');
        if (parts[0] === 'get') {
            output.push(cache.get(parseInt(parts[1])));
        } else if (parts[0] === 'put') {
            cache.put(parseInt(parts[1]), parseInt(parts[2]));
        }
    }
    console.log(output.join('\\n'));
});`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    {{SOLUTION}}

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int capacity = Integer.parseInt(br.readLine().trim());
        LRUCache cache = new LRUCache(capacity);
        StringBuilder sb = new StringBuilder();
        String line;
        boolean first = true;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (line.equals("end")) break;
            String[] parts = line.split("\\\\s+");
            if (parts[0].equals("get")) {
                if (!first) sb.append('\\n');
                sb.append(cache.get(Integer.parseInt(parts[1])));
                first = false;
            } else if (parts[0].equals("put")) {
                cache.put(Integer.parseInt(parts[1]), Integer.parseInt(parts[2]));
            }
        }
        System.out.print(sb);
    }
}`,
      rust: `use std::io::{self, BufRead};
use std::collections::HashMap;

{{SOLUTION}}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    let capacity: usize = lines.next().unwrap().unwrap().trim().parse().unwrap();
    let mut cache = LRUCache::new(capacity);
    let mut output: Vec<String> = Vec::new();
    for line in lines {
        let line = line.unwrap();
        let line = line.trim();
        if line == "end" { break; }
        let parts: Vec<&str> = line.split_whitespace().collect();
        match parts[0] {
            "get" => {
                let key: i32 = parts[1].parse().unwrap();
                output.push(cache.get(key).to_string());
            }
            "put" => {
                let key: i32 = parts[1].parse().unwrap();
                let val: i32 = parts[2].parse().unwrap();
                cache.put(key, val);
            }
            _ => {}
        }
    }
    print!("{}", output.join("\\n"));
}`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <list>
#include <sstream>
#include <string>
using namespace std;

{{SOLUTION}}

int main() {
    int capacity;
    cin >> capacity;
    cin.ignore();
    LRUCache cache(capacity);
    string line;
    bool first = true;
    while (getline(cin, line)) {
        if (line == "end") break;
        istringstream iss(line);
        string op;
        iss >> op;
        if (op == "get") {
            int key; iss >> key;
            if (!first) cout << "\\n";
            cout << cache.get(key);
            first = false;
        } else if (op == "put") {
            int key, val; iss >> key >> val;
            cache.put(key, val);
        }
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.IO;

{{SOLUTION}}

class Program {
    static void Main() {
        string capLine = Console.ReadLine() ?? "0";
        int capacity = int.Parse(capLine.Trim());
        var cache = new LRUCache(capacity);
        var output = new List<string>();
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (line == "end") break;
            string[] parts = line.Split(' ');
            if (parts[0] == "get") {
                output.Add(cache.Get(int.Parse(parts[1])).ToString());
            } else if (parts[0] == "put") {
                cache.Put(int.Parse(parts[1]), int.Parse(parts[2]));
            }
        }
        Console.Write(string.Join("\\n", output));
    }
}`,
    },
  },
];
