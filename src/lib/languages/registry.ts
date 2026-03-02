import type { LanguageConfig, SupportedLanguage } from "./types";
import { highlightGo } from "@/lib/highlight-go";

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
};

/** Get highlighter function for a language (client-side syntax highlighting) */
export function getHighlighter(lang: SupportedLanguage): (code: string) => string {
  switch (lang) {
    case "go":
      return highlightGo;
    case "python":
    case "cpp":
      // Placeholder: return passthrough (no highlighting) until we add highlighters
      return (code: string) =>
        code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
    default:
      return (code: string) => code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
