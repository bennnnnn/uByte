import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { APP_NAME } from "@/lib/constants";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — uByte",
  description:
    "Get help with your uByte account, billing, certifications, or send feedback. We typically respond within one business day.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/contact"),
    title: "Contact uByte Support",
    description: "Reach the uByte team for account help, billing questions, bug reports, or feature requests. We respond within one business day.",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: "Contact uByte Support",
    description: "Reach the uByte team for account help, billing questions, or feature requests.",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only">
        <h1>Contact uByte — Support, Feedback, and Questions</h1>
        <p>
          Get in touch with the uByte team. We typically respond within one
          business day. You can reach us for general questions, billing and
          subscription help, bug reports, feature requests, certificate or exam
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
            <li>Certificate or exam issue</li>
            <li>Account problem</li>
            <li>Privacy or data request</li>
          </ul>
        </section>
      </article>
    </>
  );
}
