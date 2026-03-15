import type { PracticeProblem } from "./types";

export const MEDIUM_PROBLEMS_7: PracticeProblem[] = [
  {
    slug: "combination-sum-ii",
    title: "Combination Sum II",
    category: "backtracking",
    difficulty: "medium",
    description:
      "Given a collection of candidate numbers (`candidates`) and a target number (`target`), find all unique combinations in `candidates` where the candidate numbers sum to `target`.\n\nEach number in `candidates` may only be used **once** in the combination.\n\n**Note:** The solution set must not contain duplicate combinations. Sort first to skip duplicates.",
    examples: [
      { input: "candidates = [10,1,2,7,6,1,5], target = 8", output: "[[1,1,6],[1,2,5],[1,7],[2,6]]" },
      { input: "candidates = [2,5,2,1,2], target = 5", output: "[[1,2,2],[5]]" },
    ],
    starter: {
      python: `def combination_sum2(candidates: list[int], target: int) -> list[list[int]]:
    candidates.sort()
    result = []
    def backtrack(start: int, current: list[int], remaining: int):
        if remaining == 0:
            result.append(list(current))
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break
            # Skip duplicates at the same recursion level
            if i > start and candidates[i] == candidates[i-1]:
                continue
            current.append(candidates[i])
            backtrack(i + 1, current, remaining - candidates[i])
            current.pop()
    backtrack(0, [], target)
    return result

if __name__ == "__main__":
    print(combination_sum2([10,1,2,7,6,1,5], 8))  # [[1,1,6],[1,2,5],[1,7],[2,6]]
`,
      javascript: `/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
function combinationSum2(candidates, target) {
    candidates.sort((a, b) => a - b);
    const result = [];
    function backtrack(start, current, remaining) {
        if (remaining === 0) { result.push([...current]); return; }
        for (let i = start; i < candidates.length; i++) {
            if (candidates[i] > remaining) break;
            if (i > start && candidates[i] === candidates[i-1]) continue;
            current.push(candidates[i]);
            backtrack(i + 1, current, remaining - candidates[i]);
            current.pop();
        }
    }
    backtrack(0, [], target);
    return result;
}

console.log(combinationSum2([10,1,2,7,6,1,5], 8));
`,
      go: `package main

import (
\t"fmt"
\t"sort"
)

func combinationSum2(candidates []int, target int) [][]int {
\tsort.Ints(candidates)
\tresult := [][]int{}
\tvar backtrack func(start, remaining int, current []int)
\tbacktrack = func(start, remaining int, current []int) {
\t\tif remaining == 0 {
\t\t\ttmp := make([]int, len(current))
\t\t\tcopy(tmp, current)
\t\t\tresult = append(result, tmp)
\t\t\treturn
\t\t}
\t\tfor i := start; i < len(candidates); i++ {
\t\t\tif candidates[i] > remaining { break }
\t\t\tif i > start && candidates[i] == candidates[i-1] { continue }
\t\t\tbacktrack(i+1, remaining-candidates[i], append(current, candidates[i]))
\t\t}
\t}
\tbacktrack(0, target, []int{})
\treturn result
}

func main() {
\tfmt.Println(combinationSum2([]int{10,1,2,7,6,1,5}, 8))
}`,
      java: `import java.util.*;

public class Main {
    static List<List<Integer>> result;

    static void backtrack(int[] candidates, int start, int remaining, List<Integer> current) {
        if (remaining == 0) { result.add(new ArrayList<>(current)); return; }
        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] > remaining) break;
            if (i > start && candidates[i] == candidates[i-1]) continue;
            current.add(candidates[i]);
            backtrack(candidates, i+1, remaining-candidates[i], current);
            current.remove(current.size()-1);
        }
    }

    public static List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        result = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayList<>());
        return result;
    }

    public static void main(String[] args) {
        System.out.println(combinationSum2(new int[]{10,1,2,7,6,1,5}, 8));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void backtrack(vector<int>& c, int start, int rem, vector<int>& curr, vector<vector<int>>& res) {
    if (rem == 0) { res.push_back(curr); return; }
    for (int i = start; i < (int)c.size(); i++) {
        if (c[i] > rem) break;
        if (i > start && c[i] == c[i-1]) continue;
        curr.push_back(c[i]);
        backtrack(c, i+1, rem-c[i], curr, res);
        curr.pop_back();
    }
}

vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
    sort(candidates.begin(), candidates.end());
    vector<vector<int>> res; vector<int> curr;
    backtrack(candidates, 0, target, curr, res);
    return res;
}

int main() {
    vector<int> c = {10,1,2,7,6,1,5};
    auto res = combinationSum2(c, 8);
    for (auto& v : res) { for (int x : v) cout << x << " "; cout << endl; }
}`,
      rust: `fn combination_sum2(mut candidates: Vec<i32>, target: i32) -> Vec<Vec<i32>> {
    candidates.sort();
    let mut result = vec![];
    fn backtrack(c: &[i32], start: usize, rem: i32, curr: &mut Vec<i32>, result: &mut Vec<Vec<i32>>) {
        if rem == 0 { result.push(curr.clone()); return; }
        for i in start..c.len() {
            if c[i] > rem { break; }
            if i > start && c[i] == c[i-1] { continue; }
            curr.push(c[i]);
            backtrack(c, i+1, rem-c[i], curr, result);
            curr.pop();
        }
    }
    backtrack(&candidates, 0, target, &mut vec![], &mut result);
    result
}

fn main() {
    println!("{:?}", combination_sum2(vec![10,1,2,7,6,1,5], 8));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static void Backtrack(int[] c, int start, int rem, List<int> curr, List<IList<int>> result) {
        if (rem == 0) { result.Add(new List<int>(curr)); return; }
        for (int i = start; i < c.Length; i++) {
            if (c[i] > rem) break;
            if (i > start && c[i] == c[i-1]) continue;
            curr.Add(c[i]);
            Backtrack(c, i+1, rem-c[i], curr, result);
            curr.RemoveAt(curr.Count-1);
        }
    }

    static IList<IList<int>> CombinationSum2(int[] candidates, int target) {
        Array.Sort(candidates);
        var result = new List<IList<int>>();
        Backtrack(candidates, 0, target, new List<int>(), result);
        return result;
    }

    static void Main() {
        foreach (var combo in CombinationSum2(new[]{10,1,2,7,6,1,5}, 8))
            Console.WriteLine("[" + string.Join(",", combo) + "]");
    }
}`,
    },
  },

  {
    slug: "pacific-atlantic-water-flow",
    title: "Pacific Atlantic Water Flow",
    category: "graph",
    difficulty: "medium",
    description:
      "There is an `m x n` rectangular island that borders both the Pacific Ocean and the Atlantic Ocean. The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges.\n\nWater can only flow in four directions (up, down, left, right) from a cell to an adjacent one with height **less than or equal** to the current cell's height.\n\nReturn a list of grid coordinates `result` where `result[i] = [ri, ci]` denotes that rain water can flow from cell `(ri, ci)` to **both** the Pacific and Atlantic oceans.\n\n**Hint:** Do reverse BFS from both ocean borders.",
    examples: [
      { input: "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]", output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]" },
    ],
    starter: {
      python: `from collections import deque

def pacific_atlantic(heights: list[list[int]]) -> list[list[int]]:
    if not heights: return []
    m, n = len(heights), len(heights[0])
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]

    def bfs(starts):
        visited = set(starts)
        queue = deque(starts)
        while queue:
            r, c = queue.popleft()
            for dr, dc in dirs:
                nr, nc = r+dr, c+dc
                if 0<=nr<m and 0<=nc<n and (nr,nc) not in visited and heights[nr][nc] >= heights[r][c]:
                    visited.add((nr,nc))
                    queue.append((nr,nc))
        return visited

    pac_starts = [(r,0) for r in range(m)] + [(0,c) for c in range(n)]
    atl_starts = [(r,n-1) for r in range(m)] + [(m-1,c) for c in range(n)]
    return [[r,c] for r,c in bfs(pac_starts) & bfs(atl_starts)]

if __name__ == "__main__":
    heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
    print(sorted(pacific_atlantic(heights)))
`,
      javascript: `/**
 * @param {number[][]} heights
 * @return {number[][]}
 */
function pacificAtlantic(heights) {
    const m = heights.length, n = heights[0].length;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    function bfs(starts) {
        const visited = new Set(starts.map(([r,c]) => r*n+c));
        const queue = [...starts];
        let i = 0;
        while (i < queue.length) {
            const [r,c] = queue[i++];
            for (const [dr,dc] of dirs) {
                const nr=r+dr, nc=c+dc, key=nr*n+nc;
                if (nr>=0&&nr<m&&nc>=0&&nc<n&&!visited.has(key)&&heights[nr][nc]>=heights[r][c]) {
                    visited.add(key); queue.push([nr,nc]);
                }
            }
        }
        return visited;
    }

    const pac = [], atl = [];
    for (let r=0;r<m;r++) { pac.push([r,0]); atl.push([r,n-1]); }
    for (let c=0;c<n;c++) { pac.push([0,c]); atl.push([m-1,c]); }
    const pacSet = bfs(pac), atlSet = bfs(atl);
    const result = [];
    for (let r=0;r<m;r++) for (let c=0;c<n;c++)
        if (pacSet.has(r*n+c) && atlSet.has(r*n+c)) result.push([r,c]);
    return result;
}`,
      go: `package main

import "fmt"

func pacificAtlantic(heights [][]int) [][]int {
\tm, n := len(heights), len(heights[0])
\tdirs := [][2]int{{0,1},{0,-1},{1,0},{-1,0}}

\tbfs := func(starts [][2]int) [][]bool {
\t\tvisited := make([][]bool, m)
\t\tfor i := range visited { visited[i] = make([]bool, n) }
\t\tqueue := append([][2]int{}, starts...)
\t\tfor _, s := range starts { visited[s[0]][s[1]] = true }
\t\tfor i := 0; i < len(queue); i++ {
\t\t\tr, c := queue[i][0], queue[i][1]
\t\t\tfor _, d := range dirs {
\t\t\t\tnr, nc := r+d[0], c+d[1]
\t\t\t\tif nr>=0&&nr<m&&nc>=0&&nc<n&&!visited[nr][nc]&&heights[nr][nc]>=heights[r][c] {
\t\t\t\t\tvisited[nr][nc] = true
\t\t\t\t\tqueue = append(queue, [2]int{nr,nc})
\t\t\t\t}
\t\t\t}
\t\t}
\t\treturn visited
\t}

\tpacStarts, atlStarts := [][2]int{}, [][2]int{}
\tfor r := 0; r < m; r++ { pacStarts=append(pacStarts,[2]int{r,0}); atlStarts=append(atlStarts,[2]int{r,n-1}) }
\tfor c := 0; c < n; c++ { pacStarts=append(pacStarts,[2]int{0,c}); atlStarts=append(atlStarts,[2]int{m-1,c}) }
\tpac, atl := bfs(pacStarts), bfs(atlStarts)
\tresult := [][]int{}
\tfor r := 0; r < m; r++ { for c := 0; c < n; c++ { if pac[r][c]&&atl[r][c] { result=append(result,[]int{r,c}) } } }
\treturn result
}

func main() {
\theights := [][]int{{1,2,2,3,5},{3,2,3,4,4},{2,4,5,3,1},{6,7,1,4,5},{5,1,1,2,4}}
\tfmt.Println(pacificAtlantic(heights))
}`,
      java: `import java.util.*;

public class Main {
    static int m, n;
    static int[][] heights;
    static int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};

    static boolean[][] bfs(List<int[]> starts) {
        boolean[][] visited = new boolean[m][n];
        Queue<int[]> queue = new LinkedList<>(starts);
        for (int[] s : starts) visited[s[0]][s[1]] = true;
        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            for (int[] d : dirs) {
                int nr=cur[0]+d[0], nc=cur[1]+d[1];
                if (nr>=0&&nr<m&&nc>=0&&nc<n&&!visited[nr][nc]&&heights[nr][nc]>=heights[cur[0]][cur[1]]) {
                    visited[nr][nc]=true; queue.offer(new int[]{nr,nc});
                }
            }
        }
        return visited;
    }

    public static List<List<Integer>> pacificAtlantic(int[][] h) {
        heights=h; m=h.length; n=h[0].length;
        List<int[]> pac=new ArrayList<>(), atl=new ArrayList<>();
        for (int r=0;r<m;r++){pac.add(new int[]{r,0});atl.add(new int[]{r,n-1});}
        for (int c=0;c<n;c++){pac.add(new int[]{0,c});atl.add(new int[]{m-1,c});}
        boolean[][] pv=bfs(pac), av=bfs(atl);
        List<List<Integer>> result=new ArrayList<>();
        for (int r=0;r<m;r++) for (int c=0;c<n;c++) if(pv[r][c]&&av[r][c]) result.add(Arrays.asList(r,c));
        return result;
    }

    public static void main(String[] args) {
        System.out.println(pacificAtlantic(new int[][]{{1,2,2,3,5},{3,2,3,4,4},{2,4,5,3,1},{6,7,1,4,5},{5,1,1,2,4}}));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
    int m=heights.size(), n=heights[0].size();
    int dirs[4][2]={{0,1},{0,-1},{1,0},{-1,0}};
    auto bfs=[&](vector<pair<int,int>> starts) {
        vector<vector<bool>> vis(m,vector<bool>(n,false));
        queue<pair<int,int>> q;
        for(auto s:starts){vis[s.first][s.second]=true;q.push(s);}
        while(!q.empty()){
            auto[r,c]=q.front();q.pop();
            for(auto d:dirs){int nr=r+d[0],nc=c+d[1];
                if(nr>=0&&nr<m&&nc>=0&&nc<n&&!vis[nr][nc]&&heights[nr][nc]>=heights[r][c]){vis[nr][nc]=true;q.push({nr,nc});}}
        }
        return vis;
    };
    vector<pair<int,int>> pac,atl;
    for(int r=0;r<m;r++){pac.push_back({r,0});atl.push_back({r,n-1});}
    for(int c=0;c<n;c++){pac.push_back({0,c});atl.push_back({m-1,c});}
    auto pv=bfs(pac),av=bfs(atl);
    vector<vector<int>> result;
    for(int r=0;r<m;r++) for(int c=0;c<n;c++) if(pv[r][c]&&av[r][c]) result.push_back({r,c});
    return result;
}

int main() {
    vector<vector<int>> h={{1,2,2,3,5},{3,2,3,4,4},{2,4,5,3,1},{6,7,1,4,5},{5,1,1,2,4}};
    auto res=pacificAtlantic(h);
    for(auto&v:res){cout<<"["<<v[0]<<","<<v[1]<<"] ";} cout<<endl;
}`,
      rust: `use std::collections::VecDeque;

fn pacific_atlantic(heights: Vec<Vec<i32>>) -> Vec<Vec<i32>> {
    let (m, n) = (heights.len(), heights[0].len());
    let dirs: [(i32,i32); 4] = [(0,1),(0,-1),(1,0),(-1,0)];
    let bfs = |starts: Vec<(usize,usize)>| -> Vec<Vec<bool>> {
        let mut vis = vec![vec![false; n]; m];
        let mut q: VecDeque<(usize,usize)> = starts.iter().cloned().collect();
        for &(r,c) in &starts { vis[r][c] = true; }
        while let Some((r,c)) = q.pop_front() {
            for &(dr,dc) in &dirs {
                let (nr,nc) = (r as i32+dr, c as i32+dc);
                if nr>=0&&(nr as usize)<m&&nc>=0&&(nc as usize)<n {
                    let (nr,nc) = (nr as usize, nc as usize);
                    if !vis[nr][nc] && heights[nr][nc] >= heights[r][c] {
                        vis[nr][nc] = true; q.push_back((nr,nc));
                    }
                }
            }
        }
        vis
    };
    let mut pac: Vec<(usize,usize)> = (0..m).map(|r|(r,0)).chain((0..n).map(|c|(0,c))).collect();
    let atl: Vec<(usize,usize)> = (0..m).map(|r|(r,n-1)).chain((0..n).map(|c|(m-1,c))).collect();
    let (pv, av) = (bfs(pac), bfs(atl));
    let mut result = vec![];
    for r in 0..m { for c in 0..n { if pv[r][c] && av[r][c] { result.push(vec![r as i32, c as i32]); } } }
    result
}

fn main() {
    let h = vec![vec![1,2,2,3,5],vec![3,2,3,4,4],vec![2,4,5,3,1],vec![6,7,1,4,5],vec![5,1,1,2,4]];
    println!("{:?}", pacific_atlantic(h));
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static bool[][] Bfs(int[][] heights, List<int[]> starts) {
        int m = heights.Length, n = heights[0].Length;
        bool[][] vis = new bool[m][];
        for (int i = 0; i < m; i++) vis[i] = new bool[n];
        var queue = new Queue<int[]>(starts);
        foreach (var s in starts) vis[s[0]][s[1]] = true;
        int[][] dirs = {new[]{0,1},new[]{0,-1},new[]{1,0},new[]{-1,0}};
        while (queue.Count > 0) {
            var cur = queue.Dequeue();
            foreach (var d in dirs) {
                int nr=cur[0]+d[0], nc=cur[1]+d[1];
                if (nr>=0&&nr<m&&nc>=0&&nc<n&&!vis[nr][nc]&&heights[nr][nc]>=heights[cur[0]][cur[1]]) {
                    vis[nr][nc]=true; queue.Enqueue(new[]{nr,nc});
                }
            }
        }
        return vis;
    }

    static IList<IList<int>> PacificAtlantic(int[][] heights) {
        int m=heights.Length, n=heights[0].Length;
        var pac=new List<int[]>(); var atl=new List<int[]>();
        for(int r=0;r<m;r++){pac.Add(new[]{r,0});atl.Add(new[]{r,n-1});}
        for(int c=0;c<n;c++){pac.Add(new[]{0,c});atl.Add(new[]{m-1,c});}
        var pv=Bfs(heights,pac); var av=Bfs(heights,atl);
        var result=new List<IList<int>>();
        for(int r=0;r<m;r++) for(int c=0;c<n;c++) if(pv[r][c]&&av[r][c]) result.Add(new List<int>{r,c});
        return result;
    }

    static void Main() {
        var h = new[]{new[]{1,2,2,3,5},new[]{3,2,3,4,4},new[]{2,4,5,3,1},new[]{6,7,1,4,5},new[]{5,1,1,2,4}};
        foreach (var p in PacificAtlantic(h)) Console.WriteLine($"[{p[0]},{p[1]}]");
    }
}`,
    },
  },

  {
    slug: "unique-paths-ii",
    title: "Unique Paths II",
    category: "dynamic-programming",
    difficulty: "medium",
    description:
      "A robot is located at the top-left corner of an `m x n` grid. The robot can only move right or down. Some cells contain obstacles (marked as `1`).\n\nReturn the number of unique paths from top-left to bottom-right.\n\n**Constraint:** `obstacleGrid[i][j]` is 0 or 1.",
    examples: [
      { input: "obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]", output: "2" },
      { input: "obstacleGrid = [[0,1],[0,0]]", output: "1" },
    ],
    starter: {
      python: `def unique_paths_with_obstacles(obstacle_grid: list[list[int]]) -> int:
    m, n = len(obstacle_grid), len(obstacle_grid[0])
    dp = [[0]*n for _ in range(m)]
    # Starting cell
    dp[0][0] = 1 if obstacle_grid[0][0] == 0 else 0
    for i in range(1, m): dp[i][0] = dp[i-1][0] if obstacle_grid[i][0] == 0 else 0
    for j in range(1, n): dp[0][j] = dp[0][j-1] if obstacle_grid[0][j] == 0 else 0
    for i in range(1, m):
        for j in range(1, n):
            if obstacle_grid[i][j] == 1: dp[i][j] = 0
            else: dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]

if __name__ == "__main__":
    print(unique_paths_with_obstacles([[0,0,0],[0,1,0],[0,0,0]]))  # 2
    print(unique_paths_with_obstacles([[0,1],[0,0]]))               # 1
`,
      javascript: `/**
 * @param {number[][]} obstacleGrid
 * @return {number}
 */
function uniquePathsWithObstacles(obstacleGrid) {
    const m = obstacleGrid.length, n = obstacleGrid[0].length;
    const dp = Array.from({length: m}, () => new Array(n).fill(0));
    dp[0][0] = obstacleGrid[0][0] === 0 ? 1 : 0;
    for (let i = 1; i < m; i++) dp[i][0] = obstacleGrid[i][0] === 0 ? dp[i-1][0] : 0;
    for (let j = 1; j < n; j++) dp[0][j] = obstacleGrid[0][j] === 0 ? dp[0][j-1] : 0;
    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            dp[i][j] = obstacleGrid[i][j] === 1 ? 0 : dp[i-1][j] + dp[i][j-1];
    return dp[m-1][n-1];
}

console.log(uniquePathsWithObstacles([[0,0,0],[0,1,0],[0,0,0]]));  // 2
`,
      go: `package main

import "fmt"

func uniquePathsWithObstacles(obstacleGrid [][]int) int {
\tm, n := len(obstacleGrid), len(obstacleGrid[0])
\tdp := make([][]int, m)
\tfor i := range dp { dp[i] = make([]int, n) }
\tif obstacleGrid[0][0] == 0 { dp[0][0] = 1 }
\tfor i := 1; i < m; i++ { if obstacleGrid[i][0]==0 { dp[i][0]=dp[i-1][0] } }
\tfor j := 1; j < n; j++ { if obstacleGrid[0][j]==0 { dp[0][j]=dp[0][j-1] } }
\tfor i := 1; i < m; i++ { for j := 1; j < n; j++ { if obstacleGrid[i][j]==0 { dp[i][j]=dp[i-1][j]+dp[i][j-1] } } }
\treturn dp[m-1][n-1]
}

func main() {
\tfmt.Println(uniquePathsWithObstacles([][]int{{0,0,0},{0,1,0},{0,0,0}}))  // 2
}`,
      java: `public class Main {
    public static int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int m=obstacleGrid.length, n=obstacleGrid[0].length;
        int[][] dp=new int[m][n];
        dp[0][0]=obstacleGrid[0][0]==0?1:0;
        for(int i=1;i<m;i++) dp[i][0]=obstacleGrid[i][0]==0?dp[i-1][0]:0;
        for(int j=1;j<n;j++) dp[0][j]=obstacleGrid[0][j]==0?dp[0][j-1]:0;
        for(int i=1;i<m;i++) for(int j=1;j<n;j++) dp[i][j]=obstacleGrid[i][j]==1?0:dp[i-1][j]+dp[i][j-1];
        return dp[m-1][n-1];
    }
    public static void main(String[] args) {
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,0,0},{0,1,0},{0,0,0}}));  // 2
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int uniquePathsWithObstacles(vector<vector<int>>& g) {
    int m=g.size(), n=g[0].size();
    vector<vector<int>> dp(m,vector<int>(n,0));
    dp[0][0]=g[0][0]==0?1:0;
    for(int i=1;i<m;i++) dp[i][0]=g[i][0]==0?dp[i-1][0]:0;
    for(int j=1;j<n;j++) dp[0][j]=g[0][j]==0?dp[0][j-1]:0;
    for(int i=1;i<m;i++) for(int j=1;j<n;j++) dp[i][j]=g[i][j]==1?0:dp[i-1][j]+dp[i][j-1];
    return dp[m-1][n-1];
}
int main() {
    vector<vector<int>> g={{0,0,0},{0,1,0},{0,0,0}};
    cout<<uniquePathsWithObstacles(g)<<endl;  // 2
}`,
      rust: `fn unique_paths_with_obstacles(obstacle_grid: Vec<Vec<i32>>) -> i32 {
    let (m,n)=(obstacle_grid.len(),obstacle_grid[0].len());
    let mut dp=vec![vec![0i32;n];m];
    dp[0][0]=if obstacle_grid[0][0]==0{1}else{0};
    for i in 1..m { dp[i][0]=if obstacle_grid[i][0]==0{dp[i-1][0]}else{0}; }
    for j in 1..n { dp[0][j]=if obstacle_grid[0][j]==0{dp[0][j-1]}else{0}; }
    for i in 1..m { for j in 1..n { dp[i][j]=if obstacle_grid[i][j]==1{0}else{dp[i-1][j]+dp[i][j-1]}; } }
    dp[m-1][n-1]
}
fn main() { println!("{}",unique_paths_with_obstacles(vec![vec![0,0,0],vec![0,1,0],vec![0,0,0]])); }`,
      csharp: `using System;
class Program {
    static int UniquePathsWithObstacles(int[][] g) {
        int m=g.Length,n=g[0].Length;
        int[][] dp=new int[m][];
        for(int i=0;i<m;i++) dp[i]=new int[n];
        dp[0][0]=g[0][0]==0?1:0;
        for(int i=1;i<m;i++) dp[i][0]=g[i][0]==0?dp[i-1][0]:0;
        for(int j=1;j<n;j++) dp[0][j]=g[0][j]==0?dp[0][j-1]:0;
        for(int i=1;i<m;i++) for(int j=1;j<n;j++) dp[i][j]=g[i][j]==1?0:dp[i-1][j]+dp[i][j-1];
        return dp[m-1][n-1];
    }
    static void Main() { Console.WriteLine(UniquePathsWithObstacles(new[]{new[]{0,0,0},new[]{0,1,0},new[]{0,0,0}})); }
}`,
    },
  },

  {
    slug: "jump-game-ii",
    title: "Jump Game II",
    category: "greedy",
    difficulty: "medium",
    description:
      "You are given a 0-indexed array of integers `nums` of length `n`. You are initially positioned at `nums[0]`.\n\nEach element `nums[i]` represents the maximum length of a forward jump from index `i`. Return the **minimum number of jumps** to reach `nums[n-1]`.\n\nThe test cases are generated such that you can always reach `nums[n-1]`.\n\n**Approach:** Greedy — track current reach and end of current jump level.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "2", explanation: "Minimum is 2 jumps: index 0 → 1 → 4." },
      { input: "nums = [2,3,0,1,4]", output: "2" },
    ],
    starter: {
      python: `def jump(nums: list[int]) -> int:
    jumps = 0
    current_end = 0
    farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
    return jumps

if __name__ == "__main__":
    print(jump([2,3,1,1,4]))  # 2
    print(jump([2,3,0,1,4]))  # 2
`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function jump(nums) {
    let jumps = 0, currentEnd = 0, farthest = 0;
    for (let i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        if (i === currentEnd) { jumps++; currentEnd = farthest; }
    }
    return jumps;
}

console.log(jump([2,3,1,1,4]));  // 2
`,
      go: `package main

import "fmt"

func jump(nums []int) int {
\tjumps, currentEnd, farthest := 0, 0, 0
\tfor i := 0; i < len(nums)-1; i++ {
\t\tif i+nums[i] > farthest { farthest = i+nums[i] }
\t\tif i == currentEnd { jumps++; currentEnd = farthest }
\t}
\treturn jumps
}

func main() {
\tfmt.Println(jump([]int{2,3,1,1,4}))  // 2
}`,
      java: `public class Main {
    public static int jump(int[] nums) {
        int jumps=0, currentEnd=0, farthest=0;
        for (int i=0;i<nums.length-1;i++) {
            farthest=Math.max(farthest,i+nums[i]);
            if (i==currentEnd) { jumps++; currentEnd=farthest; }
        }
        return jumps;
    }
    public static void main(String[] args) { System.out.println(jump(new int[]{2,3,1,1,4})); }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int jump(vector<int>& nums) {
    int jumps=0,currentEnd=0,farthest=0;
    for(int i=0;i<(int)nums.size()-1;i++){farthest=max(farthest,i+nums[i]);if(i==currentEnd){jumps++;currentEnd=farthest;}}
    return jumps;
}
int main() { vector<int> n={2,3,1,1,4}; cout<<jump(n)<<endl; }`,
      rust: `fn jump(nums: Vec<i32>) -> i32 {
    let (mut jumps,mut current_end,mut farthest)=(0,0,0);
    for i in 0..nums.len()-1 {
        farthest=farthest.max(i+nums[i] as usize);
        if i==current_end { jumps+=1; current_end=farthest; }
    }
    jumps
}
fn main() { println!("{}",jump(vec![2,3,1,1,4])); }`,
      csharp: `using System;
class Program {
    static int Jump(int[] nums) {
        int jumps=0,currentEnd=0,farthest=0;
        for(int i=0;i<nums.Length-1;i++){farthest=Math.Max(farthest,i+nums[i]);if(i==currentEnd){jumps++;currentEnd=farthest;}}
        return jumps;
    }
    static void Main() { Console.WriteLine(Jump(new[]{2,3,1,1,4})); }
}`,
    },
  },

  {
    slug: "rotate-array",
    title: "Rotate Array",
    category: "array",
    difficulty: "medium",
    description:
      "Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.\n\n**In-place O(1) extra space trick:** Reverse the whole array, then reverse the first `k` elements, then reverse the rest.\n\n**Follow-up:** Try to come up with as many solutions as you can.",
    examples: [
      { input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]" },
      { input: "nums = [-1,-100,3,99], k = 2", output: "[3,99,-1,-100]" },
    ],
    starter: {
      python: `def rotate(nums: list[int], k: int) -> None:
    n = len(nums)
    k %= n

    def reverse(lo: int, hi: int):
        while lo < hi:
            nums[lo], nums[hi] = nums[hi], nums[lo]
            lo += 1; hi -= 1

    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)

if __name__ == "__main__":
    a = [1,2,3,4,5,6,7]; rotate(a, 3); print(a)   # [5,6,7,1,2,3,4]
    b = [-1,-100,3,99];  rotate(b, 2); print(b)   # [3,99,-1,-100]
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void}
 */
function rotate(nums, k) {
    const n = nums.length;
    k %= n;
    function reverse(lo, hi) {
        while (lo < hi) { [nums[lo++], nums[hi--]] = [nums[hi], nums[lo-1]]; }
    }
    reverse(0, n-1); reverse(0, k-1); reverse(k, n-1);
}

const a = [1,2,3,4,5,6,7]; rotate(a, 3); console.log(a);  // [5,6,7,1,2,3,4]
`,
      go: `package main

import "fmt"

func rotate(nums []int, k int) {
\tn := len(nums); k %= n
\treverse := func(lo, hi int) { for lo < hi { nums[lo],nums[hi]=nums[hi],nums[lo]; lo++; hi-- } }
\treverse(0, n-1); reverse(0, k-1); reverse(k, n-1)
}

func main() {
\ta := []int{1,2,3,4,5,6,7}; rotate(a, 3); fmt.Println(a)
}`,
      java: `import java.util.Arrays;
public class Main {
    public static void rotate(int[] nums, int k) {
        int n=nums.length; k%=n;
        reverse(nums,0,n-1); reverse(nums,0,k-1); reverse(nums,k,n-1);
    }
    static void reverse(int[] a, int lo, int hi){ while(lo<hi){int t=a[lo];a[lo]=a[hi];a[hi]=t;lo++;hi--;} }
    public static void main(String[] args){ int[] a={1,2,3,4,5,6,7}; rotate(a,3); System.out.println(Arrays.toString(a)); }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
void rotate(vector<int>& nums, int k) {
    int n=nums.size(); k%=n;
    reverse(nums.begin(),nums.end()); reverse(nums.begin(),nums.begin()+k); reverse(nums.begin()+k,nums.end());
}
int main(){ vector<int> a={1,2,3,4,5,6,7}; rotate(a,3); for(int v:a) cout<<v<<" "; cout<<endl; }`,
      rust: `fn rotate(nums: &mut Vec<i32>, k: usize) {
    let n = nums.len(); let k = k % n;
    nums.reverse(); nums[..k].reverse(); nums[k..].reverse();
}
fn main(){ let mut a=vec![1,2,3,4,5,6,7]; rotate(&mut a,3); println!("{:?}",a); }`,
      csharp: `using System;
class Program {
    static void Rotate(int[] nums, int k) {
        int n=nums.Length; k%=n;
        Reverse(nums,0,n-1); Reverse(nums,0,k-1); Reverse(nums,k,n-1);
    }
    static void Reverse(int[] a, int lo, int hi){ while(lo<hi){(a[lo],a[hi])=(a[hi],a[lo]);lo++;hi--;} }
    static void Main(){ int[] a={1,2,3,4,5,6,7}; Rotate(a,3); Console.WriteLine(string.Join(", ",a)); }
}`,
    },
  },

  {
    slug: "max-points-cards",
    title: "Maximum Points from Cards",
    category: "sliding-window",
    difficulty: "medium",
    description:
      "There are several cards arranged in a row, and each card has an associated number of points. The points are given in the integer array `cardPoints`.\n\nIn one step, you can take one card from the beginning or from the end of the row. You have to take exactly `k` cards.\n\nReturn the **maximum** score you can obtain.\n\n**Insight:** Taking `k` cards from both ends is equivalent to leaving a contiguous window of `n - k` cards in the middle. Minimize the window sum → maximize the total.",
    examples: [
      { input: "cardPoints = [1,2,3,4,5,6,1], k = 3", output: "12", explanation: "Take the three cards on the right: 1+6+5=12." },
      { input: "cardPoints = [9,7,7,9,7,7,9], k = 7", output: "55" },
    ],
    starter: {
      python: `def max_score(card_points: list[int], k: int) -> int:
    n = len(card_points)
    window = n - k
    # Find min sum window of size (n-k)
    current = sum(card_points[:window])
    min_window = current
    for i in range(window, n):
        current += card_points[i] - card_points[i - window]
        min_window = min(min_window, current)
    return sum(card_points) - min_window

if __name__ == "__main__":
    print(max_score([1,2,3,4,5,6,1], 3))  # 12
    print(max_score([9,7,7,9,7,7,9], 7))  # 55
`,
      javascript: `/**
 * @param {number[]} cardPoints
 * @param {number} k
 * @return {number}
 */
function maxScore(cardPoints, k) {
    const n = cardPoints.length, window = n - k;
    const total = cardPoints.reduce((a,b) => a+b, 0);
    let current = cardPoints.slice(0, window).reduce((a,b)=>a+b, 0);
    let minWindow = current;
    for (let i = window; i < n; i++) {
        current += cardPoints[i] - cardPoints[i - window];
        minWindow = Math.min(minWindow, current);
    }
    return total - minWindow;
}

console.log(maxScore([1,2,3,4,5,6,1], 3));  // 12
`,
      go: `package main

import "fmt"

func maxScore(cardPoints []int, k int) int {
\tn := len(cardPoints); window := n - k
\ttotal, current := 0, 0
\tfor _, v := range cardPoints { total += v }
\tfor i := 0; i < window; i++ { current += cardPoints[i] }
\tminWindow := current
\tfor i := window; i < n; i++ {
\t\tcurrent += cardPoints[i] - cardPoints[i-window]
\t\tif current < minWindow { minWindow = current }
\t}
\treturn total - minWindow
}

func main() {
\tfmt.Println(maxScore([]int{1,2,3,4,5,6,1}, 3))  // 12
}`,
      java: `public class Main {
    public static int maxScore(int[] cp, int k) {
        int n=cp.length, window=n-k, total=0, current=0;
        for(int v:cp) total+=v;
        for(int i=0;i<window;i++) current+=cp[i];
        int min=current;
        for(int i=window;i<n;i++){current+=cp[i]-cp[i-window];if(current<min)min=current;}
        return total-min;
    }
    public static void main(String[] args) { System.out.println(maxScore(new int[]{1,2,3,4,5,6,1},3)); }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
using namespace std;
int maxScore(vector<int>& cp, int k){
    int n=cp.size(),window=n-k,total=accumulate(cp.begin(),cp.end(),0),cur=0;
    for(int i=0;i<window;i++) cur+=cp[i];
    int mn=cur;
    for(int i=window;i<n;i++){cur+=cp[i]-cp[i-window];mn=min(mn,cur);}
    return total-mn;
}
int main(){vector<int>cp={1,2,3,4,5,6,1};cout<<maxScore(cp,3)<<endl;}`,
      rust: `fn max_score(card_points: Vec<i32>, k: usize) -> i32 {
    let n=card_points.len(); let window=n-k;
    let total:i32=card_points.iter().sum();
    let mut cur:i32=card_points[..window].iter().sum();
    let mut min_win=cur;
    for i in window..n{cur+=card_points[i]-card_points[i-window];if cur<min_win{min_win=cur;}}
    total-min_win
}
fn main(){println!("{}",max_score(vec![1,2,3,4,5,6,1],3));}`,
      csharp: `using System;
using System.Linq;
class Program {
    static int MaxScore(int[] cp, int k){
        int n=cp.Length,window=n-k,total=cp.Sum(),cur=0;
        for(int i=0;i<window;i++) cur+=cp[i];
        int mn=cur;
        for(int i=window;i<n;i++){cur+=cp[i]-cp[i-window];if(cur<mn)mn=cur;}
        return total-mn;
    }
    static void Main(){Console.WriteLine(MaxScore(new[]{1,2,3,4,5,6,1},3));}
}`,
    },
  },

  {
    slug: "spiral-matrix-ii",
    title: "Spiral Matrix II",
    category: "array",
    difficulty: "medium",
    description:
      "Given a positive integer `n`, generate an `n x n` matrix filled with elements from 1 to n² in spiral order.",
    examples: [
      { input: "n = 3", output: "[[1,2,3],[8,9,4],[7,6,5]]" },
      { input: "n = 1", output: "[[1]]" },
    ],
    starter: {
      python: `def generate_matrix(n: int) -> list[list[int]]:
    matrix = [[0]*n for _ in range(n)]
    top, bottom, left, right = 0, n-1, 0, n-1
    num = 1
    while top <= bottom and left <= right:
        for c in range(left, right+1): matrix[top][c] = num; num += 1
        top += 1
        for r in range(top, bottom+1): matrix[r][right] = num; num += 1
        right -= 1
        if top <= bottom:
            for c in range(right, left-1, -1): matrix[bottom][c] = num; num += 1
            bottom -= 1
        if left <= right:
            for r in range(bottom, top-1, -1): matrix[r][left] = num; num += 1
            left += 1
    return matrix

if __name__ == "__main__":
    for row in generate_matrix(3): print(row)
`,
      javascript: `/**
 * @param {number} n
 * @return {number[][]}
 */
function generateMatrix(n) {
    const matrix = Array.from({length:n},()=>new Array(n).fill(0));
    let [top,bottom,left,right,num] = [0,n-1,0,n-1,1];
    while(top<=bottom&&left<=right){
        for(let c=left;c<=right;c++) matrix[top][c]=num++;
        top++;
        for(let r=top;r<=bottom;r++) matrix[r][right]=num++;
        right--;
        if(top<=bottom){for(let c=right;c>=left;c--) matrix[bottom][c]=num++;bottom--;}
        if(left<=right){for(let r=bottom;r>=top;r--) matrix[r][left]=num++;left++;}
    }
    return matrix;
}
console.log(generateMatrix(3));`,
      go: `package main

import "fmt"

func generateMatrix(n int) [][]int {
\tmatrix := make([][]int, n)
\tfor i := range matrix { matrix[i] = make([]int, n) }
\ttop,bottom,left,right,num := 0,n-1,0,n-1,1
\tfor top<=bottom && left<=right {
\t\tfor c:=left;c<=right;c++ { matrix[top][c]=num; num++ }; top++
\t\tfor r:=top;r<=bottom;r++ { matrix[r][right]=num; num++ }; right--
\t\tif top<=bottom { for c:=right;c>=left;c-- { matrix[bottom][c]=num; num++ }; bottom-- }
\t\tif left<=right { for r:=bottom;r>=top;r-- { matrix[r][left]=num; num++ }; left++ }
\t}
\treturn matrix
}
func main() { fmt.Println(generateMatrix(3)) }`,
      java: `public class Main {
    public static int[][] generateMatrix(int n) {
        int[][] m=new int[n][n]; int top=0,bottom=n-1,left=0,right=n-1,num=1;
        while(top<=bottom&&left<=right){
            for(int c=left;c<=right;c++) m[top][c]=num++;top++;
            for(int r=top;r<=bottom;r++) m[r][right]=num++;right--;
            if(top<=bottom){for(int c=right;c>=left;c--) m[bottom][c]=num++;bottom--;}
            if(left<=right){for(int r=bottom;r>=top;r--) m[r][left]=num++;left++;}
        }
        return m;
    }
    public static void main(String[] args){for(int[] r:generateMatrix(3)){for(int v:r)System.out.print(v+" ");System.out.println();}}
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
vector<vector<int>> generateMatrix(int n){
    vector<vector<int>> m(n,vector<int>(n,0));
    int top=0,bottom=n-1,left=0,right=n-1,num=1;
    while(top<=bottom&&left<=right){
        for(int c=left;c<=right;c++) m[top][c]=num++;top++;
        for(int r=top;r<=bottom;r++) m[r][right]=num++;right--;
        if(top<=bottom){for(int c=right;c>=left;c--) m[bottom][c]=num++;bottom--;}
        if(left<=right){for(int r=bottom;r>=top;r--) m[r][left]=num++;left++;}
    }
    return m;
}
int main(){auto m=generateMatrix(3);for(auto&r:m){for(int v:r)cout<<v<<" ";cout<<endl;}}`,
      rust: `fn generate_matrix(n: usize) -> Vec<Vec<i32>> {
    let mut m=vec![vec![0i32;n];n];
    let (mut top,mut bottom,mut left,mut right,mut num)=(0usize,n-1,0usize,n-1,1i32);
    while top<=bottom&&left<=right{
        for c in left..=right{m[top][c]=num;num+=1;}if top<n{top+=1;}
        for r in top..=bottom{m[r][right]=num;num+=1;}if right>0{right-=1;}
        if top<=bottom{for c in (left..=right).rev(){m[bottom][c]=num;num+=1;}if bottom>0{bottom-=1;}}
        if left<=right{for r in (top..=bottom).rev(){m[r][left]=num;num+=1;}left+=1;}
    }
    m
}
fn main(){for r in generate_matrix(3){println!("{:?}",r);}}`,
      csharp: `using System;
class Program {
    static int[][] GenerateMatrix(int n){
        int[][] m=new int[n][];for(int i=0;i<n;i++)m[i]=new int[n];
        int top=0,bottom=n-1,left=0,right=n-1,num=1;
        while(top<=bottom&&left<=right){
            for(int c=left;c<=right;c++)m[top][c]=num++;top++;
            for(int r=top;r<=bottom;r++)m[r][right]=num++;right--;
            if(top<=bottom){for(int c=right;c>=left;c--)m[bottom][c]=num++;bottom--;}
            if(left<=right){for(int r=bottom;r>=top;r--)m[r][left]=num++;left++;}
        }
        return m;
    }
    static void Main(){foreach(var r in GenerateMatrix(3))Console.WriteLine("["+string.Join(",",r)+"]");}
}`,
    },
  },

  {
    slug: "count-good-triplets",
    title: "Count Good Triplets",
    category: "array",
    difficulty: "medium",
    description:
      "Given an array of integers `arr` and three integers `a`, `b`, `c`, find all the **good triplets**.\n\nA triplet `(arr[i], arr[j], arr[k])` is good if:\n- `0 <= i < j < k < arr.length`\n- `|arr[i] - arr[j]| <= a`\n- `|arr[j] - arr[k]| <= b`\n- `|arr[i] - arr[k]| <= c`\n\nReturn the **number** of good triplets.",
    examples: [
      { input: "arr = [3,0,1,1,9,7], a = 7, b = 2, c = 3", output: "4" },
      { input: "arr = [1,1,2,2,3], a = 0, b = 0, c = 1", output: "0" },
    ],
    starter: {
      python: `def count_good_triplets(arr: list[int], a: int, b: int, c: int) -> int:
    n = len(arr)
    count = 0
    for i in range(n-2):
        for j in range(i+1, n-1):
            if abs(arr[i]-arr[j]) > a: continue
            for k in range(j+1, n):
                if abs(arr[j]-arr[k]) <= b and abs(arr[i]-arr[k]) <= c:
                    count += 1
    return count

if __name__ == "__main__":
    print(count_good_triplets([3,0,1,1,9,7], 7, 2, 3))  # 4
    print(count_good_triplets([1,1,2,2,3], 0, 0, 1))     # 0
`,
      javascript: `/**
 * @param {number[]} arr
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @return {number}
 */
function countGoodTriplets(arr, a, b, c) {
    let count = 0;
    for (let i = 0; i < arr.length - 2; i++)
        for (let j = i+1; j < arr.length - 1; j++) {
            if (Math.abs(arr[i]-arr[j]) > a) continue;
            for (let k = j+1; k < arr.length; k++)
                if (Math.abs(arr[j]-arr[k]) <= b && Math.abs(arr[i]-arr[k]) <= c) count++;
        }
    return count;
}
console.log(countGoodTriplets([3,0,1,1,9,7], 7, 2, 3));  // 4`,
      go: `package main
import "fmt"
func countGoodTriplets(arr []int, a,b,c int) int {
\tcount,n := 0,len(arr)
\tfor i:=0;i<n-2;i++ { for j:=i+1;j<n-1;j++ { if abs(arr[i]-arr[j])>a { continue }
\t\tfor k:=j+1;k<n;k++ { if abs(arr[j]-arr[k])<=b&&abs(arr[i]-arr[k])<=c { count++ } } } }
\treturn count
}
func abs(x int) int { if x<0{return -x}; return x }
func main(){fmt.Println(countGoodTriplets([]int{3,0,1,1,9,7},7,2,3))}`,
      java: `public class Main {
    public static int countGoodTriplets(int[] arr, int a, int b, int c) {
        int count=0,n=arr.length;
        for(int i=0;i<n-2;i++) for(int j=i+1;j<n-1;j++){
            if(Math.abs(arr[i]-arr[j])>a) continue;
            for(int k=j+1;k<n;k++) if(Math.abs(arr[j]-arr[k])<=b&&Math.abs(arr[i]-arr[k])<=c) count++;
        }
        return count;
    }
    public static void main(String[] args){System.out.println(countGoodTriplets(new int[]{3,0,1,1,9,7},7,2,3));}
}`,
      cpp: `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;
int countGoodTriplets(vector<int>& arr, int a, int b, int c) {
    int count=0,n=arr.size();
    for(int i=0;i<n-2;i++) for(int j=i+1;j<n-1;j++){
        if(abs(arr[i]-arr[j])>a) continue;
        for(int k=j+1;k<n;k++) if(abs(arr[j]-arr[k])<=b&&abs(arr[i]-arr[k])<=c) count++;
    }
    return count;
}
int main(){vector<int>arr={3,0,1,1,9,7};cout<<countGoodTriplets(arr,7,2,3)<<endl;}`,
      rust: `fn count_good_triplets(arr: &[i32], a: i32, b: i32, c: i32) -> i32 {
    let n=arr.len(); let mut count=0;
    for i in 0..n-2 { for j in i+1..n-1 {
        if (arr[i]-arr[j]).abs()>a { continue; }
        for k in j+1..n { if (arr[j]-arr[k]).abs()<=b&&(arr[i]-arr[k]).abs()<=c { count+=1; } }
    } }
    count
}
fn main(){println!("{}",count_good_triplets(&[3,0,1,1,9,7],7,2,3));}`,
      csharp: `using System;
class Program {
    static int CountGoodTriplets(int[] arr, int a, int b, int c) {
        int count=0,n=arr.Length;
        for(int i=0;i<n-2;i++) for(int j=i+1;j<n-1;j++){
            if(Math.Abs(arr[i]-arr[j])>a) continue;
            for(int k=j+1;k<n;k++) if(Math.Abs(arr[j]-arr[k])<=b&&Math.Abs(arr[i]-arr[k])<=c) count++;
        }
        return count;
    }
    static void Main(){Console.WriteLine(CountGoodTriplets(new[]{3,0,1,1,9,7},7,2,3));}
}`,
    },
  },
];
