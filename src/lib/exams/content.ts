// Exam detail content for the public exam landing pages.
// Used so users can read full info before upgrading to take the exam.

import type { ExamLang } from "./config";
import { EXAM_DURATION_MINUTES, EXAM_SIZE } from "./config";

export interface ExamConfigNumbers {
  examSize: number;
  examDurationMinutes: number;
}

export interface ExamDetailContent {
  /** Short tagline under the title */
  tagline: string;
  /** 1–2 sentences: what this exam validates */
  objective: string;
  /** Bullet list of topic areas covered */
  topics: string[];
  /** Bullet list of rules (time, pass threshold, behavior) */
  rules: string[];
  /** Optional: who it's for */
  audience?: string;
  /** Q&A for the FAQ tab */
  faq?: { question: string; answer: string }[];
}

function buildGoContent(cfg: ExamConfigNumbers): ExamDetailContent {
  const { examSize, examDurationMinutes } = cfg;
  const passMin = Math.ceil((examSize * 70) / 100);
  return {
    tagline: "Validate your Go fundamentals with a timed, multiple-choice assessment.",
    objective:
      "This exam checks that you understand core Go concepts: syntax, types, concurrency, and standard library usage. Passing demonstrates readiness for Go-focused roles or further study.",
    topics: [
      "Variables, types, and zero values",
      "Functions and multiple return values",
      "Structs, methods, and interfaces",
      "Slices, arrays, and the append/copy built-ins",
      "Maps and iteration with range",
      "Pointers and dereferencing",
      "Goroutines, channels, and select",
      "Error handling: error type, defer, panic, recover",
      "Packages, imports, and visibility (capitalization)",
      "Context and net/http basics",
      "Testing (go test) and tooling (gofmt, go mod)",
    ],
    rules: buildRules(examSize, examDurationMinutes, passMin),
    audience: "Developers who have completed the Go tutorials or have equivalent experience.",
    faq: buildFaq(examSize, examDurationMinutes, passMin),
  };
}

function buildPythonContent(cfg: ExamConfigNumbers): ExamDetailContent {
  const { examSize, examDurationMinutes } = cfg;
  const passMin = Math.ceil((examSize * 70) / 100);
  return {
    tagline: "Prove your Python fundamentals with a timed, multiple-choice assessment.",
    objective:
      "This exam validates your understanding of Python syntax, data structures, OOP, and the standard library. Passing shows you're comfortable building real applications in Python.",
    topics: [
      "Variables, data types, and type conversions",
      "Strings: slicing, formatting, and methods",
      "Lists, tuples, sets, and dictionaries",
      "Control flow: if/elif/else, for, while, comprehensions",
      "Functions, *args, **kwargs, and lambda",
      "Classes, inheritance, and dunder methods",
      "Modules, packages, and imports",
      "File I/O and context managers (with statement)",
      "Exception handling: try/except/finally",
      "Decorators and generators",
      "Common standard library modules (os, json, re, collections)",
    ],
    rules: buildRules(examSize, examDurationMinutes, passMin),
    audience: "Developers who have completed the Python tutorials or have equivalent scripting experience.",
    faq: buildFaq(examSize, examDurationMinutes, passMin),
  };
}

function buildJavaScriptContent(cfg: ExamConfigNumbers): ExamDetailContent {
  const { examSize, examDurationMinutes } = cfg;
  const passMin = Math.ceil((examSize * 70) / 100);
  return {
    tagline: "Test your JavaScript knowledge with a timed, multiple-choice assessment.",
    objective:
      "This exam covers core JavaScript from ES6+ syntax to async patterns. Passing shows you can write modern, idiomatic JavaScript for the browser and Node.js.",
    topics: [
      "Variables: let, const, var and hoisting",
      "Primitive types, type coercion, and equality (== vs ===)",
      "Functions, arrow functions, and closures",
      "Objects, prototypes, and the class syntax",
      "Arrays: map, filter, reduce, and destructuring",
      "Promises, async/await, and the event loop",
      "Template literals and tagged templates",
      "Modules (import/export) and module resolution",
      "Error handling: try/catch and custom errors",
      "DOM basics and event handling",
      "JSON, fetch, and working with APIs",
    ],
    rules: buildRules(examSize, examDurationMinutes, passMin),
    audience: "Developers who have completed the JavaScript tutorials or have equivalent web development experience.",
    faq: buildFaq(examSize, examDurationMinutes, passMin),
  };
}

function buildJavaContent(cfg: ExamConfigNumbers): ExamDetailContent {
  const { examSize, examDurationMinutes } = cfg;
  const passMin = Math.ceil((examSize * 70) / 100);
  return {
    tagline: "Validate your Java fundamentals with a timed, multiple-choice assessment.",
    objective:
      "This exam tests your grasp of Java's type system, OOP principles, collections, and concurrency basics. Passing shows readiness for enterprise Java development.",
    topics: [
      "Primitive types, wrappers, and autoboxing",
      "Strings, StringBuilder, and String interning",
      "Classes, interfaces, abstract classes, and enums",
      "Inheritance, polymorphism, and method overriding",
      "Generics and bounded type parameters",
      "Collections: List, Set, Map, and iteration",
      "Exception handling: checked vs unchecked, try-with-resources",
      "Lambda expressions and functional interfaces",
      "Streams API: map, filter, collect",
      "Concurrency basics: threads, Runnable, synchronized",
      "Packages, access modifiers, and the module system",
    ],
    rules: buildRules(examSize, examDurationMinutes, passMin),
    audience: "Developers who have completed the Java tutorials or have equivalent OOP experience.",
    faq: buildFaq(examSize, examDurationMinutes, passMin),
  };
}

function buildRustContent(cfg: ExamConfigNumbers): ExamDetailContent {
  const { examSize, examDurationMinutes } = cfg;
  const passMin = Math.ceil((examSize * 70) / 100);
  return {
    tagline: "Prove your Rust knowledge with a timed, multiple-choice assessment.",
    objective:
      "This exam covers Rust's ownership model, type system, error handling, and concurrency primitives. Passing demonstrates you can write safe, performant Rust code.",
    topics: [
      "Ownership, borrowing, and lifetimes",
      "Primitive types, tuples, and arrays",
      "Structs, enums, and pattern matching",
      "Traits, generics, and trait bounds",
      "Error handling: Result, Option, and the ? operator",
      "Collections: Vec, HashMap, HashSet",
      "Closures, iterators, and functional patterns",
      "Smart pointers: Box, Rc, Arc, RefCell",
      "Concurrency: threads, channels, Mutex",
      "Modules, crates, and the use keyword",
      "String types: String vs &str",
    ],
    rules: buildRules(examSize, examDurationMinutes, passMin),
    audience: "Developers who have completed the Rust tutorials or have equivalent systems programming experience.",
    faq: buildFaq(examSize, examDurationMinutes, passMin),
  };
}

function buildCppContent(cfg: ExamConfigNumbers): ExamDetailContent {
  const { examSize, examDurationMinutes } = cfg;
  const passMin = Math.ceil((examSize * 70) / 100);
  return {
    tagline: "Test your C++ fundamentals with a timed, multiple-choice assessment.",
    objective:
      "This exam validates your understanding of C++ from memory management to modern C++ features. Passing shows you can write efficient, correct C++ code.",
    topics: [
      "Variables, fundamental types, and type casting",
      "Pointers, references, and memory management",
      "Classes, constructors, destructors, and RAII",
      "Inheritance, virtual functions, and polymorphism",
      "Templates and generic programming",
      "STL containers: vector, map, set, unordered_map",
      "STL algorithms and iterators",
      "Smart pointers: unique_ptr, shared_ptr, weak_ptr",
      "Move semantics and rvalue references",
      "Lambda expressions and std::function",
      "Exception handling and error management",
    ],
    rules: buildRules(examSize, examDurationMinutes, passMin),
    audience: "Developers who have completed the C++ tutorials or have equivalent systems programming experience.",
    faq: buildFaq(examSize, examDurationMinutes, passMin),
  };
}

function buildRules(examSize: number, examDurationMinutes: number, passMin: number): string[] {
  return [
    `${examSize} multiple-choice questions.`,
    `${examDurationMinutes} minutes. The timer starts when you begin and cannot be paused.`,
    `You need 70% or higher (${passMin} correct answers) to pass.`,
    "Questions and answer order are randomized each attempt.",
    "One attempt per exam session. You can retake the exam in a new session after completion.",
    "Passing earns a shareable certificate.",
  ];
}

function buildFaq(examSize: number, examDurationMinutes: number, passMin: number): { question: string; answer: string }[] {
  return [
    {
      question: "How long is the exam?",
      answer: `You have ${examDurationMinutes} minutes from the moment you start. The timer cannot be paused. Use your time wisely and try to answer every question.`,
    },
    {
      question: "How many questions are there?",
      answer: `Each attempt has ${examSize} multiple-choice questions. They are drawn at random from a larger pool, so each attempt can feel different.`,
    },
    {
      question: "What score do I need to pass?",
      answer: `You need 70% or higher (at least ${passMin} correct answers out of ${examSize}) to pass and earn your certificate.`,
    },
    {
      question: "Can I retake the exam?",
      answer: "Yes. After you complete an attempt (submit or run out of time), you can start a new attempt. Questions and answer order are randomized each time.",
    },
    {
      question: "Do I get a certificate?",
      answer: "Yes. When you pass with 70% or higher, you receive a shareable certificate that you can link to from your profile or resume.",
    },
    {
      question: "What if I run out of time?",
      answer: "Your answers are automatically submitted when the timer ends. You'll see your score and whether you passed. You can start a new attempt anytime.",
    },
  ];
}

export function getExamDetailContent(
  lang: string,
  config?: ExamConfigNumbers
): ExamDetailContent | null {
  const cfg = config ?? { examSize: EXAM_SIZE, examDurationMinutes: EXAM_DURATION_MINUTES };
  switch (lang) {
    case "go": return buildGoContent(cfg);
    case "python": return buildPythonContent(cfg);
    case "javascript": return buildJavaScriptContent(cfg);
    case "java": return buildJavaContent(cfg);
    case "rust": return buildRustContent(cfg);
    case "cpp": return buildCppContent(cfg);
    default: return null;
  }
}

export { EXAM_DURATION_MINUTES, EXAM_SIZE };
