import Link from "next/link";
import ContactClient from "./ContactClient";

export default function ContactPage() {
  return (
    <>
      <ContactClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
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
