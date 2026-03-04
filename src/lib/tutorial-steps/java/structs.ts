import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "Define a Class",
    instruction:
      "Define a class `Point` with two int fields `x` and `y`, a constructor that sets both, and getters getX() and getY(). In main, create a Point(3, 4) and print its x and y.",
    starter: `public class Main {
    public static void main(String[] args) {
        Point p = new Point(3, 4);
        // TODO: print p.getX() and p.getY()
    }
}

// TODO: class Point with x, y, constructor, getX, getY
class Point {
}`,
    expectedOutput: ["3", "4"],
    hint: "class Point { private int x, y; public Point(int x, int y) { this.x=x; this.y=y; } public int getX() { return x; } public int getY() { return y; } }",
  },
  {
    title: "Constructor and Fields",
    instruction:
      "Define a class `Book` with String title and int pages. Constructor sets both. In main, create Book(\"Java Guide\", 200) and print the title and pages.",
    starter: `public class Main {
    public static void main(String[] args) {
        Book b = new Book("Java Guide", 200);
        // TODO: print b.getTitle() and b.getPages()
    }
}

class Book {
    // TODO: fields, constructor, getters
}`,
    expectedOutput: ["Java Guide", "200"],
    hint: "private String title; private int pages; constructor Book(String title, int pages); getTitle() and getPages().",
  },
];
