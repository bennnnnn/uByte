import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "if Statement",
    instruction:
      "An `if` statement runs a block of code only when a condition is true. Check if `x = 15` is greater than 10. If it is, print \"greater than 10\".",
    starter: `x = 15
# TODO: if x > 10, print "greater than 10"
`,
    expectedOutput: ["greater than 10"],
    hint: "if x > 10:\n    print(\"greater than 10\")",
  },
  {
    title: "if-else",
    instruction:
      "An `if-else` block handles both cases. A student scored 72. If the score is 60 or higher print \"Pass\", otherwise print \"Fail\".",
    starter: `score = 72
# TODO: print "Pass" if score >= 60, else print "Fail"
`,
    expectedOutput: ["Pass"],
    hint: "if score >= 60:\n    print(\"Pass\")\nelse:\n    print(\"Fail\")",
  },
  {
    title: "elif Chain",
    instruction:
      "Use `elif` to check multiple conditions in order. Given `grade = 85`, print \"A\" for 90+, \"B\" for 80+, \"C\" for 70+, and \"F\" otherwise.",
    starter: `grade = 85
# TODO: print the letter grade using if/elif/else
`,
    expectedOutput: ["B"],
    hint: "if grade >= 90:\n    print(\"A\")\nelif grade >= 80:\n    print(\"B\")\nelif grade >= 70:\n    print(\"C\")\nelse:\n    print(\"F\")",
  },
  {
    title: "Ternary Expression",
    instruction:
      "Python has a one-line conditional expression: `value_if_true if condition else value_if_false`. Use it to set `label` to \"even\" or \"odd\" based on whether `n = 4` is divisible by 2, then print the label.",
    starter: `n = 4
# TODO: label = "even" if ... else "odd"
label = ""
print(label)`,
    expectedOutput: ["even"],
    hint: "label = \"even\" if n % 2 == 0 else \"odd\"",
  },
  {
    title: "FizzBuzz",
    instruction:
      "Classic FizzBuzz! Loop from 1 to 15 using `range(1, 16)`. For multiples of 3 print \"Fizz\", multiples of 5 print \"Buzz\", multiples of both print \"FizzBuzz\", otherwise print the number. Check FizzBuzz first!",
    starter: `for i in range(1, 16):
    # TODO: FizzBuzz logic
    print(i)`,
    expectedOutput: ["Fizz", "Buzz", "FizzBuzz"],
    hint: "if i % 15 == 0: print(\"FizzBuzz\") elif i % 3 == 0: print(\"Fizz\") elif i % 5 == 0: print(\"Buzz\") else: print(i)",
  },
];
