import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Duck Typing",
    instruction:
      "JavaScript uses duck typing — if an object has the right method, it works. Define `makeSound(animal)` that calls `animal.speak()`. Pass both a Dog and a Cat (each with `speak()`) and log the results.",
    starter: `class Dog { speak() { return "Woof!"; } }
class Cat { speak() { return "Meow!"; } }

// TODO: function makeSound(animal) returning animal.speak()

console.log(makeSound(new Dog()));
console.log(makeSound(new Cat()));`,
    expectedOutput: ["Woof!", "Meow!"],
    hint: "function makeSound(animal) { return animal.speak(); }",
  },
  {
    title: "Simulating an Interface with hasOwnProperty",
    instruction:
      "JavaScript has no formal interfaces, but you can check at runtime. Write `ensureSpeakable(animal)` that throws if `animal` has no `speak` method, otherwise calls and returns `animal.speak()`.",
    starter: `class Dog { speak() { return "Woof!"; } }

function ensureSpeakable(animal) {
  // TODO: if typeof animal.speak !== "function", throw Error("No speak method")
  return animal.speak();
}

console.log(ensureSpeakable(new Dog()));`,
    expectedOutput: ["Woof!"],
    hint: "if (typeof animal.speak !== \"function\") throw new Error(\"No speak method\");",
  },
  {
    title: "Mixin Pattern",
    instruction:
      "Mixins add capabilities to classes without inheritance. Define a `Serializable` mixin that adds `serialize()` returning `JSON.stringify(this)`. Apply it to `User`. Log `new User(\"Alice\").serialize()`.",
    starter: `const Serializable = (Base) => class extends Base {
  // TODO: serialize() returning JSON.stringify(this)
};

class User {
  constructor(name) { this.name = name; }
}

const SerializableUser = Serializable(User);
console.log(new SerializableUser("Alice").serialize());`,
    expectedOutput: ['{"name":"Alice"}'],
    hint: "serialize() { return JSON.stringify(this); }",
  },
  {
    title: "Symbol.iterator",
    instruction:
      "Implement `Symbol.iterator` to make your class iterable with `for...of`. Add an iterator to `Range` that yields numbers from `start` to `end`. Log each value for `Range(1, 3)`.",
    starter: `class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  // TODO: [Symbol.iterator]() generator yielding start to end
}

for (const n of new Range(1, 3)) {
  console.log(n);
}`,
    expectedOutput: ["1", "2", "3"],
    hint: "*[Symbol.iterator]() { for (let i = this.start; i <= this.end; i++) yield i; }",
  },
];
