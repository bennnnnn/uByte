import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "std::vector",
    instruction:
      "`std::vector` is a dynamic array. Create a vector with values `{10, 20, 30}` and print each element using a range-based for loop.",
    starter: `#include <iostream>
#include <vector>

int main() {
    // TODO: create vector{10,20,30}, print each
    return 0;
}`,
    expectedOutput: ["10", "20", "30"],
    hint: "std::vector<int> nums = {10, 20, 30};\nfor (int n : nums) std::cout << n << std::endl;",
  },
  {
    title: "push_back and pop_back",
    instruction:
      "`push_back` appends to a vector; `pop_back` removes the last element. Start with `{1, 2, 3}`, push 4, then pop. Print the final size.",
    starter: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    // TODO: push_back(4), pop_back(), print size
    return 0;
}`,
    expectedOutput: ["3"],
    hint: "v.push_back(4);\nv.pop_back();\nstd::cout << v.size() << std::endl;",
  },
  {
    title: "C-Style Array",
    instruction:
      "C++ also has fixed-size C-style arrays. Declare `int nums[5] = {1,2,3,4,5}` and print the sum of all elements.",
    starter: `#include <iostream>

int main() {
    int nums[5] = {1, 2, 3, 4, 5};
    int sum = 0;
    // TODO: sum all elements and print
    return 0;
}`,
    expectedOutput: ["15"],
    hint: "for (int i = 0; i < 5; i++) sum += nums[i];\nstd::cout << sum << std::endl;",
  },
  {
    title: "std::array",
    instruction:
      "`std::array` is a safer fixed-size alternative. Create `std::array<int,3> arr = {7, 8, 9}` and print the element at index 1.",
    starter: `#include <iostream>
#include <array>

int main() {
    std::array<int, 3> arr = {7, 8, 9};
    // TODO: print arr[1]
    return 0;
}`,
    expectedOutput: ["8"],
    hint: "std::cout << arr[1] << std::endl;",
  },
  {
    title: "Sorting a Vector",
    instruction:
      "`std::sort` from `<algorithm>` sorts in place. Sort `{5, 2, 8, 1, 4}` and print the first and last element.",
    starter: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {5, 2, 8, 1, 4};
    // TODO: sort v, print first and last
    return 0;
}`,
    expectedOutput: ["1", "8"],
    hint: "std::sort(v.begin(), v.end());\nstd::cout << v.front() << std::endl << v.back() << std::endl;",
  },
];
