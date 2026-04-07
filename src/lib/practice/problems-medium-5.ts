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
    testCases: [
      { stdin: "eat tea tan ate nat bat", expectedOutput: "bat|ate eat tea|nat tan" },
      { stdin: "a", expectedOutput: "a" },
      { stdin: "ab ba ab", expectedOutput: "ab ab ba" },
    ],
    judgeHarness: {
      go: `package main
import (
\t"bufio"
\t"fmt"
\t"os"
\t"sort"
\t"strings"
)
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tstrs := strings.Fields(l)
\t\tgroups := groupAnagrams(strs)
\t\tfor _, g := range groups { sort.Strings(g) }
\t\tsort.Slice(groups, func(i, j int) bool {
\t\t\tif len(groups[i]) == 0 { return true }
\t\t\tif len(groups[j]) == 0 { return false }
\t\t\treturn groups[i][0] < groups[j][0]
\t\t})
\t\tparts := make([]string, len(groups))
\t\tfor i, g := range groups { parts[i] = strings.Join(g, " ") }
\t\tfmt.Println(strings.Join(parts, "|"))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    strs = line.split()
    groups = group_anagrams(strs)
    for g in groups: g.sort()
    groups.sort(key=lambda g: g[0] if g else "")
    print("|".join(" ".join(g) for g in groups))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const strs = l.split(/\s+/);
  const groups = groupAnagrams(strs);
  for (const g of groups) g.sort();
  groups.sort((a, b) => (a[0] || "").localeCompare(b[0] || ""));
  console.log(groups.map(g => g.join(" ")).join("|"));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while(getline(cin, line)) {
    if(line.empty()) continue;
    istringstream iss(line);
    vector<string> strs; string w;
    while(iss >> w) strs.push_back(w);
    auto groups = groupAnagrams(strs);
    for(auto& g : groups) sort(g.begin(), g.end());
    sort(groups.begin(), groups.end(), [](const vector<string>& a, const vector<string>& b){
      return a.empty() ? true : (b.empty() ? false : a[0] < b[0]);
    });
    for(int i=0;i<(int)groups.size();i++){
      if(i) cout<<"|";
      for(int j=0;j<(int)groups[i].size();j++){if(j)cout<<" ";cout<<groups[i][j];}
    }
    cout<<"\\n";
  }
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while((line=br.readLine())!=null) {
      line=line.trim(); if(line.isEmpty()) continue;
      String[] strs = line.split("\\\\s+");
      List<List<String>> groups = groupAnagrams(strs);
      for(List<String> g : groups) Collections.sort(g);
      groups.sort((a,b)->{
        if(a.isEmpty()) return -1; if(b.isEmpty()) return 1;
        return a.get(0).compareTo(b.get(0));
      });
      StringBuilder sb = new StringBuilder();
      for(int i=0;i<groups.size();i++){
        if(i>0) sb.append('|');
        sb.append(String.join(" ", groups.get(i)));
      }
      System.out.println(sb);
    }
  }
}`,
      rust: `use std::io::{self, BufRead};
use std::collections::HashMap;
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap();
    let line = line.trim();
    if line.is_empty() { continue; }
    let strs: Vec<String> = line.split_whitespace().map(String::from).collect();
    let mut groups = group_anagrams(strs);
    for g in &mut groups { g.sort(); }
    groups.sort_by(|a, b| {
      let af = a.first().map(String::as_str).unwrap_or("");
      let bf = b.first().map(String::as_str).unwrap_or("");
      af.cmp(bf)
    });
    let out: Vec<String> = groups.iter().map(|g| g.join(" ")).collect();
    println!("{}", out.join("|"));
  }
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;
public class Main {
{{SOLUTION}}
  static void Main() {
    string line;
    while((line=Console.ReadLine())!=null) {
      line=line.Trim(); if(line.Length==0) continue;
      var strs = line.Split(' ');
      var groups = GroupAnagrams(strs);
      foreach(var g in groups) g.Sort();
      var sorted = groups.OrderBy(g => g.Count > 0 ? g[0] : "").ToList();
      Console.WriteLine(string.Join("|", sorted.Select(g => string.Join(" ", g))));
    }
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
    testCases: [
      { stdin: "1 2 3 4 5 6 7 8 9|3", expectedOutput: "1 2 3 6 9 8 7 4 5" },
      { stdin: "1 2 3 4|2", expectedOutput: "1 2 4 3" },
      { stdin: "1 2 3 4 5 6 7 8 9 10 11 12|3", expectedOutput: "1 2 3 4 8 12 11 10 9 5 6 7" },
      { stdin: "1|1", expectedOutput: "1" },
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
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tp := strings.SplitN(l, "|", 2)
\t\tparts := strings.Fields(p[0])
\t\tn, _ := strconv.Atoi(strings.TrimSpace(p[1]))
\t\tflat := make([]int, len(parts))
\t\tfor i, s := range parts { flat[i], _ = strconv.Atoi(s) }
\t\trows := len(flat) / n
\t\tmatrix := make([][]int, rows)
\t\tfor i := range matrix {
\t\t\tmatrix[i] = flat[i*n : (i+1)*n]
\t\t}
\t\tres := spiralOrder(matrix)
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
    parts = line.split("|")
    flat = list(map(int, parts[0].split()))
    n = int(parts[1])
    rows = len(flat) // n
    matrix = [flat[i*n:(i+1)*n] for i in range(rows)]
    res = spiral_order(matrix)
    print(" ".join(map(str, res)))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [flatStr, nStr] = l.split("|");
  const flat = flatStr.trim().split(/\s+/).map(Number);
  const n = parseInt(nStr);
  const rows = flat.length / n;
  const matrix = [];
  for (let i = 0; i < rows; i++) matrix.push(flat.slice(i*n, (i+1)*n));
  console.log(spiralOrder(matrix).join(" "));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while(getline(cin, line)) {
    if(line.empty()) continue;
    auto pos = line.find('|');
    int n = stoi(line.substr(pos+1));
    istringstream iss(line.substr(0, pos));
    vector<int> flat; int x;
    while(iss >> x) flat.push_back(x);
    int rows = flat.size() / n;
    vector<vector<int>> matrix(rows, vector<int>(n));
    for(int i=0;i<rows;i++) for(int j=0;j<n;j++) matrix[i][j]=flat[i*n+j];
    auto res = spiralOrder(matrix);
    for(int i=0;i<(int)res.size();i++){if(i)cout<<" ";cout<<res[i];}
    cout<<"\\n";
  }
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while((line=br.readLine())!=null) {
      line=line.trim(); if(line.isEmpty()) continue;
      String[] parts = line.split("\\\\|");
      String[] flatStrs = parts[0].trim().split("\\\\s+");
      int n = Integer.parseInt(parts[1].trim());
      int total = flatStrs.length, rows = total/n;
      int[][] matrix = new int[rows][n];
      for(int i=0;i<rows;i++) for(int j=0;j<n;j++) matrix[i][j]=Integer.parseInt(flatStrs[i*n+j]);
      List<Integer> res = spiralOrder(matrix);
      StringBuilder sb = new StringBuilder();
      for(int i=0;i<res.size();i++){if(i>0)sb.append(' ');sb.append(res.get(i));}
      System.out.println(sb);
    }
  }
}`,
      rust: `use std::io::{self, BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap();
    let line = line.trim();
    if line.is_empty() { continue; }
    let mut parts = line.splitn(2, '|');
    let flat: Vec<i32> = parts.next().unwrap().split_whitespace().map(|s| s.parse().unwrap()).collect();
    let n: usize = parts.next().unwrap().trim().parse().unwrap();
    let rows = flat.len() / n;
    let matrix: Vec<Vec<i32>> = (0..rows).map(|i| flat[i*n..(i+1)*n].to_vec()).collect();
    let res = spiral_order(matrix);
    let out: Vec<String> = res.iter().map(|v| v.to_string()).collect();
    println!("{}", out.join(" "));
  }
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;
public class Main {
{{SOLUTION}}
  static void Main() {
    string line;
    while((line=Console.ReadLine())!=null) {
      line=line.Trim(); if(line.Length==0) continue;
      var parts = line.Split('|');
      var flat = parts[0].Trim().Split(' ').Select(int.Parse).ToArray();
      int n = int.Parse(parts[1].Trim()), rows = flat.Length / n;
      int[][] matrix = new int[rows][];
      for(int i=0;i<rows;i++){matrix[i]=new int[n];for(int j=0;j<n;j++)matrix[i][j]=flat[i*n+j];}
      var res = SpiralOrder(matrix);
      Console.WriteLine(string.Join(" ", res));
    }
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
    testCases: [
      { stdin: "1 2 3 4 5 6 7 8 9|3", expectedOutput: "7 4 1 8 5 2 9 6 3" },
      { stdin: "1 2 3 4|2", expectedOutput: "3 1 4 2" },
      { stdin: "5 1 9 11 2 4 8 10 13 3 6 7 15 14 12 16|4", expectedOutput: "15 13 2 5 14 3 4 1 12 6 8 9 16 7 10 11" },
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
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tp := strings.SplitN(l, "|", 2)
\t\tparts := strings.Fields(p[0])
\t\tn, _ := strconv.Atoi(strings.TrimSpace(p[1]))
\t\tmatrix := make([][]int, n)
\t\tfor i := range matrix {
\t\t\tmatrix[i] = make([]int, n)
\t\t\tfor j := 0; j < n; j++ {
\t\t\t\tmatrix[i][j], _ = strconv.Atoi(parts[i*n+j])
\t\t\t}
\t\t}
\t\trotate(matrix)
\t\tout := []string{}
\t\tfor _, row := range matrix {
\t\t\tfor _, v := range row { out = append(out, strconv.Itoa(v)) }
\t\t}
\t\tfmt.Println(strings.Join(out, " "))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    parts = line.split("|")
    flat = list(map(int, parts[0].split()))
    n = int(parts[1])
    matrix = [flat[i*n:(i+1)*n] for i in range(n)]
    rotate(matrix)
    out = [str(v) for row in matrix for v in row]
    print(" ".join(out))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const [flatStr, nStr] = l.split("|");
  const flat = flatStr.trim().split(/\s+/).map(Number);
  const n = parseInt(nStr);
  const matrix = [];
  for (let i = 0; i < n; i++) matrix.push(flat.slice(i*n, (i+1)*n));
  rotate(matrix);
  console.log(matrix.flat().join(" "));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while(getline(cin, line)) {
    if(line.empty()) continue;
    auto pos = line.find('|');
    int n = stoi(line.substr(pos+1));
    istringstream iss(line.substr(0, pos));
    vector<vector<int>> matrix(n, vector<int>(n));
    for(int i=0;i<n;i++) for(int j=0;j<n;j++) iss >> matrix[i][j];
    rotate(matrix);
    bool first=true;
    for(auto& row:matrix) for(int v:row){if(!first)cout<<" ";cout<<v;first=false;}
    cout<<"\\n";
  }
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while((line=br.readLine())!=null) {
      line=line.trim(); if(line.isEmpty()) continue;
      String[] parts = line.split("\\\\|");
      String[] flatStrs = parts[0].trim().split("\\\\s+");
      int n = Integer.parseInt(parts[1].trim());
      int[][] matrix = new int[n][n];
      for(int i=0;i<n;i++) for(int j=0;j<n;j++) matrix[i][j]=Integer.parseInt(flatStrs[i*n+j]);
      rotate(matrix);
      StringBuilder sb = new StringBuilder();
      for(int i=0;i<n;i++) for(int j=0;j<n;j++){if(i>0||j>0)sb.append(' ');sb.append(matrix[i][j]);}
      System.out.println(sb);
    }
  }
}`,
      rust: `use std::io::{self, BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap();
    let line = line.trim();
    if line.is_empty() { continue; }
    let mut parts = line.splitn(2, '|');
    let flat: Vec<i32> = parts.next().unwrap().split_whitespace().map(|s| s.parse().unwrap()).collect();
    let n: usize = parts.next().unwrap().trim().parse().unwrap();
    let mut matrix: Vec<Vec<i32>> = (0..n).map(|i| flat[i*n..(i+1)*n].to_vec()).collect();
    rotate(&mut matrix);
    let out: Vec<String> = matrix.iter().flat_map(|row| row.iter().map(|v| v.to_string())).collect();
    println!("{}", out.join(" "));
  }
}`,
      csharp: `using System;
using System.Linq;
public class Main {
{{SOLUTION}}
  static void Main() {
    string line;
    while((line=Console.ReadLine())!=null) {
      line=line.Trim(); if(line.Length==0) continue;
      var parts = line.Split('|');
      var flat = parts[0].Trim().Split(' ').Select(int.Parse).ToArray();
      int n = int.Parse(parts[1].Trim());
      int[][] matrix = new int[n][];
      for(int i=0;i<n;i++){matrix[i]=new int[n];for(int j=0;j<n;j++)matrix[i][j]=flat[i*n+j];}
      Rotate(matrix);
      Console.WriteLine(string.Join(" ", matrix.SelectMany(r=>r)));
    }
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
    testCases: [
      { stdin: "1 2 3 1", expectedOutput: "2" },
      { stdin: "3 1", expectedOutput: "0" },
      { stdin: "1 3", expectedOutput: "1" },
      { stdin: "5", expectedOutput: "0" },
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
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tparts := strings.Fields(l)
\t\tnums := make([]int, len(parts))
\t\tfor i, s := range parts { nums[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(findPeakElement(nums))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    nums = list(map(int, line.split()))
    print(find_peak_element(nums))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const nums = l.split(/\s+/).map(Number);
  console.log(findPeakElement(nums));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while(getline(cin, line)) {
    if(line.empty()) continue;
    istringstream iss(line);
    vector<int> nums; int x;
    while(iss >> x) nums.push_back(x);
    cout << findPeakElement(nums) << "\\n";
  }
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while((line=br.readLine())!=null) {
      line=line.trim(); if(line.isEmpty()) continue;
      String[] p = line.split("\\\\s+");
      int[] nums = new int[p.length];
      for(int i=0;i<p.length;i++) nums[i]=Integer.parseInt(p[i]);
      System.out.println(findPeakElement(nums));
    }
  }
}`,
      rust: `use std::io::{self, BufRead};
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap();
    let line = line.trim();
    if line.is_empty() { continue; }
    let nums: Vec<i64> = line.split_whitespace().map(|s| s.parse().unwrap()).collect();
    println!("{}", find_peak_element(nums));
  }
}`,
      csharp: `using System;
using System.Linq;
public class Main {
{{SOLUTION}}
  static void Main() {
    string line;
    while((line=Console.ReadLine())!=null) {
      line=line.Trim(); if(line.Length==0) continue;
      var nums = line.Split(' ').Select(int.Parse).ToArray();
      Console.WriteLine(FindPeakElement(nums));
    }
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
    testCases: [
      { stdin: "3 1 4 3 -1 1 5", expectedOutput: "4" },
      { stdin: "3 3 -1 4 2", expectedOutput: "3" },
      { stdin: "1", expectedOutput: "1" },
      { stdin: "2 2 5 2", expectedOutput: "3" },
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
func buildTree(vals []int) *TreeNode {
\tif len(vals) == 0 { return nil }
\tif vals[0] == -1 { return nil }
\troot := &TreeNode{Val: vals[0]}
\tqueue := []*TreeNode{root}
\ti := 1
\tfor len(queue) > 0 && i < len(vals) {
\t\tnode := queue[0]; queue = queue[1:]
\t\tif i < len(vals) && vals[i] != -1 {
\t\t\tnode.Left = &TreeNode{Val: vals[i]}
\t\t\tqueue = append(queue, node.Left)
\t\t}
\t\ti++
\t\tif i < len(vals) && vals[i] != -1 {
\t\t\tnode.Right = &TreeNode{Val: vals[i]}
\t\t\tqueue = append(queue, node.Right)
\t\t}
\t\ti++
\t}
\treturn root
}
{{SOLUTION}}
func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tfor sc.Scan() {
\t\tl := sc.Text(); if l == "" { continue }
\t\tparts := strings.Fields(l)
\t\tvals := make([]int, len(parts))
\t\tfor i, s := range parts { vals[i], _ = strconv.Atoi(s) }
\t\troot := buildTree(vals)
\t\tfmt.Println(goodNodes(root))
\t}
}`,
      python: `import sys
from collections import deque
{{SOLUTION}}
def build_tree(vals):
    if not vals or vals[0] == -1:
        return None
    root = TreeNode(vals[0])
    queue = deque([root])
    i = 1
    while queue and i < len(vals):
        node = queue.popleft()
        if i < len(vals) and vals[i] != -1:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] != -1:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    vals = list(map(int, line.split()))
    root = build_tree(vals)
    print(good_nodes(root))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
function buildTree(vals) {
  if (!vals.length || vals[0] === -1) return null;
  const root = new TreeNode(vals[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < vals.length) {
    const node = queue.shift();
    if (i < vals.length && vals[i] !== -1) {
      node.left = new TreeNode(vals[i]);
      queue.push(node.left);
    }
    i++;
    if (i < vals.length && vals[i] !== -1) {
      node.right = new TreeNode(vals[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\r?\n/);
for (const raw of lines) {
  const l = raw.trim(); if (!l) continue;
  const vals = l.split(/\s+/).map(Number);
  const root = buildTree(vals);
  console.log(goodNodes(root));
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
struct TreeNode {
  int val; TreeNode *left, *right;
  TreeNode(int v, TreeNode* l=nullptr, TreeNode* r=nullptr): val(v),left(l),right(r){}
};
TreeNode* buildTree(vector<int>& vals) {
  if(vals.empty() || vals[0]==-1) return nullptr;
  TreeNode* root = new TreeNode(vals[0]);
  queue<TreeNode*> q; q.push(root);
  int i=1;
  while(!q.empty() && i<(int)vals.size()) {
    TreeNode* node = q.front(); q.pop();
    if(i<(int)vals.size() && vals[i]!=-1){node->left=new TreeNode(vals[i]);q.push(node->left);}
    i++;
    if(i<(int)vals.size() && vals[i]!=-1){node->right=new TreeNode(vals[i]);q.push(node->right);}
    i++;
  }
  return root;
}
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  string line;
  while(getline(cin, line)) {
    if(line.empty()) continue;
    istringstream iss(line);
    vector<int> vals; int x;
    while(iss >> x) vals.push_back(x);
    TreeNode* root = buildTree(vals);
    cout << goodNodes(root) << "\\n";
  }
}`,
      java: `import java.io.*;
import java.util.*;
public class Main {
  static class TreeNode {
    int val; TreeNode left, right;
    TreeNode(int v){val=v;}
    TreeNode(int v,TreeNode l,TreeNode r){val=v;left=l;right=r;}
  }
  static TreeNode buildTree(int[] vals) {
    if(vals.length==0 || vals[0]==-1) return null;
    TreeNode root = new TreeNode(vals[0]);
    Queue<TreeNode> q = new LinkedList<>(); q.add(root);
    int i=1;
    while(!q.isEmpty() && i<vals.length) {
      TreeNode node = q.poll();
      if(i<vals.length && vals[i]!=-1){node.left=new TreeNode(vals[i]);q.add(node.left);}
      i++;
      if(i<vals.length && vals[i]!=-1){node.right=new TreeNode(vals[i]);q.add(node.right);}
      i++;
    }
    return root;
  }
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while((line=br.readLine())!=null) {
      line=line.trim(); if(line.isEmpty()) continue;
      String[] p = line.split("\\\\s+");
      int[] vals = new int[p.length];
      for(int i=0;i<p.length;i++) vals[i]=Integer.parseInt(p[i]);
      TreeNode root = buildTree(vals);
      System.out.println(goodNodes(root));
    }
  }
}`,
      rust: `use std::io::{self, BufRead};
use std::collections::VecDeque;
#[derive(Debug)]
struct TreeNode { val: i32, left: Option<Box<TreeNode>>, right: Option<Box<TreeNode>> }
impl TreeNode { fn new(v: i32) -> Box<Self> { Box::new(Self { val: v, left: None, right: None }) } }
fn build_tree(vals: &[i32]) -> Option<Box<TreeNode>> {
  if vals.is_empty() || vals[0] == -1 { return None; }
  let mut root = TreeNode::new(vals[0]);
  let mut queue: VecDeque<*mut TreeNode> = VecDeque::new();
  queue.push_back(&mut *root as *mut _);
  let mut i = 1usize;
  while let Some(node_ptr) = queue.pop_front() {
    let node = unsafe { &mut *node_ptr };
    if i < vals.len() && vals[i] != -1 {
      node.left = Some(TreeNode::new(vals[i]));
      queue.push_back(&mut **node.left.as_mut().unwrap() as *mut _);
    }
    i += 1;
    if i < vals.len() && vals[i] != -1 {
      node.right = Some(TreeNode::new(vals[i]));
      queue.push_back(&mut **node.right.as_mut().unwrap() as *mut _);
    }
    i += 1;
    if i >= vals.len() { break; }
  }
  Some(root)
}
{{SOLUTION}}
fn main() {
  let stdin = io::stdin();
  for line in stdin.lock().lines() {
    let line = line.unwrap();
    let line = line.trim();
    if line.is_empty() { continue; }
    let vals: Vec<i32> = line.split_whitespace().map(|s| s.parse().unwrap()).collect();
    let root = build_tree(&vals);
    println!("{}", good_nodes(root));
  }
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;
public class TreeNode {
  public int Val; public TreeNode Left, Right;
  public TreeNode(int v){Val=v;}
}
public class Main {
  static TreeNode BuildTree(int[] vals) {
    if(vals.Length==0 || vals[0]==-1) return null;
    var root = new TreeNode(vals[0]);
    var q = new Queue<TreeNode>(); q.Enqueue(root);
    int i=1;
    while(q.Count>0 && i<vals.Length) {
      var node = q.Dequeue();
      if(i<vals.Length && vals[i]!=-1){node.Left=new TreeNode(vals[i]);q.Enqueue(node.Left);}
      i++;
      if(i<vals.Length && vals[i]!=-1){node.Right=new TreeNode(vals[i]);q.Enqueue(node.Right);}
      i++;
    }
    return root;
  }
{{SOLUTION}}
  static void Main() {
    string line;
    while((line=Console.ReadLine())!=null) {
      line=line.Trim(); if(line.Length==0) continue;
      var vals = line.Split(' ').Select(int.Parse).ToArray();
      var root = BuildTree(vals);
      Console.WriteLine(GoodNodes(root));
    }
  }
}`,
    },
  },
];
