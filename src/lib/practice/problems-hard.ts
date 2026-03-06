import type { PracticeProblem } from "./types";

export const HARD_PROBLEMS: PracticeProblem[] = [
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
    testCases: [
      { stdin: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" },
      { stdin: "4 2 0 3 2 5", expectedOutput: "9" },
      { stdin: "3 0 2 0 4", expectedOutput: "7" },
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
\t\tline := scanner.Text()
\t\tif line == "" { continue }
\t\tparts := strings.Fields(line)
\t\theight := make([]int, len(parts))
\t\tfor i, s := range parts { height[i], _ = strconv.Atoi(s) }
\t\tfmt.Println(trap(height))
\t}
}`,
      python: `import sys
{{SOLUTION}}
for line in sys.stdin:
  line = line.strip()
  if not line: continue
  height = [int(x) for x in line.split()]
  print(trap(height))
`,
      javascript: `const fs = require("fs");
{{SOLUTION}}
const lines = fs.readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
for (const lineRaw of lines) {
  const line = lineRaw.trim();
  if (!line) continue;
  const height = line.split(/\\s+/).filter(Boolean).map(Number);
  console.log(String(trap(height)));
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;
{{SOLUTION}}
int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  string line;
  while (getline(cin, line)) {
    if (line.empty()) continue;
    vector<int> height;
    { istringstream iss(line); int x; while (iss >> x) height.push_back(x); }
    cout << trap(height) << "\\n";
  }
  return 0;
}
`,
      java: `import java.io.*;
public class Main {
{{SOLUTION}}
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim();
      if (line.isEmpty()) continue;
      String[] parts = line.split("\\\\s+");
      int[] height = new int[parts.length];
      for (int i = 0; i < parts.length; i++) height[i] = Integer.parseInt(parts[i]);
      System.out.println(trap(height));
    }
  }
}
`,
      rust: `use std::io::{self, Read};
{{SOLUTION}}
fn main() {
  let mut input = String::new();
  io::stdin().read_to_string(&mut input).unwrap();
  for line in input.lines() {
    let line = line.trim();
    if line.is_empty() { continue; }
    let height: Vec<i32> = line.split_whitespace().filter_map(|s| s.parse().ok()).collect();
    println!(\"{}\", trap(height));
  }
}
`,
    },
  },
];
