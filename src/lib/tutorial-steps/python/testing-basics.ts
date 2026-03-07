import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "assert Statement",
    instruction:
      "The simplest Python test is an `assert`. Assert that `2 + 2 == 4` and then assert that `add(3, 5)` returns `8`. If both pass, print `\"All checks passed\"`.",
    starter: `def add(a, b):
    return a + b

# TODO: assert 2 + 2 == 4
# TODO: assert add(3, 5) == 8
print("All checks passed")`,
    expectedOutput: ["All checks passed"],
    hint: "assert 2 + 2 == 4\nassert add(3, 5) == 8",
  },
  {
    title: "unittest TestCase",
    instruction:
      "Python's built-in `unittest` uses classes. Define a `TestAdd` class that inherits from `unittest.TestCase` with a method `test_add` that asserts `add(3, 5) == 8`. Run it with `unittest.main()`.",
    starter: `import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    # TODO: def test_add(self): assert add(3, 5) == 8
    pass

unittest.main(argv=[""], exit=False, verbosity=0)
print("Tests passed")`,
    expectedOutput: ["Tests passed"],
    hint: "def test_add(self):\n    self.assertEqual(add(3, 5), 8)",
  },
  {
    title: "assertEqual and assertRaises",
    instruction:
      "`assertRaises` verifies that code raises a specific exception. Add a second test method `test_divide_by_zero` that asserts `divide(10, 0)` raises `ValueError`. (Assume `divide` raises it.)",
    starter: `import unittest

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

class TestDivide(unittest.TestCase):
    def test_divide(self):
        self.assertEqual(divide(10, 2), 5.0)

    # TODO: def test_divide_by_zero(self): assertRaises ValueError

unittest.main(argv=[""], exit=False, verbosity=0)
print("Tests passed")`,
    expectedOutput: ["Tests passed"],
    hint: "def test_divide_by_zero(self):\n    with self.assertRaises(ValueError):\n        divide(10, 0)",
  },
  {
    title: "Test Setup with setUp",
    instruction:
      "`setUp` runs before each test. Define a `TestCounter` class with `setUp` that creates `self.count = Counter(0)` and a `test_increment` that asserts the count after one increment is 1.",
    starter: `import unittest

class Counter:
    def __init__(self, n):
        self.n = n
    def increment(self):
        self.n += 1

class TestCounter(unittest.TestCase):
    def setUp(self):
        # TODO: self.count = Counter(0)
        pass

    def test_increment(self):
        self.count.increment()
        self.assertEqual(self.count.n, 1)

unittest.main(argv=[""], exit=False, verbosity=0)
print("Tests passed")`,
    expectedOutput: ["Tests passed"],
    hint: "self.count = Counter(0)",
  },
];
