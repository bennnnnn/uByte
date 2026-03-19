import type { LanguageConfig, SupportedLanguage } from "./types";
import { highlightGo } from "@/lib/highlight-go";
import { highlightPython } from "@/lib/highlight-python";
import { highlightJavaScript } from "@/lib/highlight-javascript";
import { highlightCpp } from "@/lib/highlight-cpp";
import { highlightJava } from "@/lib/highlight-java";
import { highlightRust } from "@/lib/highlight-rust";
import { highlightCsharp } from "@/lib/highlight-csharp";
import { highlightTypeScript } from "@/lib/highlight-typescript";
import { highlightSql } from "@/lib/highlight-sql";

export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  go: {
    id: "go",
    name: "Go",
    slug: "go",
    contentDir: "content/go",
    defaultStarter: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// TODO\n}',
    fileExtension: ".go",
    seo: {
      defaultTitle: "Learn Go Programming — Free Interactive Golang Tutorial",
      defaultDescription: "Master Go (Golang) from the ground up with hands-on, interactive tutorials. Learn variables, functions, goroutines, channels, structs, interfaces, and APIs — write and run real Go code in your browser. Free beginner lessons included.",
      keywords: [
        "Go programming language",
        "Golang tutorial",
        "learn Go online",
        "Go for beginners",
        "free Go course",
        "interactive Go tutorial",
        "Go variables tutorial",
        "Go functions tutorial",
        "Go goroutines tutorial",
        "Go concurrency tutorial",
        "Go structs and interfaces",
        "Golang online course",
        "learn Golang free online",
        "Go programming for beginners",
        "Golang coding practice",
        "Go syntax guide",
        "Go error handling",
        "Go interview prep",
        "Golang certification",
        "uByte",
      ],
    },
  },
  python: {
    id: "python",
    name: "Python",
    slug: "python",
    contentDir: "content/python",
    defaultStarter: '# TODO: Write your Python code here\nprint("Hello, World!")',
    fileExtension: ".py",
    seo: {
      defaultTitle: "Learn Python Programming — Free Interactive Python Tutorial",
      defaultDescription: "Learn Python step by step with interactive, hands-on tutorials. Cover variables, data types, loops, functions, classes, modules, error handling, and async — write and run real Python code in your browser. Free beginner lessons included.",
      keywords: [
        "Python programming",
        "Learn Python",
        "Python tutorial",
        "Python for beginners",
        "free Python course",
        "interactive Python tutorial",
        "Python variables tutorial",
        "Python functions tutorial",
        "Python loops tutorial",
        "Python classes tutorial",
        "Python data types",
        "Python online course free",
        "learn Python online free",
        "Python programming for beginners",
        "Python coding practice",
        "Python error handling",
        "Python modules and packages",
        "Python interview prep",
        "Python certification",
        "Python exercises online",
        "uByte",
      ],
    },
  },
  cpp: {
    id: "cpp",
    name: "C++",
    slug: "cpp",
    contentDir: "content/cpp",
    defaultStarter: '#include <iostream>\n\nint main() {\n    // TODO\n    return 0;\n}',
    fileExtension: ".cpp",
    seo: {
      defaultTitle: "Learn C++ Programming — Free Interactive C++ Tutorial",
      defaultDescription: "Learn C++ from scratch with interactive, hands-on tutorials. Cover variables, data types, loops, functions, pointers, classes, templates, and modern C++ patterns — compile and run real C++ code in your browser. Free beginner lessons included.",
      keywords: [
        "C++ programming",
        "Learn C++",
        "C++ tutorial",
        "C++ for beginners",
        "free C++ course",
        "interactive C++ tutorial",
        "C++ variables tutorial",
        "C++ functions tutorial",
        "C++ pointers tutorial",
        "C++ classes and objects",
        "C++ data types",
        "C++ online course free",
        "learn C++ online free",
        "C++ programming for beginners",
        "C++ coding practice",
        "C++ error handling",
        "C++ interview prep",
        "C++ certification",
        "C++ exercises online",
        "uByte",
      ],
    },
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    slug: "javascript",
    contentDir: "content/javascript",
    defaultStarter: '// Your code here\nconsole.log("Hello, World!");',
    fileExtension: ".js",
    seo: {
      defaultTitle: "Learn JavaScript — Free Interactive JavaScript Tutorial",
      defaultDescription: "Learn JavaScript step by step with interactive, hands-on tutorials. Cover variables, functions, arrays, objects, DOM manipulation, async/await, and modules — write and run real JavaScript code in your browser. Free beginner lessons included.",
      keywords: [
        "JavaScript",
        "Learn JavaScript",
        "JavaScript tutorial",
        "JS tutorial",
        "JavaScript for beginners",
        "free JavaScript course",
        "interactive JavaScript tutorial",
        "JavaScript variables tutorial",
        "JavaScript functions tutorial",
        "JavaScript arrays tutorial",
        "JavaScript objects tutorial",
        "JavaScript DOM tutorial",
        "JavaScript online course free",
        "learn JavaScript online free",
        "JavaScript programming for beginners",
        "JavaScript coding practice",
        "JavaScript error handling",
        "JavaScript interview prep",
        "JavaScript certification",
        "JavaScript exercises online",
        "uByte",
      ],
    },
  },
  java: {
    id: "java",
    name: "Java",
    slug: "java",
    contentDir: "content/java",
    defaultStarter: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
    fileExtension: ".java",
    seo: {
      defaultTitle: "Learn Java Programming — Free Interactive Java Tutorial",
      defaultDescription: "Learn Java step by step with interactive, hands-on tutorials. Cover variables, data types, loops, classes, inheritance, interfaces, collections, and concurrency — compile and run real Java code in your browser. Free beginner lessons included.",
      keywords: [
        "Java programming",
        "Learn Java",
        "Java tutorial",
        "Java for beginners",
        "free Java course",
        "interactive Java tutorial",
        "Java variables tutorial",
        "Java functions tutorial",
        "Java classes tutorial",
        "Java OOP tutorial",
        "Java data types",
        "Java online course free",
        "learn Java online free",
        "Java programming for beginners",
        "Java coding practice",
        "Java error handling",
        "Java collections tutorial",
        "Java interview prep",
        "Java certification",
        "Java exercises online",
        "uByte",
      ],
    },
  },
  rust: {
    id: "rust",
    name: "Rust",
    slug: "rust",
    contentDir: "content/rust",
    defaultStarter: 'fn main() {\n    // Your code here\n    println!("Hello, World!");\n}',
    fileExtension: ".rs",
    seo: {
      defaultTitle: "Learn Rust Programming — Free Interactive Rust Tutorial",
      defaultDescription: "Learn Rust from scratch with interactive, hands-on tutorials. Cover variables, ownership, borrowing, structs, enums, pattern matching, traits, error handling, and concurrency — compile and run real Rust code in your browser. Free beginner lessons included.",
      keywords: [
        "Rust programming",
        "Learn Rust",
        "Rust tutorial",
        "Rust for beginners",
        "free Rust course",
        "interactive Rust tutorial",
        "Rust variables tutorial",
        "Rust ownership tutorial",
        "Rust borrowing tutorial",
        "Rust structs and enums",
        "Rust traits tutorial",
        "Rust online course free",
        "learn Rust online free",
        "Rust programming for beginners",
        "Rust coding practice",
        "Rust error handling",
        "Rust concurrency tutorial",
        "Rust interview prep",
        "Rust certification",
        "Rust exercises online",
        "uByte",
      ],
    },
  },
  csharp: {
    id: "csharp",
    name: "C#",
    slug: "csharp",
    contentDir: "content/csharp",
    defaultStarter: 'using System;\n\nclass Program {\n    static void Main() {\n        // Your code here\n        Console.WriteLine("Hello, World!");\n    }\n}',
    fileExtension: ".cs",
    seo: {
      defaultTitle: "Learn C# Programming — Free Interactive C# Tutorial",
      defaultDescription: "Learn C# step by step with interactive, hands-on tutorials. Cover variables, data types, classes, LINQ, async/await, interfaces, and .NET patterns — compile and run real C# code in your browser. Free beginner lessons included.",
      keywords: [
        "C# programming", "Learn C#", "C# tutorial", "C# for beginners", "free C# course",
        "interactive C# tutorial", "C# classes tutorial", "C# LINQ tutorial", "C# async await tutorial",
        "C# online course free", "learn C# online free", "C# interview prep", "C# certification", "uByte",
      ],
    },
  },
  typescript: {
    id: "typescript",
    name: "TypeScript",
    slug: "typescript",
    contentDir: "content/typescript",
    defaultStarter: '// Your TypeScript code here\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);',
    fileExtension: ".ts",
    seo: {
      defaultTitle: "Learn TypeScript — Free Interactive TypeScript Tutorial",
      defaultDescription: "Master TypeScript from scratch with hands-on, interactive tutorials. Learn static types, interfaces, generics, decorators, and advanced type patterns — write and run real TypeScript code in your browser. Free beginner lessons included.",
      keywords: [
        "TypeScript tutorial", "Learn TypeScript", "TypeScript for beginners", "free TypeScript course",
        "TypeScript types", "TypeScript interfaces", "TypeScript generics", "TypeScript online course free",
        "learn TypeScript online free", "TypeScript interview prep", "TypeScript certification",
        "TypeScript vs JavaScript", "TypeScript exercises online", "uByte",
      ],
    },
  },
  sql: {
    id: "sql",
    name: "SQL",
    slug: "sql",
    contentDir: "content/sql",
    defaultStarter: "-- Write your SQL query here\nSELECT 'Hello, World!' AS message;",
    fileExtension: ".sql",
    seo: {
      defaultTitle: "Learn SQL — Free Interactive SQL Tutorial",
      defaultDescription: "Learn SQL from scratch with hands-on, interactive tutorials. Master SELECT queries, JOINs, aggregates, subqueries, indexes, and transactions — write and run real SQL in your browser. Free beginner lessons included.",
      keywords: [
        "SQL tutorial", "Learn SQL", "SQL for beginners", "free SQL course",
        "SQL SELECT tutorial", "SQL JOIN tutorial", "SQL aggregate functions", "SQL subqueries",
        "SQL online course free", "learn SQL online free", "SQL interview prep", "SQL certification",
        "SQLite tutorial", "database tutorial", "uByte",
      ],
    },
  },
};

/** Get highlighter function for a language (client-side syntax highlighting) */
export function getHighlighter(lang: SupportedLanguage): (code: string) => string {
  switch (lang) {
    case "go":
      return highlightGo;
    case "python":
      return highlightPython;
    case "javascript":
      return highlightJavaScript;
    case "cpp":
      return highlightCpp;
    case "java":
      return highlightJava;
    case "rust":
      return highlightRust;
    case "csharp":
      return highlightCsharp;
    case "typescript":
      return highlightTypeScript;
    case "sql":
      return highlightSql;
    default:
      return (code: string) =>
        code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

export function getLanguageConfig(lang: string): LanguageConfig | null {
  const k = lang as SupportedLanguage;
  return LANGUAGES[k] ?? null;
}

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return lang in LANGUAGES;
}

/** Safely resolve an unknown lang value to a SupportedLanguage, defaulting to "go". */
export function resolveLanguage(lang: unknown): SupportedLanguage {
  return typeof lang === "string" && isSupportedLanguage(lang) ? lang : "go";
}

/** Ordered list of all supported language keys. Use this instead of hardcoding arrays. */
export const ALL_LANGUAGE_KEYS: SupportedLanguage[] = Object.keys(LANGUAGES) as SupportedLanguage[];

export function getAllLanguageSlugs(): string[] {
  return Object.values(LANGUAGES).map((l) => l.slug);
}
