import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans",
  description:
    "uByte is free — all tutorials, all interview prep problems, and all certification exams across 9 languages. Upgrade to Pro for AI hints, code review, and interview debriefs.",
  keywords: [...SITE_KEYWORDS, "coding course pricing", "programming subscription", "uByte pro", "learn to code free"],
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/pricing"),
    title: "uByte Pricing — Free & Pro Plans",
    description:
      "All tutorials, all problems, and certifications are free. Upgrade to Pro for AI hints, code review, and interview debriefs across 9 languages.",
    siteName: APP_NAME,
    images: [{ url: absoluteUrl("/api/og?title=Pricing&description=Free+and+Pro+plans+for+interactive+coding+tutorials+and+certifications"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte Pricing — Free & Pro Plans",
    description:
      "Everything free — tutorials, problems, certs. Upgrade to Pro for AI hints and code review.",
    images: [absoluteUrl("/api/og?title=Pricing&description=Free+and+Pro+plans+for+interactive+coding+tutorials+and+certifications")],
  },
};
import {
  MONTHLY_PRICE_CENTS,
  YEARLY_PRICE_CENTS,
} from "@/lib/plans";
import PricingClient from "./PricingClient";

const FREE_FEATURES = [
  "All tutorials — every language, every topic",
  "All interview prep problems — no limits",
  "Certification exams — free for everyone",
  "Verifiable digital certificates",
  "Built-in code editor",
  "9 programming languages",
  "Progress tracking",
];

const PRO_FEATURES = [
  "AI hints when stuck on a tutorial step",
  "AI code review on every practice submission",
  "Interview simulator with AI debrief",
  "Priority support",
  "New AI features as they ship",
];

const FAQ_SEO = [
  {
    q: "What's included in Pro?",
    a: "AI hints when you're stuck on a tutorial step, AI code review on every practice submission, and an interview simulator with AI debrief. All tutorials, problems, and certifications remain free.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings and you'll keep Pro until the end of your billing period. No questions asked.",
  },
  {
    q: "How does the free plan work?",
    a: "Everything is free — all tutorials, all interview prep problems, and all certification exams. Create a free account and start immediately. Upgrade to Pro for AI-powered hints, code review, and interview debriefs.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes — and it's free for everyone. Any user can take timed certification exams. Pass and you earn a verifiable digital certificate with a unique ID you can add to your LinkedIn, resume, or portfolio.",
  },
  {
    q: "Is there a refund policy?",
    a: "If you're not satisfied, contact us within 7 days of subscribing for a full refund. No questions asked.",
  },
];

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Pricing — uByte",
    description:
      "Compare free and Pro plans for uByte interactive coding tutorials, interview prep, and certifications.",
    url: absoluteUrl("/pricing"),
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: BASE_URL },
    mainEntity: {
      "@type": "Product",
      name: "uByte Pro",
      description:
        "Unlimited coding tutorials, interview prep, AI hints, and certification exams across 9 languages.",
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
    mainEntity: FAQ_SEO.map((item) => ({
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
      <article className="sr-only" aria-hidden="true">
        <h1>uByte Pricing — Free and Pro Plans</h1>
        <p>
          uByte offers interactive coding tutorials, interview prep problems, and
          free certification exams across all 9 languages: Go, Python, JavaScript,
          TypeScript, Java, Rust, C++, C#, and SQL. All content is free for every user.
          Upgrade to Pro for AI hints, AI code review, and interview debriefs.
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
          {FAQ_SEO.map((item) => (
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
            <li><Link href="/practice">Interview Prep</Link></li>
            <li><Link href="/certifications">Certifications</Link></li>
            <li><Link href="/daily">Daily Challenge</Link></li>
          </ul>
        </nav>
      </article>
    </>
  );
}
