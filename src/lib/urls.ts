import type { SupportedLanguage } from "./languages/types";

/**
 * Build tutorial URL. Used everywhere links are generated for consistency and SEO.
 */
export function tutorialUrl(
  lang: SupportedLanguage | string,
  slug: string,
  step?: number
): string {
  const base = `/${lang}/${slug}`;
  return step != null ? `${base}?step=${step}` : base;
}

/**
 * Build absolute canonical URL for a tutorial (SEO)
 */
export function tutorialCanonicalUrl(
  baseUrl: string,
  lang: SupportedLanguage | string,
  slug: string
): string {
  return `${baseUrl.replace(/\/$/, "")}/${lang}/${slug}`;
}
