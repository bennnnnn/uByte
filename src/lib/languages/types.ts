/** Supported programming languages for tutorials and practice */
export type SupportedLanguage = "go" | "python" | "cpp" | "javascript" | "java" | "rust" | "csharp";

/** Configuration for a language's tutorials and code execution */
export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  slug: string;
  contentDir: string;
  defaultStarter: string;
  fileExtension: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
  };
}
