import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Implement a Trait",
    instruction:
      "Define a trait Greet with one method fn greet(&self) -> String. Create a struct EnglishGreeter and impl Greet for it returning \"Hello!\". In main, create an EnglishGreeter and print greet().",
    starter: `trait Greet {
    fn greet(&self) -> String;
}

struct EnglishGreeter;

impl Greet for EnglishGreeter {
    fn greet(&self) -> String {
        // TODO: "Hello!".to_string()
    }
}

fn main() {
    let g = EnglishGreeter;
    println!("{}", g.greet());
}`,
    expectedOutput: ["Hello!"],
    hint: "return \"Hello!\".to_string();",
  },
  {
    title: "Trait and Polymorphism",
    instruction:
      "Have a trait Sound with fn make_sound(&self) -> &str. Dog returns \"Woof\", Cat returns \"Meow\". In main, put a Dog and Cat in a vec of &dyn Sound, loop and print each make_sound().",
    starter: `trait Sound {
    fn make_sound(&self) -> &str;
}

struct Dog;
impl Sound for Dog {
    fn make_sound(&self) -> &str {
        "Woof"
    }
}

struct Cat;
impl Sound for Cat {
    fn make_sound(&self) -> &str {
        "Meow"
    }
}

fn main() {
    let animals: Vec<&dyn Sound> = vec![&Dog {}, &Cat {}];
    for a in animals {
        println!("{}", a.make_sound());
    }
}`,
    expectedOutput: ["Woof", "Meow"],
    hint: "Code is complete — run it.",
  },
];
