import { APP_NAME, BASE_URL } from "./constants";

type BreadcrumbItem = { name: string; path: string };
type FaqItem = { question: string; answer: string };

const baseUrl = BASE_URL.replace(/\/$/, "");

export const SITE_KEYWORDS = [
  "programming tutorials",
  "coding tutorials",
  "interactive coding lessons",
  "learn programming",
  "programming languages",
  "coding interview prep",
  "technical interview prep",
  "programming certification",
  "developer certification",
  "practice coding problems",
  "uByte",
];

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return baseUrl;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildSiteSearchJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
