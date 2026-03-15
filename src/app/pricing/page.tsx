import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import {
  FREE_TUTORIAL_LIMIT,
  MAX_FREE_PROBLEMS,
  MONTHLY_PRICE_CENTS,
  YEARLY_PRICE_CENTS,
} from "@/lib/plans";
import PricingClient from "./PricingClient";

const FREE_FEATURES = [
  `${FREE_TUTORIAL_LIMIT} tutorials per language`,
  `${MAX_FREE_PROBLEMS} interview prep problems (2/day)`,
  "Built-in code editor",
  "7 programming languages",
  "Progress tracking",
];

const PRO_FEATURES = [
  "Unlimited tutorials — all languages",
  "Unlimited interview prep problems",
  "AI code feedback on every step",
  "Certification exams with certificates",
  "Verifiable digital certificates",
  "Add certs to LinkedIn & resume",
  "New content as it ships",
];

const FAQ_SEO = [
  {
    q: "What's included in Pro?",
    a: "Unlimited tutorials in all 7 languages, unlimited interview prep problems, AI code feedback on every step, and timed certification exams with shareable certificates.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings and you'll keep Pro until the end of your billing period. No questions asked.",
  },
  {
    q: "How does the free plan work?",
    a: `You get ${FREE_TUTORIAL_LIMIT} tutorials per language and ${MAX_FREE_PROBLEMS} interview prep problems (2 new ones unlock daily). Upgrade whenever you're ready for unlimited access and certifications.`,
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. Pro members can take timed certification exams. Pass and you earn a verifiable digital certificate with a unique ID that you can add to your LinkedIn, resume, or portfolio.",
  },
  {
    q: "Is there a refund policy?",
    a: "If you're not satisfied within the first 7 days, contact us and we'll work it out. We want you to be happy.",
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
        "Unlimited coding tutorials, interview prep, AI hints, and certification exams across 7 languages.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PricingClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
        <h1>uByte Pricing — Free and Pro Plans</h1>
        <p>
          uByte offers interactive coding tutorials, interview prep, and
          certification exams across Go, Python, JavaScript, Java, C++, Rust,
          and C#. Start for free and upgrade to Pro when you&apos;re ready for
          unlimited access.
        </p>

        <section>
          <h2>Free Plan</h2>
          <p>Get started at no cost. No credit card required.</p>
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
