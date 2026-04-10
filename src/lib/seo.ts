import { APP_NAME, BASE_URL } from "./constants";

type BreadcrumbItem = { name: string; path: string };
type FaqItem = { question: string; answer: string };

const baseUrl = BASE_URL.replace(/\/$/, "");

/**
 * Concise, deduplicated keywords for `<meta name="keywords">`.
 * Avoids repetitive or “comparison spam” phrases that add no crawl value.
 */
export const SITE_KEYWORDS = [
  "uByte",
  "interactive coding tutorials",
  "learn to code online",
  "learn programming free",
  "programming tutorials",
  "coding tutorials",
  "browser code editor",
  "run code in browser",
  "Go programming tutorial",
  "Python tutorial online",
  "JavaScript tutorial",
  "TypeScript tutorial",
  "Java tutorial",
  "Rust tutorial",
  "C++ tutorial",
  "C# tutorial",
  "SQL tutorial",
  "interactive programming lessons",
  "free coding lessons",
  "online programming course",
];

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return baseUrl;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Canonical site origin (no trailing slash), safe for `metadataBase`. */
export function siteOrigin(): string {
  return baseUrl;
}

/** Hostname only (e.g. `www.ubyte.dev`) for `robots.txt` `Host:` when supported. */
export function siteHost(): string {
  try {
    return new URL(baseUrl).host;
  } catch {
    return "www.ubyte.dev";
  }
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

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.png"),
    sameAs: [],
    description:
      "uByte offers interactive programming tutorials with free lessons and optional paid hints for Go, Python, JavaScript, Java, Rust, C++, C#, TypeScript, and SQL.",
  };
}

export function buildCourseJsonLd({
  name,
  description,
  url,
  lessonCount,
}: {
  name: string;
  description: string;
  url: string;
  lessonCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: absoluteUrl(url),
    provider: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl("/"),
    },
    ...(lessonCount !== undefined && {
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${Math.ceil(lessonCount * 5)}M`,
      },
    }),
  };
}

export function buildArticleJsonLd({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image,
}: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: absoluteUrl(url),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(image && { image }),
    author: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl("/"),
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png") },
    },
  };
}
