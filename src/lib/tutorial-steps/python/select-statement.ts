import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "asyncio.Queue",
    instruction:
      "asyncio.Queue lets coroutines communicate safely. Create a `Queue`, put `\"hello\"` in it, then get and print the item.",
    starter: `import asyncio

async def main():
    q = asyncio.Queue()
    await q.put("hello")
    # TODO: get from q and print
    item = None
    print(item)

asyncio.run(main())`,
    expectedOutput: ["hello"],
    hint: "item = await q.get()\nprint(item)",
  },
  {
    title: "Producer / Consumer",
    instruction:
      "Build a producer that puts numbers 1–3 into a queue and a consumer that gets and prints them. Use `asyncio.gather` to run both concurrently.",
    starter: `import asyncio

async def producer(q):
    for i in range(1, 4):
        await q.put(i)

async def consumer(q):
    # TODO: get 3 items from q and print each
    pass

async def main():
    q = asyncio.Queue()
    await asyncio.gather(producer(q), consumer(q))

asyncio.run(main())`,
    expectedOutput: ["1", "2", "3"],
    hint: "for _ in range(3):\n    item = await q.get()\n    print(item)",
  },
  {
    title: "asyncio.wait_for — Timeout",
    instruction:
      "`asyncio.wait_for` raises `asyncio.TimeoutError` if a coroutine takes too long. Wrap a coroutine that sleeps for 10 seconds with a 0.01-second timeout. Catch the timeout and print `\"timed out\"`.",
    starter: `import asyncio

async def slow():
    await asyncio.sleep(10)

async def main():
    try:
        await asyncio.wait_for(slow(), timeout=0.01)
    except asyncio.TimeoutError:
        # TODO: print "timed out"
        pass

asyncio.run(main())`,
    expectedOutput: ["timed out"],
    hint: "print(\"timed out\")",
  },
  {
    title: "asyncio.create_task",
    instruction:
      "`create_task` schedules a coroutine to run concurrently without blocking. Create tasks for `task_a()` (prints `\"A\"`) and `task_b()` (prints `\"B\"`), then await both.",
    starter: `import asyncio

async def task_a():
    print("A")

async def task_b():
    print("B")

async def main():
    # TODO: t1 = asyncio.create_task(task_a()), t2 = create_task(task_b()), await both
    pass

asyncio.run(main())`,
    expectedOutput: ["A", "B"],
    hint: "t1 = asyncio.create_task(task_a())\nt2 = asyncio.create_task(task_b())\nawait t1\nawait t2",
  },
];
