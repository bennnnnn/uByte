import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Implement an Interface",
    instruction:
      "Define an interface `Greeter` with a single method `String greet()`. Create a class `EnglishGreeter` that implements Greeter and returns \"Hello!\". In main, create an EnglishGreeter, call greet(), and print the result.",
    starter: `public class Main {
    public static void main(String[] args) {
        Greeter g = new EnglishGreeter();
        // TODO: print g.greet()
    }
}

interface Greeter {
    // TODO: String greet();
}

class EnglishGreeter implements Greeter {
    // TODO: implement greet()
}`,
    expectedOutput: ["Hello!"],
    hint: "String greet(); and @Override public String greet() { return \"Hello!\"; }",
  },
  {
    title: "Polymorphism",
    instruction:
      "Have an interface Sound with method makeSound(). Dog returns \"Woof\", Cat returns \"Meow\". In main, put a Dog and a Cat in an array of Sound, loop and print each makeSound().",
    starter: `public class Main {
    public static void main(String[] args) {
        Sound[] animals = { new Dog(), new Cat() };
        // TODO: for each animal print makeSound()
    }
}

interface Sound {
    String makeSound();
}

class Dog implements Sound {
    @Override
    public String makeSound() { return "Woof"; }
}

class Cat implements Sound {
    // TODO: makeSound returns "Meow"
}`,
    expectedOutput: ["Woof", "Meow"],
    hint: "for (Sound s : animals) System.out.println(s.makeSound());",
  },
];
