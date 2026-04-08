import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { APP_NAME } from "@/lib/constants";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — uByte",
  description:
    "Get help with your uByte account, billing, tutorials, or send feedback. We typically respond within one business day.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/contact"),
    title: "Contact uByte Support",
    description: "Reach the uByte team for account help, billing questions, bug reports, or feature requests. We respond within one business day.",
    siteName: APP_NAME,
    images: [{ url: absoluteUrl("/api/og?title=Contact+uByte&description=Support+for+tutorials+accounts+and+billing"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact uByte Support",
    description: "Reach the uByte team for account help, billing questions, or feature requests.",
    images: [absoluteUrl("/api/og?title=Contact+uByte&description=Support+for+tutorials+accounts+and+billing")],
  },
};

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact uByte",
    description:
      "Contact uByte for tutorial questions, account help, billing support, and product feedback.",
    url: absoluteUrl("/contact"),
    mainEntity: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl("/"),
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@ubyte.dev",
          url: absoluteUrl("/contact"),
          availableLanguage: ["English"],
        },
        {
          "@type": "ContactPoint",
          contactType: "privacy support",
          email: "privacy@ubyte.dev",
          url: absoluteUrl("/contact"),
          availableLanguage: ["English"],
        },
      ],
    },
  };

  return (
    <>
      <script
        async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only">
        <h1>Contact uByte — Support, Feedback, and Questions</h1>
        <p>
          Get in touch with the uByte team. We typically respond within one
          business day. You can reach us for general questions, billing and
          subscription help, bug reports, feature requests, tutorial or lesson
          issues, account problems, privacy and data requests, or anything else.
        </p>

        <section>
          <h2>Contact Methods</h2>
          <ul>
            <li>Email: support@ubyte.dev</li>
            <li>Privacy inquiries: privacy@ubyte.dev</li>
            <li><Link href="/help">Browse the Help Center and FAQ</Link></li>
          </ul>
        </section>

        <section>
          <h2>Common Topics</h2>
          <ul>
            <li>General question</li>
            <li>Billing and subscription</li>
            <li>Bug report</li>
            <li>Feature request</li>
            <li>Tutorial or lesson issue</li>
            <li>Account problem</li>
            <li>Privacy or data request</li>
          </ul>
        </section>
      </article>
    </>
  );
}
