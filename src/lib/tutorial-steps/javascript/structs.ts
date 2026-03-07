import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Object Literal",
    instruction:
      "Object literals are the simplest way to group data. Create `person` with `name: \"Alice\"` and `age: 30`, then log both properties on separate lines.",
    starter: `// TODO: const person = { name: "Alice", age: 30 }
const person = {};
console.log(person.name);
console.log(person.age);`,
    expectedOutput: ["Alice", "30"],
    hint: "const person = { name: \"Alice\", age: 30 };",
  },
  {
    title: "Class",
    instruction:
      "ES6 classes provide a familiar OOP syntax. Define a `Person` class with a `constructor(name, age)` and a `greet()` method returning `\"Hi, I'm \" + name + \"!\"`. Create Alice and log her greeting.",
    starter: `class Person {
  constructor(name, age) {
    // TODO: store name and age
  }

  // TODO: greet() returning "Hi, I'm <name>!"
}

const p = new Person("Alice", 30);
console.log(p.greet());`,
    expectedOutput: ["Hi, I'm Alice!"],
    hint: "this.name = name;\nthis.age = age;\ngreet() { return `Hi, I'm ${this.name}!`; }",
  },
  {
    title: "Inheritance with extends",
    instruction:
      "Use `extends` to inherit. Create `Employee` extending `Person` with an extra `role` property. Call `super(name, age)` in the constructor. Log name and role.",
    starter: `class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

// TODO: class Employee extends Person with role

const e = new Employee("Bob", 25, "Engineer");
console.log(e.name);
console.log(e.role);`,
    expectedOutput: ["Bob", "Engineer"],
    hint: "class Employee extends Person {\n  constructor(name, age, role) {\n    super(name, age);\n    this.role = role;\n  }\n}",
  },
  {
    title: "static Method",
    instruction:
      "A `static` method belongs to the class, not instances. Add `Person.validate(age)` that returns `true` if `age >= 0`. Log `Person.validate(25)`.",
    starter: `class Person {
  // TODO: static validate(age) returning age >= 0
}

console.log(Person.validate(25));`,
    expectedOutput: ["true"],
    hint: "static validate(age) { return age >= 0; }",
  },
  {
    title: "getter and setter",
    instruction:
      "`get` and `set` define computed properties. Add a `fullName` getter to `Name` that returns `first + \" \" + last`. Create `Name(\"John\", \"Doe\")` and log `fullName`.",
    starter: `class Name {
  constructor(first, last) {
    this.first = first;
    this.last = last;
  }

  // TODO: get fullName() returning first + " " + last
}

const n = new Name("John", "Doe");
console.log(n.fullName);`,
    expectedOutput: ["John Doe"],
    hint: "get fullName() { return `${this.first} ${this.last}`; }",
  },
];
