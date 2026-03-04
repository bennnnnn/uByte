import type { SupportedLanguage } from "./languages/types";

const TUTORIAL_PREFIX = "/tutorial";

/**
 * Build tutorial URL. Used everywhere links are generated for consistency and SEO.
 * e.g. /tutorial/cpp/getting-started
 */
export function tutorialUrl(
  lang: SupportedLanguage | string,
  slug: string,
  step?: number
): string {
  const base = `${TUTORIAL_PREFIX}/${lang}/${slug}`;
  return step != null ? `${base}?step=${step}` : base;
}

/**
 * Build URL for language tutorials landing (e.g. /tutorial/cpp).
 */
export function tutorialLangUrl(lang: SupportedLanguage | string): string {
  return `${TUTORIAL_PREFIX}/${lang}`;
}

/**
 * Build absolute canonical URL for a tutorial (SEO)
 */
export function tutorialCanonicalUrl(
  baseUrl: string,
  lang: SupportedLanguage | string,
  slug: string
): string {
  return `${baseUrl.replace(/\/$/, "")}${TUTORIAL_PREFIX}/${lang}/${slug}`;
}
