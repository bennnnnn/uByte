/** Supported programming languages for tutorials */
export type SupportedLanguage = "go" | "python" | "cpp";

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
