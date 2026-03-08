import type { LanguageConfig, SupportedLanguage } from "./types";
import { highlightGo } from "@/lib/highlight-go";
import { highlightPython } from "@/lib/highlight-python";
import { highlightJavaScript } from "@/lib/highlight-javascript";
import { highlightCpp } from "@/lib/highlight-cpp";
import { highlightJava } from "@/lib/highlight-java";
import { highlightRust } from "@/lib/highlight-rust";

export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  go: {
    id: "go",
    name: "Go",
    slug: "go",
    contentDir: "content/go",
    defaultStarter: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// TODO\n}',
    fileExtension: ".go",
    seo: {
      defaultTitle: "uByte — Learn Go Programming",
      defaultDescription: "Master Go from the ground up: variables, concurrency, and APIs. Interactive lessons with runnable code and instant feedback. Start with free intro tutorials, unlock the full track with Pro.",
      keywords: [
        "Go programming language",
        "Golang tutorial",
        "learn Go online",
        "Go for beginners",
        "free Go course",
        "interactive Go tutorial",
        "Go variables",
        "Go functions",
        "Go goroutines",
        "Go syntax",
        "learn Golang free",
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
      defaultTitle: "uByte — Learn Python Programming",
      defaultDescription: "From basics to modules and async. Hands-on Python lessons with a built-in editor and instant runs. Free intro lessons; Pro unlocks the full curriculum.",
      keywords: [
        "Python programming",
        "Learn Python",
        "Python tutorial",
        "Python for beginners",
        "free Python course",
        "interactive Python",
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
      defaultTitle: "uByte — Learn C++ Programming",
      defaultDescription: "C++ fundamentals, I/O, and modern patterns. Learn by doing with in-browser coding and feedback. Free starter tutorials; go further with Pro.",
      keywords: [
        "C++ programming",
        "Learn C++",
        "C++ tutorial",
        "C++ for beginners",
        "free C++ course",
        "interactive C++",
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
      defaultTitle: "uByte — Learn JavaScript",
      defaultDescription: "Core JS, the DOM, and Node-style modules. Bite-sized lessons with runnable examples. Try free lessons first; Pro opens the full path.",
      keywords: [
        "JavaScript",
        "Learn JavaScript",
        "JS tutorial",
        "JavaScript for beginners",
        "free JavaScript course",
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
      defaultTitle: "uByte — Learn Java",
      defaultDescription: "Java from syntax to interfaces and concurrency. Step-by-step tutorials with runnable code. Free intro; Pro for the complete track.",
      keywords: [
        "Java programming",
        "Learn Java",
        "Java tutorial",
        "Java for beginners",
        "free Java course",
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
      defaultTitle: "uByte — Learn Rust",
      defaultDescription: "Ownership, borrowing, and fearless concurrency. Structured Rust lessons with in-browser coding. Free start; Pro for the full journey.",
      keywords: [
        "Rust programming",
        "Learn Rust",
        "Rust tutorial",
        "Rust for beginners",
        "free Rust course",
        "uByte",
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
