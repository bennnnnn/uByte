import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Objects Are References",
    instruction:
      "In Python, variables hold references to objects — not the objects themselves. Assign `a = [1, 2, 3]` and `b = a`. Append 4 to `b`, then print `a`. What do you expect?",
    starter: `a = [1, 2, 3]
b = a
# TODO: append 4 to b, then print a
`,
    expectedOutput: ["[1, 2, 3, 4]"],
    hint: "b.append(4)\nprint(a)  # a and b point to the same list",
  },
  {
    title: "Copying a List",
    instruction:
      "To get an independent copy of a list, use `.copy()` or `list()`. Assign `a = [1, 2, 3]`, copy it to `b`, append 4 to `b`, then print both `a` and `b` to confirm they're separate.",
    starter: `a = [1, 2, 3]
# TODO: b = a.copy()
b = a
b.append(4)
print(a)
print(b)`,
    expectedOutput: ["[1, 2, 3]", "[1, 2, 3, 4]"],
    hint: "b = a.copy()",
  },
  {
    title: "Mutability and Immutability",
    instruction:
      "Lists are mutable; strings and tuples are immutable. Try reassigning `s = \"hello\"` to uppercase — notice `s` points to a new object. Print the original and then the uppercase version.",
    starter: `s = "hello"
upper = s.upper()
print(s)
print(upper)`,
    expectedOutput: ["hello", "HELLO"],
    hint: "upper = s.upper() — s itself is unchanged because strings are immutable.",
  },
  {
    title: "id() and is",
    instruction:
      "The built-in `id()` returns the memory address of an object. Create `x = [1, 2]` and `y = x`. Use `is` to check if they're the same object and print the result.",
    starter: `x = [1, 2]
y = x
# TODO: print whether x is y
`,
    expectedOutput: ["True"],
    hint: "print(x is y)",
  },
  {
    title: "Pass by Object Reference",
    instruction:
      "Python passes object references to functions. Define `add_item(lst, item)` that appends `item` to `lst`. Pass `[\"a\", \"b\"]` and `\"c\"`, then print the list — the original is modified in place.",
    starter: `# TODO: define add_item(lst, item) that appends item to lst

my_list = ["a", "b"]
add_item(my_list, "c")
print(my_list)`,
    expectedOutput: ["['a', 'b', 'c']"],
    hint: "def add_item(lst, item):\n    lst.append(item)",
  },
];
