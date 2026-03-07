import type { TutorialStep } from "../types";

export const steps: TutorialStep[] = [
  {
    title: "if Statement",
    instruction:
      "An `if` statement runs a block only when its condition is truthy. Check if `x = 15` is greater than 10. If so, use `console.log` to print `\"greater than 10\"`.",
    starter: `const x = 15;
// TODO: if x > 10, console.log("greater than 10")
`,
    expectedOutput: ["greater than 10"],
    hint: "if (x > 10) { console.log(\"greater than 10\"); }",
  },
  {
    title: "if-else",
    instruction:
      "An `if-else` handles both paths. A student scored 72. If `score >= 60` print `\"Pass\"`, else print `\"Fail\"`.",
    starter: `const score = 72;
// TODO: print "Pass" if score >= 60, else "Fail"
`,
    expectedOutput: ["Pass"],
    hint: "if (score >= 60) { console.log(\"Pass\"); } else { console.log(\"Fail\"); }",
  },
  {
    title: "else if Chain",
    instruction:
      "Chain conditions with `else if`. Given `grade = 85`, print `\"A\"` for 90+, `\"B\"` for 80+, `\"C\"` for 70+, and `\"F\"` otherwise.",
    starter: `const grade = 85;
// TODO: print the letter grade
`,
    expectedOutput: ["B"],
    hint: "if (grade >= 90) console.log(\"A\"); else if (grade >= 80) console.log(\"B\"); else if (grade >= 70) console.log(\"C\"); else console.log(\"F\");",
  },
  {
    title: "Ternary Operator",
    instruction:
      "The ternary `condition ? a : b` is a compact one-liner. Use it to set `label` to `\"even\"` or `\"odd\"` for `n = 4`, then print it.",
    starter: `const n = 4;
// TODO: const label = n % 2 === 0 ? "even" : "odd"
const label = "";
console.log(label);`,
    expectedOutput: ["even"],
    hint: "const label = n % 2 === 0 ? \"even\" : \"odd\";",
  },
  {
    title: "FizzBuzz",
    instruction:
      "Classic FizzBuzz! Loop i from 1 to 15. Print `\"FizzBuzz\"` for multiples of both 3 and 5, `\"Fizz\"` for 3, `\"Buzz\"` for 5, otherwise the number.",
    starter: `for (let i = 1; i <= 15; i++) {
  // TODO: FizzBuzz logic
  console.log(i);
}`,
    expectedOutput: ["Fizz", "Buzz", "FizzBuzz"],
    hint: "if (i%15===0) console.log(\"FizzBuzz\"); else if (i%3===0) console.log(\"Fizz\"); else if (i%5===0) console.log(\"Buzz\"); else console.log(i);",
  },
];
