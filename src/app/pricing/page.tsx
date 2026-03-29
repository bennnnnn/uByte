import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans",
  description:
    "Everything on uByte is free — tutorials, interview prep, and certification exams. Upgrade to Pro for tutorial hints, code feedback, certification exam review, and interview debriefs.",
  keywords: [...SITE_KEYWORDS, "coding course pricing", "programming subscription", "uByte pro", "learn to code free"],
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/pricing"),
    title: "uByte Pricing — Free & Pro Plans",
    description:
      "Everything is free to learn. Upgrade to Pro for hints, code feedback, certification exam review, and interview debriefs.",
    siteName: APP_NAME,
    images: [{ url: absoluteUrl("/api/og?title=Pricing&description=Free+and+Pro+plans+for+interactive+coding+tutorials+and+certifications"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte Pricing — Free & Pro Plans",
    description:
      "Everything free — tutorials, problems, certs. Upgrade to Pro for in-context help and detailed feedback.",
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
  "Tutorial hints when you get stuck",
  "Detailed feedback on every practice submission",
  "Question-by-question certification exam review",
  "Mock interview simulator with a personalized debrief",
  "Priority support",
];

const FAQ_SEO = [
  {
    q: "What does Pro actually give me?",
    a: "Pro is the help layer. When you get stuck in a tutorial or practice problem, you can ask for a hint without leaving the page. After you submit code, you get detailed feedback on what to improve. After a certification exam, you can review every question with explanations. And in the interview simulator, you get a personalized debrief so you know exactly what to work on next.",
  },
  {
    q: "Why do people upgrade if everything is already free?",
    a: "Because the content is free, but time is not. Pro helps you stay in flow with hints, faster feedback, certification exam review, and interview breakdowns right where you're already practicing.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings and you'll keep Pro until the end of your billing period. No questions asked.",
  },
  {
    q: "How does the free plan work?",
    a: "Everything is free — all tutorials across 9 languages, all interview prep problems, and all certification exams. Create a free account and start coding immediately. Upgrade only if you want the extra help layer.",
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
        "Tutorial hints, detailed code feedback, certification exam review, and interview debriefs for developers who want help without leaving the lesson.",
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
          Upgrade to Pro for tutorial hints, code feedback, certification exam review,
          and interview debriefs when you want extra help.
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
