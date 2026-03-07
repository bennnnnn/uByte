import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "std::condition_variable",
    instruction:
      "A `condition_variable` lets one thread wait for a signal from another. A producer sets `ready = true` and notifies; a consumer waits. Both print their messages. Run the code and observe the order.",
    starter: `#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void producer() {
    std::lock_guard<std::mutex> lock(mtx);
    ready = true;
    cv.notify_one();
    std::cout << "produced" << std::endl;
}

void consumer() {
    std::unique_lock<std::mutex> lock(mtx);
    // TODO: cv.wait(lock, []{ return ready; }); then print "consumed"
}

int main() {
    std::thread t1(consumer);
    std::thread t2(producer);
    t1.join(); t2.join();
    return 0;
}`,
    expectedOutput: ["produced", "consumed"],
    hint: "cv.wait(lock, []{ return ready; });\nstd::cout << \"consumed\" << std::endl;",
  },
  {
    title: "std::promise and std::future",
    instruction:
      "A `promise` sends a value to a `future`. In one thread set the promise value to `42`. In the main thread, get it from the future and print.",
    starter: `#include <iostream>
#include <thread>
#include <future>

int main() {
    std::promise<int> p;
    std::future<int> f = p.get_future();

    std::thread t([&p]() {
        // TODO: p.set_value(42)
    });

    std::cout << f.get() << std::endl;
    t.join();
    return 0;
}`,
    expectedOutput: ["42"],
    hint: "p.set_value(42);",
  },
  {
    title: "Producer / Consumer Queue",
    instruction:
      "Build a thread-safe queue using a mutex and condition variable. A producer pushes 1, 2, 3. A consumer pops and prints each. Complete the consumer's pop logic.",
    starter: `#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>

std::queue<int> q;
std::mutex mtx;
std::condition_variable cv;

void producer() {
    for (int i = 1; i <= 3; i++) {
        std::lock_guard<std::mutex> lk(mtx);
        q.push(i);
        cv.notify_one();
    }
}

void consumer() {
    for (int i = 0; i < 3; i++) {
        std::unique_lock<std::mutex> lk(mtx);
        cv.wait(lk, []{ return !q.empty(); });
        // TODO: pop from q and print
    }
}

int main() {
    std::thread t1(producer);
    std::thread t2(consumer);
    t1.join(); t2.join();
    return 0;
}`,
    expectedOutput: ["1", "2", "3"],
    hint: "int val = q.front();\nq.pop();\nstd::cout << val << std::endl;",
  },
  {
    title: "std::atomic Flag",
    instruction:
      "`std::atomic_flag` is the simplest atomic type — a lock-free boolean. Use it to implement a spinlock that protects a counter incremented by two threads. Print the final value of 2.",
    starter: `#include <iostream>
#include <thread>
#include <atomic>

std::atomic_flag lock = ATOMIC_FLAG_INIT;
int counter = 0;

void increment() {
    while (lock.test_and_set(std::memory_order_acquire)) {}
    counter++;
    lock.clear(std::memory_order_release);
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    t1.join(); t2.join();
    // TODO: print counter
    return 0;
}`,
    expectedOutput: ["2"],
    hint: "std::cout << counter << std::endl;",
  },
];
