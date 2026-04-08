import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans",
  description:
    "Everything on uByte tutorials is free. Upgrade to Pro for extra help like tutorial hints and faster support.",
  keywords: [...SITE_KEYWORDS, "coding course pricing", "programming subscription", "uByte pro", "learn to code free"],
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/pricing"),
    title: "uByte Pricing — Free & Pro Plans",
    description:
      "Everything is free to learn. Upgrade to Pro for tutorial help when you need it.",
    siteName: APP_NAME,
    images: [{ url: absoluteUrl("/api/og?title=Pricing&description=Free+and+Pro+plans+for+interactive+coding+tutorials"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte Pricing — Free & Pro Plans",
    description:
      "Everything free — tutorials first. Upgrade to Pro for in-context help.",
    images: [absoluteUrl("/api/og?title=Pricing&description=Free+and+Pro+plans+for+interactive+coding+tutorials")],
  },
};
import {
  MONTHLY_PRICE_CENTS,
  YEARLY_PRICE_CENTS,
} from "@/lib/plans";
import PricingClient from "./PricingClient";
import { FAQ_ITEMS, FREE_FEATURES, PRO_FEATURES } from "./content";

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Pricing — uByte",
    description:
      "Compare free and Pro plans for uByte interactive coding tutorials.",
    url: absoluteUrl("/pricing"),
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: BASE_URL },
    mainEntity: {
      "@type": "Product",
      name: "uByte Pro",
      description:
        "Tutorial hints and premium help for developers who want support without leaving the lesson.",
      offers: [
        {
          "@type": "Offer",
          name: "Monthly",
          price: (MONTHLY_PRICE_CENTS / 100).toFixed(2),
          priceCurrency: "USD",
          url: absoluteUrl("/pricing"),
        },
        {
          "@type": "Offer",
          name: "Yearly",
          price: (YEARLY_PRICE_CENTS / 100).toFixed(2),
          priceCurrency: "USD",
          url: absoluteUrl("/pricing"),
        },
      ],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.filter((item) => item.q !== "Who processes payments?").map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PricingClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only">
        <h1>uByte Pricing — Free and Pro Plans</h1>
        <p>
          uByte offers interactive coding tutorials across 9 languages: Go, Python,
          JavaScript, TypeScript, Java, Rust, C++, C#, and SQL. All tutorials are free
          for every user. Upgrade to Pro for tutorial hints and extra help when you want
          support without leaving the lesson.
        </p>

        <section>
          <h2>Free Plan</h2>
          <p>Get started at no cost. Free forever.</p>
          <ul>
            {FREE_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Pro Plan</h2>
          <p>
            Starting at ${(MONTHLY_PRICE_CENTS / 100).toFixed(2)}/month or $
            {(YEARLY_PRICE_CENTS / 100).toFixed(2)}/year.
          </p>
          <ul>
            {PRO_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Frequently Asked Questions</h2>
          {FAQ_ITEMS.filter((item) => item.q !== "Who processes payments?").map((item) => (
            <div key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </section>

        <nav>
          <h2>Explore uByte</h2>
          <ul>
            <li><Link href="/tutorial/go">Go Tutorials</Link></li>
            <li><Link href="/tutorial/python">Python Tutorials</Link></li>
            <li><Link href="/tutorial/javascript">JavaScript Tutorials</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/help">Help Center</Link></li>
          </ul>
        </nav>
      </article>
    </>
  );
}
