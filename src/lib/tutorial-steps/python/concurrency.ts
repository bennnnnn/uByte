import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Threading Basics",
    instruction:
      "The `threading` module lets you run code concurrently. Create a `Thread` that runs a function `task()` which prints `\"Thread running\"`. Start the thread with `.start()` and wait for it with `.join()`.",
    starter: `import threading

def task():
    # TODO: print "Thread running"
    pass

# TODO: create thread, start, join
`,
    expectedOutput: ["Thread running"],
    hint: "def task(): print(\"Thread running\")\nt = threading.Thread(target=task)\nt.start()\nt.join()",
  },
  {
    title: "Thread with Arguments",
    instruction:
      "Pass data to a thread via `args=`. Create a thread that calls `greet(name)` — which prints `\"Hello, <name>\"` — with the argument `\"Alice\"`. Start and join it.",
    starter: `import threading

def greet(name):
    print(f"Hello, {name}")

# TODO: create Thread(target=greet, args=("Alice",)), start, join
`,
    expectedOutput: ["Hello, Alice"],
    hint: "t = threading.Thread(target=greet, args=(\"Alice\",))\nt.start()\nt.join()",
  },
  {
    title: "async / await",
    instruction:
      "Python's `asyncio` enables concurrent I/O without threads. Define an `async def say(msg)` function that prints `msg`. Run it using `asyncio.run()` with `\"async hello\"`.",
    starter: `import asyncio

# TODO: async def say(msg): print msg

asyncio.run(say("async hello"))`,
    expectedOutput: ["async hello"],
    hint: "async def say(msg):\n    print(msg)",
  },
  {
    title: "await asyncio.sleep",
    instruction:
      "`asyncio.sleep` yields control without blocking. Define `async def countdown(n)` that prints numbers from n down to 1 (each on its own line) with `await asyncio.sleep(0)` between each. Run it with n=3.",
    starter: `import asyncio

async def countdown(n):
    # TODO: loop from n down to 1, print each, await asyncio.sleep(0)
    pass

asyncio.run(countdown(3))`,
    expectedOutput: ["3", "2", "1"],
    hint: "for i in range(n, 0, -1):\n    print(i)\n    await asyncio.sleep(0)",
  },
  {
    title: "asyncio.gather",
    instruction:
      "`asyncio.gather` runs multiple coroutines concurrently. Define two coroutines `task_a()` and `task_b()` that print `\"A\"` and `\"B\"` respectively. Gather them and run — both should print.",
    starter: `import asyncio

async def task_a():
    print("A")

async def task_b():
    print("B")

# TODO: asyncio.run(asyncio.gather(task_a(), task_b()))
`,
    expectedOutput: ["A", "B"],
    hint: "asyncio.run(asyncio.gather(task_a(), task_b()))",
  },
];
