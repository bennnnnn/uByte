import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "std::thread Basics",
    instruction:
      "`std::thread` runs a function concurrently. Create a thread that calls `task()` which prints `\"Thread running\"`. Start the thread and call `.join()` to wait for it.",
    starter: `#include <iostream>
#include <thread>

void task() {
    // TODO: print "Thread running"
}

int main() {
    // TODO: create thread, join it
    return 0;
}`,
    expectedOutput: ["Thread running"],
    hint: "void task() { std::cout << \"Thread running\" << std::endl; }\nstd::thread t(task);\nt.join();",
  },
  {
    title: "Thread with Lambda",
    instruction:
      "Threads accept lambdas. Create a thread using a lambda that prints `\"Hello from thread\"`, start it, and join.",
    starter: `#include <iostream>
#include <thread>

int main() {
    // TODO: std::thread t([]{ print "Hello from thread" }); join
    return 0;
}`,
    expectedOutput: ["Hello from thread"],
    hint: "std::thread t([]{ std::cout << \"Hello from thread\" << std::endl; });\nt.join();",
  },
  {
    title: "std::mutex",
    instruction:
      "A mutex prevents data races. Two threads increment a shared counter. Use `std::mutex::lock()` and `unlock()` (or `std::lock_guard`) to protect the counter, then print its final value of 2.",
    starter: `#include <iostream>
#include <thread>
#include <mutex>

int counter = 0;
std::mutex mtx;

void increment() {
    // TODO: lock mtx, increment counter, unlock
    counter++;
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    t1.join(); t2.join();
    std::cout << counter << std::endl;
    return 0;
}`,
    expectedOutput: ["2"],
    hint: "std::lock_guard<std::mutex> lock(mtx);\ncounter++;",
  },
  {
    title: "std::async",
    instruction:
      "`std::async` launches a task and returns a `std::future`. Call `std::async(std::launch::async, add, 3, 4)` and get the result with `.get()`. Print it.",
    starter: `#include <iostream>
#include <future>

int add(int a, int b) { return a + b; }

int main() {
    // TODO: auto f = std::async(std::launch::async, add, 3, 4); print f.get()
    return 0;
}`,
    expectedOutput: ["7"],
    hint: "auto f = std::async(std::launch::async, add, 3, 4);\nstd::cout << f.get() << std::endl;",
  },
  {
    title: "std::atomic",
    instruction:
      "`std::atomic<int>` provides lock-free thread-safe operations. Replace the plain `int counter` with `std::atomic<int> counter(0)`. Increment from two threads and print the final count of 2.",
    starter: `#include <iostream>
#include <thread>
#include <atomic>

// TODO: std::atomic<int> counter(0);
int counter = 0;

void increment() { counter++; }

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    t1.join(); t2.join();
    std::cout << counter << std::endl;
    return 0;
}`,
    expectedOutput: ["2"],
    hint: "std::atomic<int> counter(0);",
  },
];
