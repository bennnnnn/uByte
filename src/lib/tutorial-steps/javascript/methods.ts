import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Method on a Class",
    instruction:
      "Add a `deposit(amount)` method to `BankAccount` that adds to `this.balance`. Deposit 500 into an account starting at 1000 and log the balance.",
    starter: `class BankAccount {
  constructor(balance = 0) {
    this.balance = balance;
  }

  // TODO: deposit(amount) adds to balance
}

const acc = new BankAccount(1000);
acc.deposit(500);
console.log(acc.balance);`,
    expectedOutput: ["1500"],
    hint: "deposit(amount) { this.balance += amount; }",
  },
  {
    title: "Method Chaining",
    instruction:
      "Return `this` from methods to enable chaining. Add `add(n)` and `multiply(n)` methods to `Builder` that each return `this`. Chain them: start at 2, add 3, multiply by 4. Log the value.",
    starter: `class Builder {
  constructor(value) { this.value = value; }

  // TODO: add(n) — add n to value, return this
  // TODO: multiply(n) — multiply value by n, return this
}

const result = new Builder(2).add(3).multiply(4);
console.log(result.value);`,
    expectedOutput: ["20"],
    hint: "add(n) { this.value += n; return this; }\nmultiply(n) { this.value *= n; return this; }",
  },
  {
    title: "Prototype Method",
    instruction:
      "Before classes, methods were added via `prototype`. Add a `greet()` method to the `Animal` constructor function via `Animal.prototype.greet`. Create a dog and call greet.",
    starter: `function Animal(name) {
  this.name = name;
}

// TODO: Animal.prototype.greet = function() returning "I'm " + this.name

const dog = new Animal("dog");
console.log(dog.greet());`,
    expectedOutput: ["I'm dog"],
    hint: "Animal.prototype.greet = function() { return \"I'm \" + this.name; };",
  },
  {
    title: "Symbol",
    instruction:
      "`Symbol()` creates a unique property key — great for hiding implementation details. Add a private balance using a Symbol key to `Wallet`. Print the balance via the public `getBalance()` method.",
    starter: `const _balance = Symbol("balance");

class Wallet {
  constructor(amount) {
    this[_balance] = amount;
  }

  // TODO: getBalance() returning this[_balance]
}

const w = new Wallet(500);
console.log(w.getBalance());`,
    expectedOutput: ["500"],
    hint: "getBalance() { return this[_balance]; }",
  },
  {
    title: "toString Override",
    instruction:
      "Override `toString()` to control how an object prints. Add `toString()` to `Point` so that `console.log(p)` shows `\"Point(3, 4)\"`.",
    starter: `class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // TODO: toString() returning "Point(x, y)"
}

const p = new Point(3, 4);
console.log(p.toString());`,
    expectedOutput: ["Point(3, 4)"],
    hint: "toString() { return `Point(${this.x}, ${this.y})`; }",
  },
];
