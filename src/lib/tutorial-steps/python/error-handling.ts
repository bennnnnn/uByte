import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "try / except",
    instruction:
      "Wrap risky code in a `try` block and handle errors in `except`. Try to convert `\"abc\"` to an int. Catch the `ValueError` and print `\"Invalid number\"`.",
    starter: `value = "abc"
# TODO: try int(value), except ValueError print "Invalid number"
`,
    expectedOutput: ["Invalid number"],
    hint: "try:\n    print(int(value))\nexcept ValueError:\n    print(\"Invalid number\")",
  },
  {
    title: "Catching Multiple Exceptions",
    instruction:
      "You can catch multiple exception types in one block. Call `risky(val)` where `val = None`. Handle both `TypeError` and `ValueError` by printing `\"Caught: <error>\"`. The function tries to divide 10 by val.",
    starter: `def risky(val):
    return 10 / val

val = None
try:
    print(risky(val))
except (TypeError, ValueError) as e:
    # TODO: print "Caught: <error>"
    pass`,
    expectedOutput: ["Caught: unsupported operand type(s) for /: 'int' and 'NoneType'"],
    hint: "print(f\"Caught: {e}\")",
  },
  {
    title: "else and finally",
    instruction:
      "`else` runs when no exception occurred; `finally` always runs. Attempt to open a file called `\"missing.txt\"`. If successful print \"opened\"; on `FileNotFoundError` print \"not found\". Always print \"done\".",
    starter: `try:
    f = open("missing.txt")
    print("opened")
except FileNotFoundError:
    # TODO: print "not found"
    pass
finally:
    # TODO: print "done"
    pass`,
    expectedOutput: ["not found", "done"],
    hint: "print(\"not found\")  # in except\nprint(\"done\")  # in finally",
  },
  {
    title: "Raise an Exception",
    instruction:
      "Use `raise` to throw your own exception. Define `divide(a, b)` that raises a `ValueError(\"Cannot divide by zero\")` when `b == 0`, otherwise returns `a / b`. Call it with `10, 0` and print the caught message.",
    starter: `def divide(a, b):
    # TODO: raise ValueError if b == 0, else return a / b
    return a / b

try:
    print(divide(10, 0))
except ValueError as e:
    print(e)`,
    expectedOutput: ["Cannot divide by zero"],
    hint: "if b == 0:\n    raise ValueError(\"Cannot divide by zero\")",
  },
  {
    title: "Custom Exception",
    instruction:
      "Create your own exception class by subclassing `Exception`. Define `InsufficientFundsError(Exception)`. Raise it in `withdraw(balance, amount)` when `amount > balance`. Catch it and print `\"Insufficient funds\"`.",
    starter: `class InsufficientFundsError(Exception):
    pass

def withdraw(balance, amount):
    # TODO: raise InsufficientFundsError if amount > balance
    return balance - amount

try:
    withdraw(100, 200)
except InsufficientFundsError:
    print("Insufficient funds")`,
    expectedOutput: ["Insufficient funds"],
    hint: "if amount > balance:\n    raise InsufficientFundsError()",
  },
];
