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
      defaultTitle: "uByte — Learn Go Programming for Free",
      defaultDescription: "Learn Go programming for free with uByte. Interactive Golang tutorials for beginners — write and run real Go code in your browser. Start today.",
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
      defaultTitle: "uByte — Learn Python Programming for Free",
      defaultDescription: "Learn Python programming for free with uByte. Interactive Python tutorials for beginners — write and run real Python code in your browser.",
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
      defaultTitle: "uByte — Learn C++ Programming for Free",
      defaultDescription: "Learn C++ programming for free with uByte. Interactive C++ tutorials for beginners — write and run real C++ code in your browser.",
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
      defaultTitle: "uByte — Learn JavaScript for Free",
      defaultDescription: "Learn JavaScript programming for free with uByte. Interactive JS tutorials for beginners — write and run real code in your browser.",
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
      defaultTitle: "uByte — Learn Java for Free",
      defaultDescription: "Learn Java programming for free with uByte. Interactive Java tutorials for beginners — write and run real code in your browser.",
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
      defaultTitle: "uByte — Learn Rust for Free",
      defaultDescription: "Learn Rust programming for free with uByte. Interactive Rust tutorials for beginners — write and run real code in your browser.",
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

export function getAllLanguageSlugs(): string[] {
  return Object.values(LANGUAGES).map((l) => l.slug);
}
